###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013

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

angular.module('Tasks').factory 'CollectionsModel',
['TasksModel', '_Model', '_EqualQuery', 'Utils',
(TasksModel, _Model, _EqualQuery, Utils) ->
	class CollectionsModel extends _Model

		constructor: (@_$tasksmodel, @_utils) ->
			@_nameCache = {}
			@_$collections = [
				{
					id: "starred"
					displayname: t('tasks_enhanced','Important')
				},
				{
					id: "today"
					displayname: t('tasks_enhanced', 'Today')
				},
				{
					id: "week"
					displayname: t('tasks_enhanced', 'Week')
				},
				{
					id: "all",
					displayname: t('tasks_enhanced', 'All')
				},
				{
					id: "completed"
					displayname: t('tasks_enhanced', 'Done')
				}
			]
			super()
			for collection in @_$collections
				@add(collection)

		add: (data, clearCache=true) ->
			@_nameCache[data.displayname] = data
			if angular.isDefined(data.id)
				super(data, clearCache)

		getCount: (collectionID) ->
			count = 0
			tasks = @_$tasksmodel.getAll()
			switch collectionID
				when 'starred'
					for task in tasks
						count += (task.starred && !task.completed)
				when 'today'
					for task in tasks
						count += (!task.completed && @_$tasksmodel.today(task.due))
				when 'week'
					for task in tasks
						count += (!task.completed && @_$tasksmodel.week(task.due))
				when 'all'
					for task in tasks
						count += !task.completed
				when 'completed'
					for task in tasks
						count += task.completed
			return count

		getCountString: (collectionID) ->
			if collectionID != 'completed'
				return @getCount(collectionID)
			else
				return ''

	return new CollectionsModel(TasksModel, Utils)
]