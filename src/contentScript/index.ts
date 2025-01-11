import { getThumbnails } from "./[playlist]";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'GET_THUMBNAILS') {
        await sendResponse('OK')
        setTimeout(() => {
            getThumbnails();
        }, 2000)
    }
});
