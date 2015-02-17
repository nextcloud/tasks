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
angular.module('Tasks').factory 'TasksModel',
['_Model', '_EqualQuery', 'Utils',
(_Model, _EqualQuery, Utils) ->
	class TasksModel extends _Model

		constructor: (@_utils) ->
			@_tmpIdCache = {}
			super()

		add: (task, clearCache=true) ->

			tmptask = @_tmpIdCache[task.tmpID]

			updateById = angular.isDefined(task.id) and
			angular.isDefined(@getById(task.id))

			updateByTmpId = angular.isDefined(tmptask) and
			angular.isUndefined(tmptask.id)

			if updateById or updateByTmpId
				@update(task, clearCache)
			else
				if angular.isDefined(task.id)
					super(task, clearCache)
				else
					@_tmpIdCache[task.tmpID] = task
					@_data.push(task)
					if clearCache
						@_invalidateCache()

		update: (task, clearCache=true) ->
			tmptask = @_tmpIdCache[task.tmpID]

			if angular.isDefined(task.id) and
			angular.isDefined(tmptask) and
			angular.isUndefined(tmptask.id)
				tmptask.id = task.id
				@_dataMap[task.id] = tmptask
			
			task.void = false
			super(task, clearCache)

		removeById: (taskID) ->
			super(taskID)

		voidAll: () ->
			tasks = @getAll()
			for task in tasks
				task.void = true

		removeVoid: () ->
			tasks = @getAll()
			taskIDs = []
			for task in tasks
				if task.void
					taskIDs.push task.id
			for id in taskIDs
				@removeById(id)

		removeByList: (listID) ->
			tasks = @getAll()
			taskIDs = []
			for task in tasks
				if task.calendarid == listID
					taskIDs.push task.id
			for id in taskIDs
				@removeById(id)

		taskAtDay: (task, date) ->
			start = moment(task.start, "YYYYMMDDTHHmmss")
			due = moment(task.due, "YYYYMMDDTHHmmss")
			if start.isValid() && !due.isValid()
				diff = start.diff(moment().startOf('day'), 'days', true)
				if !date && diff < date+1
					return true
				else if diff < date+1 && diff >= date
					return true
			if due.isValid() && !start.isValid()
				diff = due.diff(moment().startOf('day'), 'days', true)
				if !date && diff < date+1
					return true
				else if diff < date+1 && diff >= date
					return true
			if start.isValid() && due.isValid()
				startdiff = start.diff(moment().startOf('day'), 'days', true)
				duediff = due.diff(moment().startOf('day'), 'days', true)
				if !date && (startdiff < date+1 || duediff < date+1)
					return true
				else if startdiff < date+1 && startdiff >= date && duediff >= date
					return true
				else if duediff < date+1 && duediff >= date && startdiff >= date
					return true
			return false

		isLoaded: (task) ->
			return if @getById(task.id) then true else false

		filterTasks: (task, filter) ->
			switch filter
				when 'completed'
					return task.completed == true
				when 'all'
					return task.completed == false
				when 'current'
					return (task.completed == false && @current(task.start, task.due))
				when 'starred'
					return (task.completed == false && task.starred == true)
				when 'today'
					return (task.completed == false && (@today(task.start) ||
					@today(task.due)))
				when 'week'
					return (task.completed == false && (@week(task.start) ||
					@week(task.due)))
				else
					return ''+task.calendarid == ''+filter

		filterTasksByString: (task, filter) ->
				keys = ['name', 'note', 'location',
						'categories', 'comments']
				filter = filter.toLowerCase()
				for key,value of task
					if key in keys
						if key == 'comments'
							for comment in task.comments
								if comment.comment.toLowerCase().indexOf(filter) !=-1
									return true
						else if key == 'categories'
							for category in task.categories
								if category.toLowerCase().indexOf(filter) !=-1
									return true
						else if value.toLowerCase().indexOf(filter) !=-1
							return true
				return false

		starred: (taskID) ->
			return @getById(taskID).starred

		star: (taskID) ->
			@update({id:taskID,starred:true})

		unstar: (taskID) ->
			@update({id:taskID,starred:false})

		completed: (taskID) ->
			return @getById(taskID).completed

		complete: (taskID) ->
			@update({id:taskID,completed:true,
			completed_date:moment().format("YYYYMMDDTHHmmss")})

		uncomplete: (taskID) ->
			@update({id:taskID,completed:false,
			completed_date:null})

		setPercentComplete: (taskID, complete) ->
			@update({id:taskID,complete:complete})

		setDueDate: (taskID,date) ->
			@update({id:taskID,due:date})

		setReminder: (taskID,reminder) ->
			@update({id:taskID,reminder:reminder})

		setStartDate: (taskID,date) ->
			@update({id:taskID,start:date})

		overdue: (due) ->
			return (moment(due, "YYYYMMDDTHHmmss").isValid() &&
				moment(due, "YYYYMMDDTHHmmss").
				diff(moment()) < 0)

		due: (due) ->
			return moment(due, 'YYYYMMDDTHHmmss').isValid()

		today: (due) ->
			return (moment(due, "YYYYMMDDTHHmmss").isValid() &&
				moment(due, "YYYYMMDDTHHmmss").
				diff(moment().startOf('day'), 'days', true) < 1)

		week: (due) ->
			return (moment(due, "YYYYMMDDTHHmmss").isValid() &&
				moment(due, "YYYYMMDDTHHmmss").
				diff(moment().startOf('day'), 'days', true) < 7)

		current: (start, due) ->
			return (!moment(start, "YYYYMMDDTHHmmss").isValid() ||
				moment(start, "YYYYMMDDTHHmmss").
				diff(moment(), 'days', true) < 0 ||
				moment(due, "YYYYMMDDTHHmmss").
				diff(moment(), 'days', true) < 0)

		changeCalendarId: (taskID, calendarID) ->
			@update({id:taskID,calendarid:calendarID})

		setNote: (taskID, note) ->
			@update({id:taskID,note:note})

		addComment: (comment) ->
			task = @getById(comment.taskID)
			if task.comments
				task.comments.push(comment)
			else
				task.comments = [comment]

		updateComment: (comment) ->
			task = @getById(comment.taskID)
			i = 0
			for com in task.comments
				if com.tmpID == comment.tmpID
					task.comments[i] = comment
					break
				i++

		deleteComment: (taskID, commentID) ->
			task = @getById(taskID)
			i = 0
			for comment in task.comments
				if comment.id == commentID
					task.comments.splice(i,1)
					break
				i++

	return new TasksModel(Utils)
]