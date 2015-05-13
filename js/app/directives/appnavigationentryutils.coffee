angular.module('Tasks').directive 'appNavigationEntryUtils', ->
	'use strict'
	{
		restrict: 'C'
		link: (scope, elm) ->
			menu = elm.siblings('.app-navigation-entry-menu')
			button = $(elm).find('.app-navigation-entry-utils-menu-button button')
			button.click ->
				menu.toggleClass 'open'
				return
			scope.$on 'documentClicked', (scope, event) ->
				if event.target != button[0]
					menu.removeClass 'open'
				return
			return
	}

