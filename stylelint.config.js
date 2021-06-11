module.exports = {
	extends: '@nextcloud/stylelint-config',
	rules: {
		'no-eol-whitespace': true,
		'length-zero-no-unit': true,
		'block-opening-brace-space-before': 'always',
		'number-leading-zero': 'never',
		'selector-combinator-space-before': 'always',
		'selector-combinator-space-after': 'always',
		'declaration-colon-space-after': 'always',
		'declaration-colon-space-before': 'never'
	}
}
