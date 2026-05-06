'use client'

export default function BrandComms() {
  return (
    <div className="page">
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">OP Digital</span><span>Monday.com</span></div>
        <div className="dsb-item"><span style={{ fontSize: 11, color: 'var(--mid)' }}>Website · PR · EDM</span></div>
      </div>

      <div className="panel">
        <div className="ph">
          <span className="pt">OP Digital — PR & EDM</span>
          <a
            href="https://view.monday.com/18398734008-74c38747c9a62e681f7eab1afaf05dc9?r=use1&is_sharable_link=true"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#2980B9', textDecoration: 'none' }}
          >
            ↗ Open in Monday
          </a>
        </div>
        <div className="pb" style={{ padding: 0, overflow: 'hidden', borderRadius: '0 0 8px 8px' }}>
          <iframe
            src="https://view.monday.com/embed/18398734008-74c38747c9a62e681f7eab1afaf05dc9?r=use1"
            width="100%"
            height="600"
            style={{ border: 0, display: 'block' }}
          />
        </div>
      </div>
    </div>
  )
}
