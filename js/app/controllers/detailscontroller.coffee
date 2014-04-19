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
angular.module('Tasks').controller 'DetailsController',
['$scope', '$window', 'TasksModel', 'TasksBusinessLayer',
'$route', '$location', '$timeout', '$routeParams',
($scope, $window, TasksModel, TasksBusinessLayer, $route, $location,
$timeout, $routeParams) ->

	class DetailsController

		constructor: (@_$scope, @_$window, @_$tasksmodel,
			@_tasksbusinesslayer, @_$route, @_$location, @_$timeout,
			@_$routeparams) ->

			@_$scope.task = _$tasksmodel.getById(_$scope.route.taskID)

			@_$scope.$on('$routeChangeSuccess', () ->
				_$scope.task = _$tasksmodel.getById(_$scope.route.taskID)
			)

			@_$scope.closeDetails = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString)
				else
					_$location.path('/lists/'+_$scope.route.listID)


			@_$scope.deleteTask = (taskID) ->
				_$scope.closeDetails()
				_$timeout(() ->
					_tasksbusinesslayer.deleteTask taskID
				,500)

			@_$scope.editName = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/name')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/name')

			@_$scope.editDueDate = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/duedate')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/duedate')

			@_$scope.editStart = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/startdate')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/startdate')

			@_$scope.editReminder = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/reminder')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/reminder')

			@_$scope.editNote = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/note')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/note')

			@_$scope.endEdit = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID)
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID)

			@_$scope.endName = (event) ->
				if (event.keyCode == 13)
					event.preventDefault()
					_$scope.endEdit()
				if(event.keyCode == 27)
					_$scope.endEdit()

			@_$scope.deleteDueDate = () ->
				_tasksbusinesslayer.deleteDueDate(_$scope.route.taskID, undefined)
				_$scope.endEdit()

			@_$scope.deleteReminder = () ->
				_tasksbusinesslayer.setReminderDate(_$scope.route.taskID, undefined)
				_$scope.endEdit()

			@_$scope.deleteStartDate = () ->
				_tasksbusinesslayer.setStartDate(_$scope.route.taskID, undefined)
				_$scope.endEdit()

			@_$scope.toggleCompleted = (taskID) ->
				if _$tasksmodel.completed(taskID)
					_tasksbusinesslayer.uncompleteTask(taskID)
				else
					_tasksbusinesslayer.completeTask(taskID)

			@_$scope.toggleStarred = (taskID) ->
				if _$tasksmodel.starred(taskID)
					_tasksbusinesslayer.unstarTask(taskID)
				else
					_tasksbusinesslayer.starTask(taskID)

			@_$scope.isDue = (date) ->
				return _$tasksmodel.due(date)

			@_$scope.isOverDue = (date) ->
				return _$tasksmodel.overdue(date)

			@_$scope.$watch('task', (newVal, oldVal) ->
				if newVal == oldVal || undefined in [newVal, oldVal] ||
				newVal.id != oldVal.id
					return
				else
					if newVal.name != oldVal.name
						if _$scope.nametimer
							$timeout.cancel(_$scope.nametimer)
						_$scope.nametimer = $timeout( () ->
							_tasksbusinesslayer.setTaskName(_$scope.task.id,_$scope.task.name)
						,2000)
					if newVal.note != oldVal.note
						if _$scope.notetimer
							$timeout.cancel(_$scope.notetimer)
						_$scope.notetimer = $timeout( () ->
							_tasksbusinesslayer.setTaskNote(_$scope.task.id,_$scope.task.note)
						,5000)
			,true)

			@_$scope.setstartday = (date) ->
				_tasksbusinesslayer.setStartDay(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY'))

			@_$scope.setstarttime = (date) ->
				_tasksbusinesslayer.setStartTime(_$scope.route.taskID,
				moment(date,'HH:mm'))

			@_$scope.setdueday = (date) ->
				_tasksbusinesslayer.setDueDay(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY'))

			@_$scope.setduetime = (date) ->
				_tasksbusinesslayer.setDueTime(_$scope.route.taskID,
				moment(date,'HH:mm'))

			@_$scope.setreminder = (date) ->
				_tasksbusinesslayer.setReminderDate(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY').format('YYYYMMDDTHHmmss'))

	return new DetailsController($scope, $window, TasksModel,
		TasksBusinessLayer, $route, $location, $timeout, $routeParams)
]