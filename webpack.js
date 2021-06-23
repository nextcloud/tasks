const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')

webpackConfig.entry = {
	...webpackConfig.entry,
	dashboard: path.join(__dirname, 'src', 'dashboard.js'),
	talk: path.join(__dirname, 'src', 'talk.js'),
}

module.exports = webpackConfig
