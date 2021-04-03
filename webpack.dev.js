import { merge } from 'webpack-merge'
import common from './webpack.common.js'

export default merge(common, {
	mode: 'development',
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true
	},
	devtool: 'cheap-source-map',
});
