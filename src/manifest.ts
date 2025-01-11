import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_icon: 'img/logo-48.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    // Playlists
    {
      matches: ['https://www.youtube.com/playlist?list=*'],
      js: ['src/contentScript/index.ts', 'src/contentScript/[playlist].ts'],
      run_at: 'document_end'
    },
    // Watching from a playlist
    {
      matches: ['https://www.youtube.com/watch?v=*&list=*'],
      js: ['src/contentScript/[watching].ts'],
      run_at: 'document_start'
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['tabs', 'storage', 'webRequest'],
  host_permissions: ["https://www.youtube.com/*"],
})
