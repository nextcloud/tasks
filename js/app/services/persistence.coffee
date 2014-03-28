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

			@_request.get 'getLists', params

		addList: (list, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				routeParams:
					name:	list.displayname
				data:
					tmpID:	list.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post 'list_add', params

		setListName: (list) ->
			params =
				routeParams:
					listID: list.id
				data:
					name: list.displayname

			@_request.post 'list_name', params

		deleteList: (listID) ->
			params =
				routeParams:
					listID: listID

			@_request.post 'list_delete', params

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

			@_request.get 'getTasks', params

		starTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post 'task_star', params

		unstarTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post 'task_unstar', params

		completeTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post 'task_complete', params

		uncompleteTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post 'task_uncomplete', params

		addTask: (task, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				routeParams:
					name:	task.name
					calendarID: task.calendarID
				data:
					starred:	task.starred
					due:		task.due
					tmpID:		task.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post 'task_add', params

		deleteTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post 'task_delete', params

		setDueDate: (taskID, due) ->
			params =
				routeParams:
					taskID: taskID
				data:
					due: due

			@_request.post 'task_due', params

		setReminderDate: (taskID, reminder) ->
			params =
				routeParams:
					taskID: taskID
				data:
					reminder: reminder

			@_request.post 'task_reminder', params

		changeCalendarId: (taskID, calendarID) ->
			params =
				routeParams:
					taskID: taskID
				data:
					calendarID: calendarID

			@_request.post 'task_calendar', params

		setTaskName: (taskID, name) ->
			params =
				routeParams:
					taskID: taskID
				data:
					name: name

			@_request.post 'task_name', params

		setTaskNote: (taskID, note) ->
			params =
				routeParams:
					taskID: taskID
				data:
					note: note

			@_request.post 'task_note', params

	return new Persistence(Request, Loading, $rootScope)

]