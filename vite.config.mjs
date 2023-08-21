import { createAppConfig } from '@nextcloud/vite-config'

export default createAppConfig({
	main: 'src/main.js',
	dashboard: 'src/dashboard.js',
	talk: 'src/talk.js',
})
