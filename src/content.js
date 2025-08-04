// Content script to help with website access
console.log('Caterpillar 🐛 content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    sendResponse({
      content: document.documentElement.outerHTML,
      url: window.location.href
    });
  }
});