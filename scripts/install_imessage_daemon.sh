#!/bin/bash
# Installs the Koji iMessage relay as a macOS launchd service.
# Run once: bash scripts/install_imessage_daemon.sh

PLIST_LABEL="com.umamipapi.koji-imessage"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_LABEL.plist"
LOG_DIR="$HOME/Library/Logs/HubPapi"

mkdir -p "$LOG_DIR"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/koji/.nvm/versions/node/v24.15.0/bin/claude</string>
        <string>--channels</string>
        <string>plugin:imessage@claude-plugins-official</string>
        <string>--dangerously-skip-permissions</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/koji</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/imessage.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/imessage.error.log</string>
    <key>ThrottleInterval</key>
    <integer>15</integer>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/Users/koji/.nvm/versions/node/v24.15.0/bin:/usr/local/bin:/usr/bin:/bin</string>
        <key>HOME</key>
        <string>/Users/koji</string>
    </dict>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null
launchctl load "$PLIST_PATH"

echo "✓ Koji iMessage daemon installed and started."
echo "  Logs: $LOG_DIR/imessage.log"
echo "  To stop:    launchctl unload '$PLIST_PATH'"
echo "  To restart: launchctl unload '$PLIST_PATH' && launchctl load '$PLIST_PATH'"
