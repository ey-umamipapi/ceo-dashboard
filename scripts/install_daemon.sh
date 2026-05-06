#!/bin/bash
# Installs the HubPapi automation daemon as a macOS launchd service.
# Run once: bash scripts/install_daemon.sh

PLIST_LABEL="com.umamipapi.hubpapi-daemon"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_LABEL.plist"
SCRIPT_PATH="/Users/koji/Library/CloudStorage/OneDrive-umamipapi.com.au/CEO Cowork/CEO Code/ceo-dashboard/scripts/automation_daemon.py"
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
        <string>/usr/bin/python3</string>
        <string>$SCRIPT_PATH</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/daemon.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/daemon.error.log</string>
    <key>ThrottleInterval</key>
    <integer>10</integer>
</dict>
</plist>
EOF

# Unload if already running
launchctl unload "$PLIST_PATH" 2>/dev/null

# Load it
launchctl load "$PLIST_PATH"

echo "✓ Daemon installed and started."
echo "  Logs: $LOG_DIR/daemon.log"
echo "  To stop:    launchctl unload '$PLIST_PATH'"
echo "  To restart: launchctl unload '$PLIST_PATH' && launchctl load '$PLIST_PATH'"
