###

ownCloud - News

@author Bernhard Posselt
@copyright 2012 Bernhard Posselt nukeawhale@gmail.com

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

angular.module('Tasks').factory 'Persistence',
['Request', 'Loading', '$rootScope', '$q',
(Request, Loading, $rootScope, $q) ->

	class Persistence

		constructor: (@_request, @_Loading, @_$rootScope) ->

		init: ->
			@deferred = $q.defer()

			successCallback = =>
				@deferred.resolve()

			@getLists()
			@getTasks(successCallback)

			@deferred.promise

		getLists: (onSuccess, showLoading=true, which='all') ->
			onSuccess or= ->

			if showLoading
				@_Loading.increase()
				successCallbackWrapper = (data) =>
					onSuccess()
					@_Loading.decrease()
				failureCallbackWrapper = (data) =>
					@_Loading.decrease()
			else
				successCallbackWrapper = (data) =>
					onSuccess()
				failureCallbackWrapper = (data) =>
			
			params =
				onSuccess: successCallbackWrapper
				onFailure: failureCallbackWrapper
				routeParams:
					request: which

			@_request.get '/apps/tasks_enhanced/lists', params

		addList: (list, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				data:
					name:	list.displayname
					tmpID:	list.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post '/apps/tasks_enhanced/lists/add', params

		setListName: (list) ->
			params =
				routeParams:
					listID: list.id
				data:
					name: list.displayname

			@_request.post '/apps/tasks_enhanced/lists/{listID}/name', params

		deleteList: (listID) ->
			params =
				routeParams:
					listID: listID

			@_request.post '/apps/tasks_enhanced/lists/{listID}/delete', params

		getTasks: (onSuccess, showLoading=true) ->
			onSuccess or= ->

			if showLoading
				@_Loading.increase()
				successCallbackWrapper = (data) =>
					onSuccess()
					@_Loading.decrease()
				failureCallbackWrapper = (data) =>
					@_Loading.decrease()
			else
				successCallbackWrapper = (data) =>
					onSuccess()
				failureCallbackWrapper = (data) =>
			
			params =
				onSuccess: successCallbackWrapper
				onFailure: failureCallbackWrapper

			@_request.get '/apps/tasks_enhanced/tasks', params

		starTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/star', params

		unstarTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/unstar', params

		completeTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/complete', params

		uncompleteTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/uncomplete', params

		addTask: (task, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				# routeParams:
				# 	name:	task.name
				# 	calendarID: task.calendarID
				data:
					name:		task.name
					calendarID:	task.calendarID
					starred:	task.starred
					due:		task.due
					start:		task.start
					tmpID:		task.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post '/apps/tasks_enhanced/tasks/add', params

		deleteTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/delete', params

		setDueDate: (taskID, due) ->
			params =
				routeParams:
					taskID: taskID
				data:
					due: due

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/due', params

		setStartDate: (taskID, start) ->
			params =
				routeParams:
					taskID: taskID
				data:
					start: start

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/start', params

		setReminder: (taskID, reminder) ->
			if reminder == false
				params =
					routeParams:
						taskID: taskID
					data:
						type:	false
			else if reminder.type == 'DATE-TIME'
				params =
					routeParams:
						taskID: taskID
					data:
						type:	reminder.type
						action:	reminder.action
						date:	moment(reminder.date, 'YYYYMMDDTHHmmss').unix()
			else if reminder.type == 'DURATION'
				params =
					routeParams:
						taskID: taskID
					data:
						type:		reminder.type
						action:		reminder.action
						duration:	reminder.duration
			else return

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/reminder', params

		changeCalendarId: (taskID, calendarID) ->
			params =
				routeParams:
					taskID: taskID
				data:
					calendarID: calendarID

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/calendar', params

		setTaskName: (taskID, name) ->
			params =
				routeParams:
					taskID: taskID
				data:
					name: name

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/name', params

		setTaskNote: (taskID, note) ->
			params =
				routeParams:
					taskID: taskID
				data:
					note: note

			@_request.post '/apps/tasks_enhanced/tasks/{taskID}/note', params

	return new Persistence(Request, Loading, $rootScope)

]