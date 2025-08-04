function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function addCurrentWebsite() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && tabs[0].url) {
    const url = tabs[0].url;

    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        alert('Only HTTP and HTTPS websites can be tracked.');
        return;
      }
    } catch (error) {
      alert('Invalid URL.');
      return;
    }

    try {
      const urlObj = new URL(url);
      const origin = urlObj.origin + '/*';

      const hasPermission = await chrome.permissions.contains({
        origins: [origin]
      });

            if (!hasPermission) {
        const granted = await chrome.permissions.request({
          origins: [origin]
        });

        if (!granted) {
          alert('Permission denied. Cannot track this website without access permission.');
          return;
        }
      }

      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'addWebsite',
          url: url
        }, resolve);
      });

      console.log('Add website response:', response);
      if (response && response.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../public/icon.png',
          title: 'Website Added! 🐛',
          message: `Now tracking ${new URL(url).hostname} for changes`
        });
        loadWebsites();
      } else if (response && response.error) {
        alert('Error adding website: ' + response.error);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Error requesting permission: ' + error.message);
    }
  }
}

function checkForUpdates() {
  chrome.runtime.sendMessage({
    action: 'checkAllWebsites'
  }, (response) => {
    console.log('Check updates response:', response);
    if (response && response.success) {
      loadWebsites();
    }
  });
}

function markAllAsRead() {
  chrome.runtime.sendMessage({
    action: 'markAllAsRead'
  }, (response) => {
    console.log('Mark all as read response:', response);
    if (response && response.success) {
      loadWebsites();
    }
  });
}

function markWebsiteAsRead(url) {
  chrome.runtime.sendMessage({
    action: 'markWebsiteAsRead',
    url: url
  }, (response) => {
    console.log('Mark website as read response:', response);
    if (response && response.success) {
      loadWebsites();
    }
  });
}

function removeWebsite(url) {
  chrome.runtime.sendMessage({
    action: 'removeWebsite',
    url: url
  }, (response) => {
    console.log('Remove website response:', response);
    if (response && response.success) {
      loadWebsites();
    }
  });
}



function loadWebsites() {
  chrome.storage.local.get(['trackedWebsites'], (result) => {
    const websites = result.trackedWebsites || {};
    const websitesList = document.getElementById('websitesList');
    const checkUpdatesSection = document.getElementById('checkUpdatesSection');

    if (Object.keys(websites).length === 0) {
      websitesList.innerHTML = '<div class="empty-state">No websites tracked yet. Add a website to start monitoring changes.</div>';
      checkUpdatesSection.style.display = 'none';
      return;
    }

    checkUpdatesSection.style.display = 'flex';

    let html = '';
    for (const [url, data] of Object.entries(websites)) {
      const timeAgo = formatTime(data.lastChecked);
      const escapedUrl = escapeHtml(url);
      const escapedTitle = escapeHtml(data.title || url);

      html += `
        <div class="website-item" data-url="${escapedUrl}" style="cursor: pointer;">
          <div class="website-info">
            <div class="website-title">${escapedTitle}</div>
            <div class="website-url">${escapedUrl}</div>
            <div class="website-meta">
              Last checked: ${timeAgo}
              ${data.updated ? '<span class="updated-badge">Updated!</span>' : ''}
            </div>
          </div>
          <div class="website-actions">
            ${data.updated ? `<button class="mark-read-btn" data-url="${escapedUrl}" data-action="mark-read" title="Mark as read">👁️</button>` : ''}
            <button class="remove-btn" data-url="${escapedUrl}" data-action="remove" title="Remove">×</button>
          </div>
        </div>
      `;
    }

    websitesList.innerHTML = html;
  });
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

document.addEventListener('DOMContentLoaded', () => {
  loadWebsites();

  document.getElementById('addWebsiteBtn').addEventListener('click', addCurrentWebsite);
  document.getElementById('checkUpdatesBtn').addEventListener('click', checkForUpdates);
  document.getElementById('markAllReadBtn').addEventListener('click', markAllAsRead);

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mark-read-btn')) {
      const url = e.target.getAttribute('data-url');
      markWebsiteAsRead(url);
    } else if (e.target.classList.contains('remove-btn')) {
      const url = e.target.getAttribute('data-url');
      removeWebsite(url);
    } else if (e.target.closest('.website-item')) {
      const websiteItem = e.target.closest('.website-item');
      const url = websiteItem.getAttribute('data-url');
      if (url) {
        chrome.tabs.create({ url: url });
      }
    }
  });
});