# Caterpillar 🐛

A Chrome extension that monitors your favorite websites for content changes and notifies you when they're updated.

## Features

- **Website Tracking**: Add any website to monitor for content changes
- **Smart Change Detection**: Uses content hashing to detect meaningful changes while ignoring timestamps, IDs, and other dynamic elements
- **Browser Notifications**: Get notified instantly when tracked websites are updated
- **Automatic Monitoring**: Checks all tracked websites every hour in the background
- **Manual Updates**: Force check for updates anytime with the "Check for Updates" button
- **Clean Interface**: Dark-themed popup with easy website management
- **Mark as Read**: Clear "Updated!" indicators once you've seen the changes

## Installation (Local Development)

Since this extension isn't published on the Chrome Web Store yet, you'll need to install it manually:

### Prerequisites
- Google Chrome browser (with notification permissions enabled)
- Basic familiarity with Chrome extensions

### Installation Steps

1. **Download or Clone the Extension**
   ```bash
   git clone https://github.com/shresthkapoor7/caterpillar.git
   cd caterpillar
   ```

2. **Open Chrome Extensions Page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or go to Chrome menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `caterpillar` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional but Recommended)
   - Click the puzzle piece icon (🧩) in Chrome's toolbar
   - Find "Caterpillar 🐛" and click the pin icon to keep it visible

## How to Use

### Adding Websites to Track

1. **Navigate to a Website**
   - Go to any website you want to monitor (e.g., a blog, news site, product page)

2. **Add to Tracking**
   - Click the Caterpillar 🐛 icon in your Chrome toolbar
   - Click the "**+ Add Current Website**" button
   - Grant permission when prompted (required to access the website content)
   - You'll see a notification confirming the website was added

### Managing Tracked Websites

The popup interface shows all your tracked websites with:

- **Website Title & URL**: Click to open the website in a new tab
- **Last Checked Time**: When the site was last checked for updates
- **Updated Badge**: Green "Updated!" indicator when changes are detected
- **Mark as Read**: Eye icon (👁️) to clear the "Updated!" status
- **Remove**: × button to stop tracking the website

### Checking for Updates

**Automatic Checks**
- The extension automatically checks all tracked websites every hour
- You'll receive browser notifications when changes are detected

**Manual Checks**
- Click "**Check for Updates**" in the popup to force an immediate check
- Use "**Mark All as Read**" to clear all "Updated!" indicators at once

### Understanding Change Detection

The extension is smart about detecting meaningful changes:

✅ **Will Detect:**
- New blog posts or articles
- Product price changes
- Content additions or modifications
- Page structure changes

❌ **Will Ignore:**
- Timestamps and dates
- View counters
- Advertisement changes
- Session IDs and tracking parameters
- CSS class names and IDs

## Permissions Explained

The extension requests these permissions:

- **Storage**: Save your tracked websites list
- **Alarms**: Schedule automatic hourly checks
- **Active Tab**: Read content from the current tab when adding websites
- **Tabs**: Open websites when you click on them in the popup
- **Notifications**: Show alerts when websites are updated
- **Host Permissions**: Access website content to detect changes

## Troubleshooting

### Website Won't Track
- Make sure you granted permissions when prompted
- Some websites block automated access - try visiting the site manually first
- Local files (`file://`) and Chrome pages (`chrome://`) cannot be tracked

### Not Receiving Notifications
- Check that Chrome notifications are enabled for the extension
- Ensure the extension has proper permissions
- Try manually checking for updates first

### Extension Not Loading
- Make sure you selected the correct folder (containing `manifest.json`)
- Check that Developer mode is enabled
- Try reloading the extension from `chrome://extensions/`

## Updates and Maintenance

Until the extension is published to the Chrome Web Store:

1. **Manual Updates**: Pull the latest code from the repository and reload the extension
2. **Reloading**: If you make changes, click the reload icon (🔄) on the extension card in `chrome://extensions/`
3. **Data Persistence**: Your tracked websites are saved locally and will persist between browser sessions

## Notes

- The extension works best with publicly accessible websites
- Some websites with heavy JavaScript may require a few seconds to fully load before tracking
- The extension respects robots.txt and standard web protocols
- Your data stays local - no information is sent to external servers

## Contributing

This is a local development setup. Feel free to modify the code and suggest improvements!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with by [Shresth Kapoor](https://github.com/shresthkapoor7)