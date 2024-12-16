
chrome.webRequest.onCompleted.addListener(async (details) => {
    console.log(details.url);
    if (details.method == 'POST' && details.url.endsWith('/youtubei/v1/browse?prettyPrint=false')) {
      chrome.tabs.sendMessage(details.tabId, { action: 'GOO' });
    }
  }, {
    urls: ['*://*.youtube.com/youtubei/v1/browse*']
  });