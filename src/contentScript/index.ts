import { getThumbnails } from "./[playlist]";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'GOO') {
        await sendResponse('OK')
        setTimeout(() => {
            getThumbnails();
        }, 2000)
        
    }
});
