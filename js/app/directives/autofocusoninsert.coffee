angular.module('Tasks').directive 'autofocusOnInsert', ->
	'use strict'
	return (scope, elm) ->
		elm.focus()
