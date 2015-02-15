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

			@getCollections()
			@getSettings()
			@getLists()
			@getTasks('init', 'all', successCallback)

			@deferred.promise

		getCollections: (onSuccess, showLoading=true) ->
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

			@_request.get '/apps/tasks/collections', params

		getSettings: (onSuccess, showLoading=true) ->
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

			@_request.get '/apps/tasks/settings', params

		setVisibility: (collectionID, visibility) ->
			params =
				routeParams:
					collectionID: collectionID
					visibility: visibility

			@_request.post '/apps/tasks/collection/
			{collectionID}/visibility/{visibility}', params

		setting: (type, setting, value) ->
			params =
				routeParams:
					type: type
					setting: setting
					value: +value

			@_request.post '/apps/tasks/settings/
			{type}/{setting}/{value}', params



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

			@_request.get '/apps/tasks/lists', params

		addList: (list, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				data:
					name:	list.displayname
					tmpID:	list.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post '/apps/tasks/lists/add', params

		setListName: (list) ->
			params =
				routeParams:
					listID: list.id
				data:
					name: list.displayname

			@_request.post '/apps/tasks/lists/{listID}/name', params

		deleteList: (listID) ->
			params =
				routeParams:
					listID: listID

			@_request.post '/apps/tasks/lists/{listID}/delete', params

		getTasks: (type='init', listID='all', onSuccess, showLoading=true) ->
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
					listID: listID
					type:	type

			@_request.get '/apps/tasks/tasks/{type}/{listID}', params

		getTask: (taskID, onSuccess, showLoading=true) ->
			onSuccess or= ->

			if showLoading
				@_Loading.increase()
				successCallbackWrapper = () =>
					onSuccess()
					@_Loading.decrease()
				failureCallbackWrapper = () =>
					@_Loading.decrease()
			else
				successCallbackWrapper = () =>
					onSuccess()
				failureCallbackWrapper = () =>
			params =
				onSuccess: successCallbackWrapper
				onFailure: failureCallbackWrapper
				routeParams:
					taskID: taskID

			@_request.get '/apps/tasks/task/{taskID}', params

		starTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks/tasks/{taskID}/star', params

		unstarTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks/tasks/{taskID}/unstar', params

		setPercentComplete: (taskID, complete) ->
			params =
				routeParams:
					taskID: taskID
				data:
					complete: complete

			@_request.post '/apps/tasks/tasks/{taskID}/percentcomplete', params

		addTask: (task, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->
			params =
				data:
					name:		task.name
					calendarID:	task.calendarID
					starred:	task.starred
					due:		task.due
					start:		task.start
					tmpID:		task.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post '/apps/tasks/tasks/add', params

		deleteTask: (taskID) ->
			params =
				routeParams:
					taskID: taskID

			@_request.post '/apps/tasks/tasks/{taskID}/delete', params

		setDueDate: (taskID, due) ->
			params =
				routeParams:
					taskID: taskID
				data:
					due: due

			@_request.post '/apps/tasks/tasks/{taskID}/due', params

		setStartDate: (taskID, start) ->
			params =
				routeParams:
					taskID: taskID
				data:
					start: start

			@_request.post '/apps/tasks/tasks/{taskID}/start', params

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
						week:		reminder.duration.week
						day:		reminder.duration.day
						hour:		reminder.duration.hour
						minute:		reminder.duration.minute
						second:		reminder.duration.second
						invert:		reminder.duration.params.invert
						related:	reminder.duration.params.related

			else return

			@_request.post '/apps/tasks/tasks/{taskID}/reminder', params

		changeCalendarId: (taskID, calendarID) ->
			params =
				routeParams:
					taskID: taskID
				data:
					calendarID: calendarID

			@_request.post '/apps/tasks/tasks/{taskID}/calendar', params

		setTaskName: (taskID, name) ->
			params =
				routeParams:
					taskID: taskID
				data:
					name: name

			@_request.post '/apps/tasks/tasks/{taskID}/name', params

		setTaskNote: (taskID, note) ->
			params =
				routeParams:
					taskID: taskID
				data:
					note: note

			@_request.post '/apps/tasks/tasks/{taskID}/note', params

		setShowHidden: (showHidden) ->
			params =
				routeParams:
					showHidden: +showHidden

			@_request.post '/apps/tasks/settings/showhidden/{showHidden}',
			params

		addComment: (comment, onSuccess=null, onFailure=null) ->
			params =
				routeParams:
					taskID: comment.taskID
				data:
					comment: comment.comment
					tmpID: comment.tmpID
				onSuccess: onSuccess
				onFailure: onFailure

			@_request.post '/apps/tasks/tasks/{taskID}/comment',
			params

		deleteComment: (taskID, commentID) ->
			params =
				routeParams:
					taskID: taskID
					commentID: commentID

			@_request.post '/apps/tasks/tasks/{taskID}/comment/
			{commentID}/delete', params

	return new Persistence(Request, Loading, $rootScope)

]