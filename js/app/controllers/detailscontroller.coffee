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

			@_$scope.durations = [
				{
					name:	t('tasks_enhanced','week'),
					names:	t('tasks_enhanced','weeks'),
					id:		'week'},
				{
					name:	t('tasks_enhanced','day'),
					names:	t('tasks_enhanced','days'),
					id:		'day'},
				{
					name:	t('tasks_enhanced','hour'),
					names:	t('tasks_enhanced','hours'),
					id:		'hour'},
				{
					name:	t('tasks_enhanced','minute'),
					names:	t('tasks_enhanced','minutes'),
					id:		'minute'},
				{
					name:	t('tasks_enhanced','second'),
					names:	t('tasks_enhanced','seconds'),
					id:		'second'}
			]

			@_$scope.params = (task) ->
				params = [
						{
							name:	t('tasks_enhanced','before beginning'),
							invert:	true
							related:'START',
							id:		"10"},
						{
							name:	t('tasks_enhanced','after beginning'),
							invert:	false
							related:'START',
							id:		"00"},
						{
							name:	t('tasks_enhanced','before end'),
							invert:	true
							related:'END',
							id:		"11"},
						{
							name:	t('tasks_enhanced','after end'),
							invert:	false
							related:'END',
							id:		"01"}
					]
				if task.due && task.start
					return params
				else if task.start
					return params.slice(0,2)
				else
					return params.slice(2)

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
				_tasksbusinesslayer.initDueDate(_$scope.route.taskID)

			@_$scope.editStart = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/startdate')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/startdate')
				_tasksbusinesslayer.initStartDate(_$scope.route.taskID)

			@_$scope.editReminder = () ->
				if _$scope.status.searchActive
					_$location.path('/search/'+_$scope.route.searchString +
					'/tasks/' + _$scope.route.taskID + '/edit/reminder')
				else
					_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/reminder')
				_tasksbusinesslayer.initReminder(_$scope.route.taskID)

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
				_tasksbusinesslayer.deleteDueDate(_$scope.route.taskID)
				_$scope.endEdit()

			@_$scope.deleteStartDate = () ->
				_tasksbusinesslayer.deleteStartDate(_$scope.route.taskID)
				_$scope.endEdit()

			@_$scope.deleteReminder = () ->
				_tasksbusinesslayer.deleteReminderDate(_$scope.route.taskID)
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

			@_$scope.setPercentComplete = (percentComplete) ->
				_tasksbusinesslayer.setPercentComplete(_$scope.route.taskID,
				percentComplete)

			@_$scope.setstartday = (date) ->
				_tasksbusinesslayer.setStart(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY'),'day')

			@_$scope.setstarttime = (date) ->
				_tasksbusinesslayer.setStart(_$scope.route.taskID,
				moment(date,'HH:mm'),'time')

			@_$scope.setdueday = (date) ->
				_tasksbusinesslayer.setDue(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY'),'day')

			@_$scope.setduetime = (date) ->
				_tasksbusinesslayer.setDue(_$scope.route.taskID,
				moment(date,'HH:mm'),'time')

			@_$scope.setreminderday = (date) ->
				_tasksbusinesslayer.setReminderDate(_$scope.route.taskID,
				moment(date,'MM/DD/YYYY'),'day')

			@_$scope.setremindertime = (date) ->
				_tasksbusinesslayer.setReminderDate(_$scope.route.taskID,
				moment(date,'HH:mm'),'time')

			@_$scope.reminderType = (task) ->
				if !angular.isUndefined(task)
					if task.reminder == null
						if moment(task.start, "YYYYMMDDTHHmmss").isValid() ||
						moment(task.due, "YYYYMMDDTHHmmss").isValid()
							return 'DURATION'
						else
							return 'DATE-TIME'
					else
						return task.reminder.type

			@_$scope.changeReminderType = (task) ->
				_tasksbusinesslayer.checkReminderDate(task.id)
				if @reminderType(task) == 'DURATION'
					if task.reminder
						task.reminder.type = 'DATE-TIME'
					else
						task.reminder = {type:'DATE-TIME'}
				else
					if task.reminder
						task.reminder.type = 'DURATION'
					else
						task.reminder = {type:'DURATION'}
				_tasksbusinesslayer.setReminder(task.id)


			@_$scope.setReminderDuration = (taskID) ->
				_tasksbusinesslayer.setReminder(_$scope.route.taskID)

	return new DetailsController($scope, $window, TasksModel,
		TasksBusinessLayer, $route, $location, $timeout, $routeParams)
]