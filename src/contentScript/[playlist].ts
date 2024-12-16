let clicked: boolean = false;

const observer = new MutationObserver(async (mutationsList) => {

    for (const mutation of mutationsList) {


        if (mutation.type === 'attributes') {
           if (mutation.target instanceof HTMLElement) {
            if (mutation.target.hasAttribute('yt-retrieved')) {
                if (mutation.target.getAttribute('src').includes('no_thumbnail.jpg')) {
                    mutation.target.setAttribute('src', 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/newscms/2019_06/2746941/190208-stock-money-fanned-out-ew-317p.jpg');
                }
            }
           }
        }

        if (mutation.addedNodes) {

            for (let node of mutation.addedNodes) {

                if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'yt-list-item-view-model') {
                    const list_items = document.querySelectorAll('yt-list-item-view-model[role="menuitem"]');

                    if (list_items?.length > 0 && !clicked) {
                        (list_items[1] as HTMLElement).click();
                        clicked = true;
                    }
                }

            }

        }


    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
});

const displayUnavailableVideos = async () => {
    const actions_button: Element = document.querySelector('button[aria-label="More actions"]');

    if (actions_button) {
        (actions_button as HTMLElement).click();
    } else {
        setTimeout(() => {
            displayUnavailableVideos();
        }, 1000)
    }

}

export const getThumbnails = async () => {
    const thumbnails = document.querySelectorAll('ytd-thumbnail');

    for (let thumbnail of thumbnails) {
        const innerHTML = thumbnail.innerHTML;

        //if (innerHTML.includes('no_thumbnail.jpg')) {
        const anchor = thumbnail.querySelector('a[id="thumbnail"]')
        const thumbnail_image = anchor.getElementsByTagName('img')[0];
        if (thumbnail_image) {
            if (!thumbnail_image?.src || thumbnail_image?.src.includes('no_thumbnail.jpg')) {
                //@ts-ignore
                thumbnail_image.setAttribute('src', 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/newscms/2019_06/2746941/190208-stock-money-fanned-out-ew-317p.jpg');
                thumbnail_image.setAttribute('yt-retrieved', 'true');
            }
        }
        //}

    }

}


displayUnavailableVideos();


