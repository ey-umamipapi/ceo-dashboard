import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const NOTION_KEY = process.env.NOTION_API_KEY!
const PULSE_PARENT_ID = '34f812b18c1d81b4bcf4f85e29974561'
const TEMPLATE_ID = '356812b18c1d81d9b3d8c4118e78af94'

const headers = {
  Authorization: `Bearer ${NOTION_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

async function getUserRole(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single()
  return data?.role ?? 'viewer'
}

function richText(content: string, italic = false) {
  return [{ text: { content }, annotations: { italic } }]
}

function h1(text: string) {
  return { object: 'block', type: 'heading_1', heading_1: { rich_text: richText(text) } }
}

function p(text: string, italic = false) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: richText(text, italic) } }
}

function divider() {
  return { object: 'block', type: 'divider', divider: {} }
}

function callout(text: string) {
  return {
    object: 'block', type: 'callout',
    callout: { icon: { emoji: '⚡' }, rich_text: richText(text) },
  }
}

function toggle(summary: string, children: object[]) {
  return {
    object: 'block', type: 'toggle',
    toggle: { rich_text: richText(summary), children },
  }
}

function extractText(richTextArr: { plain_text?: string }[] = []): string {
  return richTextArr.map(t => t.plain_text ?? '').join('').trim()
}

function parseBlocks(blocks: { type: string; [key: string]: unknown }[]): Record<string, string> {
  const SECTION_MAP: Record<string, string> = {
    '🪨 Big Rock': 'bigRock',
    '📈 Progress This Week': 'progress',
    '01 — Leverage': 'leverage',
    '02 — Drag': 'drag',
    '03 — Alignment': 'alignment',
    '04 — One Adjustment': 'adjustment',
  }

  const ITALIC_PROMPTS = [
    'What is the single priority',
    'What did I actually move forward',
    "This is not just",
    'What specifically created the most value',
    'Where did I get pulled below my level',
    'Ops, noise, tasks',
    'Is my big rock still the right priority',
    'Yes / No / Needs adjustment',
    'One decision.',
  ]

  const sections: Record<string, string> = {}
  let currentSection = ''

  for (const block of blocks) {
    const type = block.type as string
    const blockData = block[type] as { rich_text?: { plain_text?: string; annotations?: { italic?: boolean } }[] } | undefined
    const rts = blockData?.rich_text ?? []
    const text = extractText(rts)
    const isItalic = rts.length > 0 && rts[0]?.annotations?.italic === true

    if (type === 'heading_1') {
      const matched = Object.entries(SECTION_MAP).find(([key]) => text.includes(key.replace(/[🪨📈]/g, '').trim()))
      currentSection = matched ? matched[1] : ''
      continue
    }

    if (!currentSection) continue

    if (type === 'paragraph') {
      if (isItalic) continue
      if (ITALIC_PROMPTS.some(p => text.startsWith(p))) continue
      if (!text) continue
      sections[currentSection] = sections[currentSection] ? sections[currentSection] + '\n' + text : text
    }

    if (type === 'callout' && currentSection === 'adjustment') {
      const calloutData = block.callout as { rich_text?: { plain_text?: string }[] } | undefined
      const ct = extractText(calloutData?.rich_text ?? [])
      if (ct) sections['adjustment'] = ct
    }
  }

  return sections
}

// GET /api/notion          → list pulse entries
// GET /api/notion?id=xxx   → fetch parsed content for one entry
export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(supabase, user.id)
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const res = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, { headers })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status })
    const sections = parseBlocks(data.results ?? [])
    return NextResponse.json({ sections })
  }

  const res = await fetch(`https://api.notion.com/v1/blocks/${PULSE_PARENT_ID}/children?page_size=100`, { headers })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status })

  const pages = ((data.results ?? []) as { type: string; id: string; child_page?: { title: string }; created_time: string; last_edited_time: string }[])
    .filter(b => b.type === 'child_page' && b.id.replace(/-/g, '') !== TEMPLATE_ID)
    .map(b => ({
      id: b.id,
      title: b.child_page?.title ?? '',
      created_time: b.created_time,
      last_edited_time: b.last_edited_time,
    }))
    .reverse()

  return NextResponse.json({ pages })
}

// POST /api/notion → create a new pulse entry in Notion
export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(supabase, user.id)
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, bigRock, bigRockStatus, progress, leverage, drag, alignment, adjustment, avoidance, people, constraint } = body

  const children = [
    h1('🪨 Big Rock'),
    p('What is the single priority I\'m building toward right now — and where is it at?', true),
    p(bigRock ?? ''),
    p(`Status: ${bigRockStatus ?? ''}`),
    divider(),
    h1('📈 Progress This Week'),
    p('What did I actually move forward this week — even if it felt small or indirect?', true),
    p(progress ?? ''),
    divider(),
    h1('01 — Leverage'),
    p('What specifically created the most value this week?', true),
    p(leverage ?? ''),
    divider(),
    h1('02 — Drag'),
    p('Where did I get pulled below my level?', true),
    p(drag ?? ''),
    divider(),
    h1('03 — Alignment'),
    p('Is my big rock still the right priority? Yes / No / Needs adjustment — and why.', true),
    p(alignment ?? ''),
    divider(),
    h1('04 — One Adjustment'),
    callout(adjustment ?? ''),
    divider(),
    toggle('🔍 Depth Mode — open monthly or when something feels off', [
      { object: 'block', type: 'heading_2', heading_2: { rich_text: richText('05 — Avoidance') } },
      p('What decision am I avoiding? The thing I\'ve been \'thinking about\' too long.', true),
      p(avoidance ?? ''),
      { object: 'block', type: 'heading_2', heading_2: { rich_text: richText('06 — People') } },
      p('Who am I underleveraging or avoiding right now — and why?', true),
      p(people ?? ''),
      { object: 'block', type: 'heading_2', heading_2: { rich_text: richText('07 — Constraint') } },
      p('What would I stop doing if I had to cut one thing?', true),
      p(constraint ?? ''),
    ]),
  ]

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { page_id: PULSE_PARENT_ID },
      icon: { emoji: '📓' },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children,
    }),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status })
  return NextResponse.json({ id: data.id, url: data.url })
}
