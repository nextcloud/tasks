###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2015

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###


angular.module('Tasks').factory 'SearchBusinessLayer',
['ListsModel', 'Persistence', 'TasksModel', '$rootScope',
(ListsModel, Persistence, TasksModel, $rootScope) ->

	class SearchBusinessLayer

		constructor: (@_$listsmodel, @_persistence,
		@_$tasksmodel, @_$rootScope) ->
			@initialize()
			@_$searchString = ''

		attach: (search) =>
			search.setFilter('tasks', (query) =>
				@_$rootScope.$apply(
					@setFilter(query)
					)
				# if (self.fileAppLoaded())
					# self.fileList.setFilter(query)
					# if (query.length > 2)
					# 	# //search is not started until 500msec have passed
					# 	window.setTimeout(() =>
					# 		$('.nofilterresults').addClass('hidden')
					# 	, 500)
			)
			search.setRenderer('task', @renderTaskResult.bind(@))
			search.setHandler('task',  @handleTaskClick.bind(@))

		setFilter: (query) =>
			@_$searchString = query

		getFilter: () =>
			return @_$searchString

		initialize: () ->
			@handleTaskClick = ($row, result, event) =>
				console.log('Search result clicked')

			@renderTaskResult = ($row, result) =>
				# console.log('Render result')
				# console.log($row)
				# console.log(result)
				return $row
			OC.Plugins.register('OCA.Search', @)


	return new SearchBusinessLayer(ListsModel, Persistence,
		TasksModel, $rootScope)

]