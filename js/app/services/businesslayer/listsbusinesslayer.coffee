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


angular.module('Tasks').factory 'ListsBusinessLayer',
['ListsModel', 'Persistence', 'TasksModel',
(ListsModel, Persistence, TasksModel) ->

	class ListsBusinessLayer

		constructor: (@_$listsmodel, @_persistence,
		@_$tasksmodel) ->

		addList: (list, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->

			@_$listsmodel.add(list)

			success = (response) =>
				if response.status == 'error'
					onFailure()
				else
					onSuccess(response.data)
			@_persistence.addList(list, success)

		deleteList: (listID) ->
			@_$tasksmodel.removeByList(listID)
			@_$listsmodel.removeById(listID)
			@_persistence.deleteList(listID)

		setListName: (listID) ->
			@_persistence.setListName(@_$listsmodel.getById(listID))

		updateModel: () ->
			@_$listsmodel.voidAll()
			success = () =>
				@_$listsmodel.removeVoid()
			@_persistence.getLists(success, true)

	return new ListsBusinessLayer(ListsModel, Persistence,
		TasksModel)

]