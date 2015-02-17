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
angular.module('Tasks').controller 'ListController',
['$scope', '$window', '$routeParams', 'ListsModel',
'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer',
'$location', 'SearchBusinessLayer',
($scope, $window, $routeParams, ListsModel, TasksBusinessLayer,
CollectionsModel, ListsBusinessLayer, $location, SearchBusinessLayer) ->

	class ListController

		constructor: (@_$scope,@_$window,@_$routeParams,
		@_$listsmodel, @_$tasksbusinesslayer, @_$collectionsmodel,
		@_$listsbusinesslayer, @$location, @_$searchbusinesslayer) ->


			@_$scope.collections = @_$collectionsmodel.getAll()

			@_$scope.lists = @_$listsmodel.getAll()

			@_$scope.TasksBusinessLayer = @_$tasksbusinesslayer

			@_$scope.status.listNameBackup = ''


			@_$scope.deleteList = (listID) ->
				really = confirm(t('tasks',
				'This will delete the Calendar "%s" and all of its entries.')
				.replace('%s',_$listsmodel.getById(_$scope.route.listID).displayname))
				if really
					_$listsbusinesslayer.deleteList listID
					$location.path('/lists/'+_$listsmodel.getStandardList())

			@_$scope.startAddingList = () ->
				_$scope.status.addingList = true

			@_$scope.endAddingList = () ->
				_$scope.status.addingList = false
				_$scope.status.newListName = ""

			@_$scope.checkListInput = (event) ->
				if (event.keyCode == 13)
					event.preventDefault()
					_$scope.submitNewList()
				if(event.keyCode == 27)
					_$scope.endAddingList()

			@_$scope.submitNewList = () ->

				if _$scope.status.newListName
					if _$listsmodel.checkName(_$scope.status.newListName)
						_$scope.status.addingList = false
						_$scope.isAddingList = true
						list = {
							tmpID:		'newList' + Date.now()
							displayname:		_$scope.status.newListName
						}
						_$listsbusinesslayer.addList list
						, (data) =>
							_$listsmodel.add(data.list)
							$location.path('/lists/'+data.list.id)
							_$scope.isAddingList = false
						, =>
							_$scope.status.addingList = false
							_$scope.isAddingList = false

						_$scope.status.newListName = ''
					else
						alert(t('tasks',
						'The name "%s" is already used.')
						.replace('%s',_$scope.status.newListName))
				else
					alert(t('tasks',
					'An empty name is not allowed.'))

			@_$scope.editName = (listID) ->
				_$scope.status.listNameBackup = _$listsmodel.getById(listID).displayname
				$location.path('/lists/'+_$scope.route.listID+'/edit/name')

			@_$scope.checkName = (event) ->
				if not _$scope.status.listNameBackup
					_$scope.status.listNameBackup = _$listsmodel
					.getById(_$scope.route.listID).displayname
				if (event.keyCode == 13)
					event.preventDefault()
					_$scope.submitNewName()
				if(event.keyCode == 27)
					_$listsmodel.getById(_$scope.route.listID)
					.displayname=_$scope.status.listNameBackup
					_$scope.endEditList()

			@_$scope.submitNewName = () ->
				name = _$listsmodel.getById(_$scope.route.listID)
				.displayname
				if name
					if  _$listsmodel.checkName(name,_$scope.route.listID)
						_$listsbusinesslayer.setListName(_$scope.route.listID)
						_$scope.endEditList()
					else
						alert(t('tasks',
						'The name "%s" is already used.')
						.replace('%s',name))
				else
					alert(t('tasks',
					'An empty name is not allowed.'))

			@_$scope.endEditList = () ->
				$location.path('/lists/'+_$scope.route.listID)

			@_$scope.setListName = (listID, listName) ->
				_$listsbusinesslayer.setListName listID listName

			@_$scope.getCollectionCount = (collectionID) ->
				filter = _$searchbusinesslayer.getFilter()
				return _$collectionsmodel.getCount(collectionID,filter)

			@_$scope.hideCollection = (collectionID) ->
				collection = _$collectionsmodel.getById(collectionID)
				switch collection.show
					when 0
						return true
					when 1
						return false
					when 2
						return (@getCollectionCount(collectionID) < 1)

			@_$scope.getCollectionString = (collectionID) ->
				if collectionID != 'completed'
					filter = _$searchbusinesslayer.getFilter()
					return _$collectionsmodel.getCount(collectionID,filter)
				else
					return ''

			@_$scope.getListCount = (listID,type) ->
				filter = _$searchbusinesslayer.getFilter()
				return _$listsmodel.getCount(listID,type,filter)

			@_$scope.showDelete = (listID) ->
				return _$scope.route.listID not in
				['starred', 'today', 'completed', 'week', 'all', 'current']

			@_$scope.update = () ->
				if not _$scope.isLoading()
					# _$collectionsbusinesslayer.updateModel()
					_$tasksbusinesslayer.updateModel()
					_$listsbusinesslayer.updateModel()


	return new ListController($scope, $window, $routeParams,
		ListsModel, TasksBusinessLayer, CollectionsModel,
		ListsBusinessLayer, $location, SearchBusinessLayer)
]