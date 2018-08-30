module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true
	},
	globals: {
		t: false,
		n: false,
		OC: false,
		OCA: false
	},
	parserOptions: {
		parser: 'babel-eslint'
	},
	extends: [
		'eslint:recommended',
		'plugin:node/recommended',
		'plugin:vue/recommended',
		'standard'
	],
	plugins: ['vue', 'node'],
	rules: {
		// space before function ()
		'space-before-function-paren': ['error', 'never'],
		// curly braces always space
		'object-curly-spacing': ['error', 'always'],
		// stay consistent with array brackets
		'array-bracket-newline': ['error', 'consistent'],
		// 1tbs brace style
		'brace-style': 'error',
		// tabs only
		indent: ['error', 'tab'],
		'no-tabs': 0,
		'vue/html-indent': ['error', 'tab'],
		// only debug console
		'no-console': ['error', { 'allow': ['error', 'warn', 'debug'] }],
		// classes blocks
		'padded-blocks': ['error', { 'classes': 'always' }],
		// es6 import/export and require
		'node/no-unpublished-require': ['off'],
		'node/no-unsupported-features': ['off'],
		// space before self-closing elements
		'vue/html-closing-bracket-spacing': 'error',
		// code spacing with attributes
		'vue/max-attributes-per-line': [
			'error',
			{
				singleline: 3,
				multiline: {
					max: 3,
					allowFirstLine: true
				}
			}
		]
	}
};
