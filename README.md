# Caterpillar 🐛

A simple Chrome extension that tracks websites for changes and sends notifications when updates are detected.

## Features

- **Website Tracking**: Add any website to monitor for changes
- **Automatic Checking**: Checks all tracked websites every 60 minutes
- **Change Detection**: Uses content hashing to detect when websites change
- **Notifications**: Sends desktop notifications when websites are updated
- **Simple Interface**: Clean popup to manage tracked websites
- **Mark as Read**: Mark individual or all updates as read

## Project Structure

```
my-extension/
├── public/
│   └── icon.png          # Extension icon
├── src/
│   ├── popup.html        # Popup interface
│   ├── popup.js          # Popup functionality
│   ├── background.js     # Background script for alarms & hash checking
│   └── content.js        # Content script for website access
└── manifest.json         # Chrome extension manifest
```

## Installation

1. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `my-extension` folder

2. **Start Tracking**:
   - Click the extension icon
   - Navigate to any website you want to track
   - Click "+ Add Current Website"
   - The extension will start monitoring for changes

## How It Works

1. **Add Websites**: Click the extension icon and add websites to track
2. **Automatic Monitoring**: The extension checks all tracked websites every 60 minutes
3. **Change Detection**: Uses content hashing to detect when websites change
4. **Notifications**: Sends desktop notifications when changes are detected
5. **Manage Updates**: Mark individual or all updates as read

## Permissions

- **Storage**: Saves tracked websites locally
- **Alarms**: Schedules periodic website checking
- **Active Tab**: Gets current website URL
- **Tabs**: Access to browser tabs
- **Notifications**: Sends desktop notifications
- **Host Permissions**: Access to all HTTP/HTTPS websites

## Development

This is a simple extension with no build process required. Just edit the files and reload the extension in Chrome.

## License

MIT