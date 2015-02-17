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
['TasksModel', '_Model',
(TasksModel, _Model) ->
	class CollectionsModel extends _Model

		constructor: (@_$tasksmodel) ->
			@_nameCache = {}
			super()

		add: (data, clearCache=true) ->
			@_nameCache[data.displayname] = data
			if angular.isDefined(data.id)
				super(data, clearCache)

		getCount: (collectionID, filter='') ->
			count = 0
			tasks = @_$tasksmodel.getAll()
			
			for task in tasks
				count += (@_$tasksmodel.filterTasks(task, collectionID) &&
					@_$tasksmodel.filterTasksByString(task, filter))
			return count

	return new CollectionsModel(TasksModel)
]