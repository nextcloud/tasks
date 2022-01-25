const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')
const webpack = require('webpack')

webpackConfig.entry = {
	...webpackConfig.entry,
	dashboard: path.join(__dirname, 'src', 'dashboard.js'),
	talk: path.join(__dirname, 'src', 'talk.js'),
}

webpackConfig.plugins.push(
	new webpack.ProvidePlugin({
		// Shim ICAL to prevent using the global object (window.ICAL).
		// The library ical.js heavily depends on instanceof checks which will
		// break if two separate versions of the library are used (e.g. bundled one
		// and global one).
		ICAL: 'ical.js',
	}),
)

module.exports = webpackConfig
