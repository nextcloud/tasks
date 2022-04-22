import { createAppConfig } from '@nextcloud/vite-config'
import { resolve } from 'node:path'

export default createAppConfig({
	main: 'src/main.js',
	dashboard: 'src/dashboard.js',
	talk: 'src/talk.js',
}, {
	config: {
		test: {
			coverage: {
				include: ['src/**'],
				provider: 'istanbul',
				reporter: ['lcov', 'text'],
			},
			environment: 'happy-dom',
			setupFiles: resolve(__dirname, './tests/javascript/unit/setup.js'),
			server: {
			  deps: {
				inline: ['@nextcloud/vue'],
			  }
			},
		},
	}
})
