
chrome.webRequest.onCompleted.addListener(async (details) => {
  if (details.method == 'POST' && details.url.endsWith('/youtubei/v1/browse?prettyPrint=false')) {
    chrome.tabs.sendMessage(details.tabId, { action: 'GET_THUMBNAILS' });
  }
}, {
  urls: ['*://*.youtube.com/youtubei/v1/browse*']
});

