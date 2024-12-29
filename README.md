# Chrome Extension: Human-Like Scrolling and Page Refresh

This Chrome extension simulates human-like scrolling behavior on webpages by automatically scrolling up and down, with random delays between scroll actions. Additionally, it refreshes the page at a random interval within a specified range.

## Features

- **Human-Like Scrolling**: Simulates scrolling up and down with random scroll distances and delays.
- **Random Page Refresh**: Refreshes the page at random intervals between a minimum and maximum time range.
- **Randomized Delays**: Introduces random pauses between 1 and 10 seconds between scroll actions to mimic natural human behavior.

## Installation

To install this Chrome extension:

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top-right corner).
4. Click on **Load unpacked** and select the folder where the extension's code is located.
5. The extension will now be active in your browser.

## Usage

Once the extension is installed:

- **Start the Behavior**: You can trigger the extension's behavior (scrolling and page refresh) from the extension's popup or based on your tab's settings.
- **Stop the Behavior**: You can stop the scrolling and refreshing from the popup.

### Background Process:
- The extension uses background scripts to manage scrolling and refreshing timers for each tab.
- It listens for tab activity and can refresh and scroll specific tabs independently.
  
## Code Explanation

### 1. **`background.js`**

The background script is responsible for managing the behavior for each tab:

- **Tab Refresh**: Refreshes the tab at random intervals.
- **Scroll Behavior**: Simulates human-like scrolling on the page, with random scroll directions and speeds. The delay between scrolls is randomized between 1 and 10 seconds.
- **Badge Updates**: Updates the badge text with the remaining time before the next refresh.

### 2. **`popup.js` (optional)**

This file can be used for adding a user interface (e.g., a popup with buttons to start/stop the extension's behavior).

### 3. **`content.js`**

The content script handles the actual scrolling on the page. It listens for messages from the background script and performs the scrolling action in the content of the tab.

### 4. **`manifest.json`**

The `manifest.json` file describes the extension, permissions, and the background and content scripts:

```json
{
  "manifest_version": 3,
  "name": "Human-Like Scrolling and Page Refresh",
  "version": "1.0",
  "description": "Simulates human-like scrolling and random page refresh on tabs.",
  "permissions": [
    "tabs",
    "storage",
    "activeTab",
    "scripting"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "host_permissions": [
    "<all_urls>"
  ]
}
```
## Customization

You can customize the following settings in `chrome.storage.local`:

- **Minimum and Maximum Refresh Interval**: Adjust the time range between page refreshes.
- **Scroll Behavior**: The scroll speed, direction, and delay between scroll actions can be modified to suit your needs.

## Troubleshooting

- **Error Message**: If you encounter an error like `scrollTimers is not defined`, ensure that the `scrollTimers` object is properly managed in the background script and passed to the content script.
- **No Scrollable Content**: If a page has no scrollable content, the extension will log a message saying, "No scrollable content found."

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, create a branch, and submit a pull request with your changes. Make sure to include tests for new features or fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For further updates or inquiries, you can reach out to me through my profiles on Fiverr or Upwork:

[![Fiverr](https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Fiverr_logo.svg/1280px-Fiverr_logo.svg.png)]([https://www.fiverr.com/your-profile-link](https://www.fiverr.com/users/toqeerhaider597))  
[![Upwork](https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Upwork_logo_2019.svg/1280px-Upwork_logo_2019.svg.png)]([https://www.upwork.com/freelancers/~your-profile-link](https://www.upwork.com/freelancers/~01bbd0b4facc5ae5ba))

