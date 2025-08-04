console.log('Caterpillar 🐛 content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    sendResponse({
      content: document.documentElement.outerHTML,
      url: window.location.href
    });
  }
});