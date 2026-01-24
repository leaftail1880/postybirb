#!/bin/bash
# entrypoint.sh

echo "Starting Xvfb virtual display"
# Start Xvfb on display :99 with a specific screen resolution in the background
Xvfb :99 -ac -screen 0 1280x1024x24 & 
sleep 2 # Give Xvfb time to start

# Export the DISPLAY environment variable so Electron knows where to render
export DISPLAY=:99

# Execute the main command (e.g., "npm start" or "electron .")
exec "$@"
