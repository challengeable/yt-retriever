


const observer = new MutationObserver(async (mutationsList) => {

    for (const mutation of mutationsList) {

        if (mutation.addedNodes) {

            for (let node of mutation.addedNodes) {

                if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'ytd-menu-renderer') {
                    let parent: Element | null = node.parentElement;
                    if (parent && parent?.id == 'playlist-action-menu') {
                        appendRedirectionIcon(node);
                    }
                }

            }

        }


    }
});

observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
});

const appendRedirectionIcon = async (element: Element) => {
    let loading_image_src: string = chrome.runtime.getURL('/img/logo-16.png');

    let parent_box = document.createElement('div');
    parent_box.style.width = '40px';
    parent_box.style.height = '40px';
    parent_box.style.display = 'flex';
    parent_box.style.alignItems = 'center';
    parent_box.style.justifyContent = 'center';
    parent_box.style.position = 'relative';
    parent_box.style.marginLeft = '8px'
    parent_box.setAttribute('data-tooltip', 'Get redirected to your full playlist where I\'ll be able to find your lost videos');

    let img = document.createElement('img');
    img.src = loading_image_src;
    img.style.width = '16px';
    img.style.height = '15px';

    parent_box.onclick = (() => {
        const params = new URLSearchParams(window.location.search);
        const extracted_list_id: string = params.get('list');
        window.location.href = `https://www.youtube.com/playlist?list=${extracted_list_id}`
    })

    parent_box.appendChild(img);

    element.appendChild(parent_box);

    // Add the custom tooltip styling to the page
    const style = document.createElement('style');
    style.innerHTML = `
      [data-tooltip] {
        position: relative;
        cursor: pointer;
      }
      [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        top: 50px;
        left: 65%;
        transform: translateX(-30%);
        background-color: #f5dbb6;
        color: black;
        padding: 5px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);
}

