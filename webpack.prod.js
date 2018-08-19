const merge = require('webpack-merge');
const common = require('./webpack.common');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
	devtool: 'none',
	mode: 'production',
	// http://vue-loader.vuejs.org/en/workflow/production.html
	plugins: [
		new UglifyJSPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	]
});
