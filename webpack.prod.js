import { merge } from 'webpack-merge'
import common from './webpack.common.js'
import TerserPlugin from 'terser-webpack-plugin'

export default merge(common, {
	mode: 'production',
	devtool: 'source-map',
	optimization: {
		minimizer: [new TerserPlugin({
			terserOptions: {
				output: {
					comments: false,
				}
			},
		})],
	}
});
