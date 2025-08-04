chrome.runtime.onInstalled.addListener(() => {
      chrome.alarms.create('hashChecker', {
      delayInMinutes: 0,
      periodInMinutes: 60
    });

  setTimeout(() => {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../public/icon.png',
      title: 'Caterpillar 🐛 Installed',
      message: 'Your website tracking extension is ready to use!'
    });
  }, 2000);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'hashChecker') {
    checkAllWebsites();
  }
});

async function checkAllWebsites() {
  try {
    const result = await chrome.storage.local.get(['trackedWebsites']);
    const websites = result.trackedWebsites || {};

    for (const [url, websiteData] of Object.entries(websites)) {
      await checkWebsiteForChanges(url, websiteData);
    }
  } catch (error) {
    console.error('Error checking websites:', error);
  }
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

async function fetchWithPermission(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

function generateCleanedContentForDebug(content) {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(id|class|data-[^=]*|style|onclick|onload|onmouseover|onmouseout)="[^"]*"/g, '')
    .replace(/\s(id|class|data-[^=]*|style|onclick|onload|onmouseover|onmouseout)='[^']*'/g, '')
    .replace(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?[Z]?/g, '')
    .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '')
    .replace(/\d{1,2}-\d{1,2}-\d{4}/g, '')
    .replace(/\d{13}/g, '')
    .replace(/\d{10}/g, '')
    .replace(/(timestamp|time|date|cache|version|hash)[^>]*>/gi, '')
    .replace(/\b(last\s+updated?|posted|published|modified)[\s:]*[^<\n]*/gi, '')
    .replace(/\b\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/gi, '')
    .replace(/\bjust\s+now\b/gi, '')
    .replace(/(\bhref="[^"?]*)\?[^"]*/g, '$1')
    .replace(/(\bsrc="[^"?]*)\?[^"]*/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function generateHash(content) {
  let cleanContent = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

    .replace(/\s(id|class|data-[^=]*|style|onclick|onload|onmouseover|onmouseout)="[^"]*"/g, '')
    .replace(/\s(id|class|data-[^=]*|style|onclick|onload|onmouseover|onmouseout)='[^']*'/g, '')

    .replace(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?[Z]?/g, '')
    .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '')
    .replace(/\d{1,2}-\d{1,2}-\d{4}/g, '')
    .replace(/\d{13}/g, '')
    .replace(/\d{10}/g, '')
    .replace(/(timestamp|time|date|cache|version|hash)[^>]*>/gi, '')

    .replace(/\b(last\s+updated?|posted|published|modified)[\s:]*[^<\n]*/gi, '')
    .replace(/\b\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/gi, '')
    .replace(/\bjust\s+now\b/gi, '')

    .replace(/(\bhref="[^"?]*)\?[^"]*/g, '$1')
    .replace(/(\bsrc="[^"?]*)\?[^"]*/g, '$1')

    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')

    .trim();

  if (cleanContent.length === 0) return '';

  let hash = 5381;
  for (let i = 0; i < cleanContent.length; i++) {
    hash = ((hash << 5) + hash) + cleanContent.charCodeAt(i);
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16).padStart(8, '0');
}

async function checkWebsiteForChanges(url, websiteData) {
  try {
    console.log(`Checking website: ${url}`);

    let content = '';
    try {
      const tabs = await chrome.tabs.query({});
      const targetTab = tabs.find(tab => tab.url === url);

      if (targetTab) {
        try {
          const response = await chrome.tabs.sendMessage(targetTab.id, { action: 'getPageContent' });
          content = response.content;
        } catch (contentScriptError) {
          console.log(`Content script failed for ${url}, trying fetch`);
          content = await fetchWithPermission(url);
        }
      } else {
        content = await fetchWithPermission(url);
      }
    } catch (fetchError) {
      console.log(`All methods failed for ${url}:`, fetchError.message);
      if (fetchError.message.includes('user gesture')) {
        console.log(`Skipping ${url} - requires user permission`);
      }
      return;
    }

    const currentHash = generateHash(content);

    if (websiteData.lastHash && websiteData.lastHash !== currentHash) {
      console.log(`Website changed: ${url}`);
      console.log(`Previous hash: ${websiteData.lastHash}, Current hash: ${currentHash}`);

      const debugContent = generateCleanedContentForDebug(content);
      console.log(`Content sample (first 200 chars): ${debugContent.substring(0, 200)}...`);

      const updatedData = {
        ...websiteData,
        lastHash: currentHash,
        lastChecked: Date.now(),
        updated: true
      };

      const result = await chrome.storage.local.get(['trackedWebsites']);
      const websites = result.trackedWebsites || {};
      websites[url] = updatedData;
      await chrome.storage.local.set({ trackedWebsites: websites });

      createNotification(
        'Caterpillar 🐛',
        `${new URL(url).hostname} has been updated!`
      );
    } else {
      const updatedData = {
        ...websiteData,
        lastChecked: Date.now(),
        updated: false
      };

      const result = await chrome.storage.local.get(['trackedWebsites']);
      const websites = result.trackedWebsites || {};
      websites[url] = updatedData;
      await chrome.storage.local.set({ trackedWebsites: websites });
    }
  } catch (error) {
    console.error(`Error checking ${url}:`, error);
  }
}

function createNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../public/icon.png',
    title: title,
    message: message
  });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addWebsite') {
    addWebsiteToTracking(request.url).then(sendResponse);
    return true;
  } else if (request.action === 'removeWebsite') {
    removeWebsiteFromTracking(request.url).then(sendResponse);
    return true;
  } else if (request.action === 'checkWebsite') {
    checkWebsiteForChanges(request.url, request.websiteData).then(sendResponse);
    return true;
  } else if (request.action === 'checkAllWebsites') {
    checkAllWebsites().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'markAllAsRead') {
    markAllAsRead().then(sendResponse);
    return true;
    } else if (request.action === 'markWebsiteAsRead') {
    markWebsiteAsRead(request.url).then(sendResponse);
    return true;
  }
});

async function addWebsiteToTracking(url) {
  try {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const content = await fetchWithPermission(url);
    const hash = generateHash(content);

    const websiteData = {
      url,
      lastHash: hash,
      lastChecked: Date.now(),
      updated: false,
      title: new URL(url).hostname
    };

    const result = await chrome.storage.local.get(['trackedWebsites']);
    const websites = result.trackedWebsites || {};
    websites[url] = websiteData;
    await chrome.storage.local.set({ trackedWebsites: websites });

    return { success: true, data: websiteData };
  } catch (error) {
    console.error('Error adding website:', error);
    return { success: false, error: error.message };
  }
}

async function removeWebsiteFromTracking(url) {
  try {
    const result = await chrome.storage.local.get(['trackedWebsites']);
    const websites = result.trackedWebsites || {};
    delete websites[url];
    await chrome.storage.local.set({ trackedWebsites: websites });

    return { success: true };
  } catch (error) {
    console.error('Error removing website:', error);
    return { success: false, error: error.message };
  }
}

async function markAllAsRead() {
  try {
    const result = await chrome.storage.local.get(['trackedWebsites']);
    const websites = result.trackedWebsites || {};

    for (const url in websites) {
      try {
        const content = await fetchWithPermission(url);
        const currentHash = generateHash(content);

        websites[url].updated = false;
        websites[url].lastHash = currentHash;
        websites[url].lastChecked = Date.now();

        console.log(`Marked ${url} as read with new hash: ${currentHash}`);
      } catch (fetchError) {
        console.log(`Could not fetch ${url} for hash update, just marking as read`);
        websites[url].updated = false;
      }
    }

    await chrome.storage.local.set({ trackedWebsites: websites });

    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
}

async function markWebsiteAsRead(url) {
  try {
    const result = await chrome.storage.local.get(['trackedWebsites']);
    const websites = result.trackedWebsites || {};

    if (websites[url]) {
      try {
        const content = await fetchWithPermission(url);
        const currentHash = generateHash(content);

        websites[url].updated = false;
        websites[url].lastHash = currentHash;
        websites[url].lastChecked = Date.now();

        console.log(`Marked ${url} as read with new hash: ${currentHash}`);
      } catch (fetchError) {
        console.log(`Could not fetch ${url} for hash update, just marking as read`);
        websites[url].updated = false;
      }

      await chrome.storage.local.set({ trackedWebsites: websites });
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking website as read:', error);
    return { success: false, error: error.message };
  }
}