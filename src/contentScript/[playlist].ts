import { getFilmotMetadata } from "../api/filmot/bootstrap";
import { FilmotMetadataResponseDTO } from "../api/filmot/dtos/FilmotMetadataResponse.dto";
import { INDEXED_DB_CONFIG } from "../utils/Constants";
import IndexedDbSingleton from "../utils/indexed-db/IndexedDbSingleton";
import moment from 'moment';

let clicked: boolean = false;

const observer = new MutationObserver(async (mutationsList) => {

    for (const mutation of mutationsList) {


        if (mutation.type === 'attributes') {
            if (mutation.target instanceof HTMLElement) {
                if (mutation.target.hasAttribute('yt-retrieved')) {
                    if (mutation.target.getAttribute('src').includes('no_thumbnail.jpg')) {
                        let loading_image_src: string = chrome.runtime.getURL('/img/loading_states/loading_state_logo.png');
                        mutation.target.setAttribute('src', loading_image_src);

                        const ytImageElement: Element = mutation.target?.parentElement;

                        if (ytImageElement) {

                            const anchorElement: Element = ytImageElement?.parentElement;

                            if (anchorElement) {

                                const raw_watch_url: string = anchorElement.getAttribute('href');

                                const video_id_match: RegExpMatchArray | null = raw_watch_url.match(/[?&]v=([^&]+)/);
                                const video_id: string | null = video_id_match ? video_id_match[1] : null;

                                const existing_metadata: { metadata: FilmotMetadataResponseDTO } = await IndexedDbSingleton.getInstance().read(INDEXED_DB_CONFIG.STORES.VIDEOS_METADATA, video_id);

                                if (existing_metadata) {

                                    populateVideo(existing_metadata.metadata, mutation.target);

                                } else {
                                    getFilmotMetadata(video_id).then((metadata_res) => {

                                        if (metadata_res.length > 0) {

                                            IndexedDbSingleton.getInstance().insert(INDEXED_DB_CONFIG.STORES.VIDEOS_METADATA, {
                                                id: video_id,
                                                metadata: metadata_res[0]
                                            })

                                            populateVideo(metadata_res[0], mutation.target as Element);
                                        } else {
                                            markVideoAsNulledMetadata(mutation.target as Element);
                                        }

                                    })

                                }

                            }

                        }

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

        const anchor: Element = thumbnail.querySelector('a[id="thumbnail"]')
        const thumbnail_image = anchor.getElementsByTagName('img')[0];
        if (thumbnail_image) {
            if (!thumbnail_image?.src || thumbnail_image?.src.includes('no_thumbnail.jpg')) {
                let loading_image_src: string = chrome.runtime.getURL('/img/loading_states/loading_state_logo.png');
                //@ts-ignore
                thumbnail_image.setAttribute('src', loading_image_src);
                thumbnail_image.setAttribute('yt-retrieved', 'true');
            }
        }

    }

}

const populateVideo = async (metadata: FilmotMetadataResponseDTO, element: Element) => {
    const root_parent: Element = element.closest('#content');

    if (root_parent) {

        const anchorElements = root_parent.querySelectorAll('a');
        for (let ancEle of anchorElements) {
            const href_attr: string | null = ancEle.hasAttribute('href') ? ancEle.getAttribute('href') : null;

            if (href_attr && href_attr.includes(`/watch?v=${metadata.id}`)) {
                ancEle.setAttribute('href', `https://www.youtube.com/results?search_query=${metadata.title}`)
            }

        }

        const title: Element = root_parent.querySelector('#video-title');
        title.textContent = `🐕📼 ${metadata.title}`;

        const meta_container: Element = root_parent.querySelector('#meta');

        const recovered_by_div = document.createElement('div');
        recovered_by_div.style.color = '#f5dbb6';
        recovered_by_div.style.fontSize = '1.2rem';
        recovered_by_div.style.fontFamily = '"Roboto","Arial",sans-serif'
        recovered_by_div.innerText = `Recovered by YT-Retriever`;

        const video_info_div = document.createElement('div');
        video_info_div.classList.add('yt-retriever-video-info-container');

        const channel_info_div = document.createElement('a');
        channel_info_div.classList.add('yt-retriever-channel-info');
        channel_info_div.href = `https://www.youtube.com/channel/${metadata.channelid}`;
        channel_info_div.innerText = metadata.channelname;

        const upload_date_div = document.createElement('span');
        upload_date_div.innerText = ` • ${moment(metadata.uploaddate).fromNow()}`;

        video_info_div.appendChild(channel_info_div);
        video_info_div.appendChild(upload_date_div);

        meta_container.appendChild(recovered_by_div);
        meta_container.appendChild(video_info_div);

        let loaded_image_src: string = chrome.runtime.getURL('/img/loading_states/loaded_state_logo.png');
        element.setAttribute('src', loaded_image_src);

    }

}

const markVideoAsNulledMetadata = (element: Element) => {
    let loaded_image_src: string = chrome.runtime.getURL('/img/loading_states/failed_state_logo.png');
    element.setAttribute('src', loaded_image_src);

    const root_parent: Element = element.closest('#content');

    if (root_parent) {
        const meta_container: Element = root_parent.querySelector('#meta');

        const could_not_find = document.createElement('div');
        could_not_find.style.color = '#f5dbb6';
        could_not_find.style.fontSize = '1.2rem';
        could_not_find.style.fontFamily = '"Roboto","Arial",sans-serif'
        could_not_find.innerText = `🐾 I've woofed everywhere and could not find this video.. sowy!`;

        meta_container.appendChild(could_not_find);
    }

}

const injectCSS = async () => {
    const style = document.createElement('style');
    style.innerHTML = `

   .yt-retriever-video-info-container {
    display: flex;
    gap: 3px;
    align-items: center;
    color: #aaa;
    font-size: 1.2rem;
    margin-top: 3px;
    font-family: "Roboto", "Arial", sans-serif;
  }
  .yt-retriever-channel-info {
    color: #aaa;
    text-decoration: none;
  }
  .yt-retriever-channel-info:hover {
    color: white;
  }
`;
    document.head.appendChild(style);
}

displayUnavailableVideos();
injectCSS();


