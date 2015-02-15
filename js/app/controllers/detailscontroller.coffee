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
'SettingsModel', 'Loading',
($scope, $window, TasksModel, TasksBusinessLayer, $route, $location,
$timeout, $routeParams, SettingsModel, Loading) ->

	class DetailsController

		constructor: (@_$scope, @_$window, @_$tasksmodel,
			@_tasksbusinesslayer, @_$route, @_$location, @_$timeout,
			@_$routeparams, @_$settingsmodel, @_Loading) ->

			@_$scope.task = _$tasksmodel.getById(_$scope.route.taskID)

			@_$scope.found = true

			@_$scope.$on('$routeChangeSuccess', () ->
				task = _$tasksmodel.getById(_$scope.route.taskID)
				if !(angular.isUndefined(task) || task == null)
					_$scope.task = task
					_$scope.found = true
				else if (_$scope.route.taskID != undefined)
					_$scope.found = false
					_tasksbusinesslayer.getTask _$scope.route.taskID
						, (data) =>
							_$scope.loadTask(_$scope.route.taskID)
			)
			
			@_$scope.settingsmodel = @_$settingsmodel

			@_$scope.isAddingComment = false

			@_$scope.timers = []

			@_$scope.durations = [
				{
					name:	t('tasks','week'),
					names:	t('tasks','weeks'),
					id:		'week'},
				{
					name:	t('tasks','day'),
					names:	t('tasks','days'),
					id:		'day'},
				{
					name:	t('tasks','hour'),
					names:	t('tasks','hours'),
					id:		'hour'},
				{
					name:	t('tasks','minute'),
					names:	t('tasks','minutes'),
					id:		'minute'},
				{
					name:	t('tasks','second'),
					names:	t('tasks','seconds'),
					id:		'second'}
			]

			@_$scope.loadTask = (taskID) ->
				task = _$tasksmodel.getById(_$scope.route.taskID)
				if !(angular.isUndefined(task) || task == null)
					_$scope.task = task
					_$scope.found = true

			@_$scope.TaskState = () ->
				if _$scope.found
					return 'found'
				else
					if _Loading.isLoading()
						return 'loading'
					else
						return null

			@_$scope.params = (task) ->
				params = [
						{
							name:	t('tasks','before beginning'),
							invert:	true
							related:'START',
							id:		"10"},
						{
							name:	t('tasks','after beginning'),
							invert:	false
							related:'START',
							id:		"00"},
						{
							name:	t('tasks','before end'),
							invert:	true
							related:'END',
							id:		"11"},
						{
							name:	t('tasks','after end'),
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
				_$location.path('/lists/'+_$scope.route.listID)

			@_$scope.deleteTask = (taskID) ->
				_$scope.closeDetails()
				_$timeout(() ->
					_tasksbusinesslayer.deleteTask taskID
				,500)

			@_$scope.editName = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/name')

			@_$scope.editDueDate = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/duedate')
				_tasksbusinesslayer.initDueDate(_$scope.route.taskID)

			@_$scope.editStart = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/startdate')
				_tasksbusinesslayer.initStartDate(_$scope.route.taskID)

			@_$scope.editReminder = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/reminder')
				_tasksbusinesslayer.initReminder(_$scope.route.taskID)

			@_$scope.editNote = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/note')

			@_$scope.editPercent = () ->
				_$location.path('/lists/'+_$scope.route.listID +
					'/tasks/' + _$scope.route.taskID + '/edit/percent')

			@_$scope.endEdit = () ->
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

			@_$scope.deletePercent = () ->
				_tasksbusinesslayer.setPercentComplete(_$scope.route.taskID,0)
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
						if _$scope.timers['task'+newVal.id+'name']
							$timeout.cancel(_$scope.timers['task'+newVal.id+'name'])
						_$scope.timers['task'+newVal.id+'name'] = $timeout( () ->
							_tasksbusinesslayer.setTaskName(newVal.id,newVal.name)
						,3000)
					if newVal.note != oldVal.note
						if _$scope.timers['task'+newVal.id+'note']
							$timeout.cancel(_$scope.timers['task'+newVal.id+'note'])
						_$scope.timers['task'+newVal.id+'note'] = $timeout( () ->
							_tasksbusinesslayer.setTaskNote(newVal.id,newVal.note)
						,5000)
					if newVal.complete != oldVal.complete
						if _$scope.timers['task'+newVal.id+'complete']
							$timeout.cancel(_$scope.timers['task'+newVal.id+'complete'])
						_$scope.timers['task'+newVal.id+'complete'] = $timeout( () ->
							_tasksbusinesslayer.setPercentComplete(newVal.id,
							newVal.complete)
						,1000)
			,true)

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

			@_$scope.addComment = () ->
				if _$scope.CommentContent
					_$scope.isAddingComment = true

					comment = {
						tmpID:		'newComment' + Date.now()
						comment:	_$scope.CommentContent
						taskID:		_$scope.route.taskID
						time:		moment().format('YYYYMMDDTHHmmss')
						name:		$('#expandDisplayName').text()
					}

					_tasksbusinesslayer.addComment comment
					, (data) =>
						_$tasksmodel.updateComment(data.comment)
						_$scope.isAddingComment = false
					, =>
						_$scope.isAddingComment = false

					_$scope.CommentContent = ''

			@_$scope.sendComment = (event) ->
				if (event.keyCode == 13)
					_$scope.addComment()

			@_$scope.deleteComment = (commentID) ->
				_tasksbusinesslayer.deleteComment(_$scope.route.taskID, commentID)

			@_$scope.commentStrings = () ->
				{
					button: t('tasks','Comment'),
					input:	t('tasks','Add a comment')
				}


	return new DetailsController($scope, $window, TasksModel,
		TasksBusinessLayer, $route, $location, $timeout, $routeParams,
		SettingsModel, Loading)
]