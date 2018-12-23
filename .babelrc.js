module.exports = {
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-proposal-object-rest-spread'
	],
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					browsers: ['last 2 versions', 'ie >= 11']
				}
			}
		]
	]
}
