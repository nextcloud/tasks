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


angular.module('Tasks').factory 'TasksBusinessLayer',
['TasksModel', 'Persistence',
(TasksModel, Persistence) ->

	class TasksBusinessLayer

		constructor: (@_$tasksmodel, @_persistence) ->

		addTask: (task, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->

			@_$tasksmodel.add(task)

			success = (response) =>
				if response.status == 'error'
					onFailure()
				else
					onSuccess(response.data)
			@_persistence.addTask(task, success)

		getTask: (taskID, onSuccess=null, onFailure=null) ->
			onSuccess or= ->

			@_persistence.getTask(taskID, onSuccess, true)

		starTask: (taskID) ->
			@_$tasksmodel.star(taskID)
			@_persistence.starTask(taskID)

		unstarTask: (taskID) ->
			@_$tasksmodel.unstar(taskID)
			@_persistence.unstarTask(taskID)

		completeTask: (taskID) ->
			@setPercentComplete(taskID,100)

		setPercentComplete: (taskID, percentComplete) ->
			@_$tasksmodel.setPercentComplete(taskID, percentComplete)
			if percentComplete < 100
				@_$tasksmodel.uncomplete(taskID)
			else
				@_$tasksmodel.complete(taskID)
			@_persistence.setPercentComplete(taskID, percentComplete)

		uncompleteTask: (taskID) ->
			@setPercentComplete(taskID,0)

		deleteTask: (taskID) ->
			@_$tasksmodel.removeById(taskID)
			@_persistence.deleteTask(taskID)

		initDueDate: (taskID) ->
			due = moment(@_$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss")
			if !due.isValid()
				@setDue(taskID, moment().startOf('hour').add('h',1),'time')

		setDue: (taskID, date, type='day') ->
			due = moment(@_$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss")
			if type=='day'
				if moment(due).isValid()
					due.year(date.year()).month(date.month()).date(date.date())
				else
					due = date.add('h',12)
			else if type == 'time'
				if moment(due).isValid()
					due.hour(date.hour()).minute(date.minute())
				else
					due = date
			else if type == 'all'
				due = date
			else
				return
			@_$tasksmodel.setDueDate(taskID,due.format('YYYYMMDDTHHmmss'))
			@checkReminderDate(taskID)
			@_persistence.setDueDate(taskID,
				if due.isValid() then due.unix() else false)

		deleteDueDate: (taskID) ->
			reminder = @_$tasksmodel.getById(taskID).reminder
			if (reminder != null && reminder.type == 'DURATION' &&
			reminder.duration.params.related == 'END')
				@deleteReminderDate(taskID)
			@_$tasksmodel.setDueDate(taskID, null)
			@_persistence.setDueDate(taskID, false)

		initStartDate: (taskID) ->
			start = moment(@_$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss")
			if !start.isValid()
				@setStart(taskID, moment().startOf('hour').add('h',1),'time')

		setStart: (taskID, date, type='day') ->
			start = moment(@_$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss")
			if type == 'day'
				if moment(start).isValid()
					start.year(date.year()).month(date.month()).date(date.date())
				else
					start = date.add('h',12)
			else if type == 'time'
				if moment(start).isValid()
					start.hour(date.hour()).minute(date.minute())
				else
					start = date
			else
				return
			@_$tasksmodel.setStartDate(taskID,start.format('YYYYMMDDTHHmmss'))
			@checkReminderDate(taskID)
			@_persistence.setStartDate(taskID,
				if start.isValid() then start.unix() else false)

		deleteStartDate: (taskID) ->
			reminder = @_$tasksmodel.getById(taskID).reminder
			if (reminder != null && reminder.type == 'DURATION' &&
			reminder.duration.params.related == 'START')
				@deleteReminderDate(taskID)
			@_$tasksmodel.setStartDate(taskID, null)
			@_persistence.setStartDate(taskID, false)

		initReminder: (taskID) ->
			if !@checkReminderDate(taskID)
				task = @_$tasksmodel.getById(taskID)
				task.reminder = {
					type:		'DURATION',
					action:		'DISPLAY',
					duration:	{
						token:	'week',
						week:	0,
						day:	0,
						hour:	0,
						minute:	0,
						second:	0,
						params: {
							invert: true
						}
					}
				}
				if moment(task.start, "YYYYMMDDTHHmmss").isValid()
					p = task.reminder.duration.params
					p.related = 'START'
					p.id = '10'
				else if	moment(task.due, "YYYYMMDDTHHmmss").isValid()
					p = task.reminder.duration.params
					p.related = 'END'
					p.id = '11'
				else
					task.reminder.type = 'DATE-TIME'
					task.reminder.date = moment().startOf('hour').add('h',1)
					.format('YYYYMMDDTHHmmss')
			@setReminder(taskID)

		setReminderDate: (taskID, date, type='day') ->
			reminder = @_$tasksmodel.getById(taskID).reminder
			newreminder = {
				type:		'DATE-TIME',
				action:		'DISPLAY',
				duration:	null
			}
			if type == 'day'
				if (@checkReminderDate(taskID) || reminder == null)
					reminderdate = moment(reminder.date, "YYYYMMDDTHHmmss")
					newreminder.action = reminder.action
					if (reminderdate.isValid() && reminder.type == 'DATE-TIME')
						reminderdate.year(date.year()).month(date.month()).date(date.date())
					else
						reminderdate = date.add('h',12)
				else
					reminderdate = date.add('h',12)
			else if type == 'time'
				if (@checkReminderDate(taskID) || reminder == null)
					reminderdate = moment(reminder.date, "YYYYMMDDTHHmmss")
					newreminder.action = reminder.action
					if (reminderdate.isValid() && reminder.type == 'DATE-TIME')
						reminderdate.hour(date.hour()).minute(date.minute())
					else
						reminderdate = date
				else
					reminderdate = date
			else
				return
			newreminder.date = reminderdate.format('YYYYMMDDTHHmmss')
			@_$tasksmodel.setReminder(taskID,newreminder)
			@_persistence.setReminder(taskID,newreminder)

		setReminder: (taskID) ->
			if @checkReminderDate(taskID)
				reminder = @_$tasksmodel.getById(taskID).reminder
				@_persistence.setReminder(taskID,reminder)

		checkReminderDate: (taskID) ->
			task = @_$tasksmodel.getById(taskID)
			reminder = task.reminder
			if(reminder != null && reminder.type == 'DURATION')
				if !reminder.duration
					return false
				else if reminder.duration.params.related == 'START'
					token = 'start'
				else if reminder.duration.params.related == 'END'
					token = 'due'
				else
					return false
				date = moment(task[token], "YYYYMMDDTHHmmss")
				duration = reminder.duration
				d = {
					w:	duration.week,
					d:	duration.day,
					h:	duration.hour,
					m:	duration.minute,
					s:	duration.second
				}
				if duration.params.invert
					date = date.subtract(d)
				else
					date = date.add(d)
				task.reminder.date = date.format('YYYYMMDDTHHmmss')
			else if(reminder != null && reminder.type == 'DATE-TIME')
				duration = reminder.duration
				date = moment(reminder.date, "YYYYMMDDTHHmmss")
				if !date.isValid()
					return false
				if duration
					if duration.params.related == 'START'
						related = moment(task.start, "YYYYMMDDTHHmmss")
					else
						related = moment(task.due, "YYYYMMDDTHHmmss")
					seg = @secondsToSegments(date.diff(related, 'seconds'))
					duration.params.invert = seg.invert
					duration.token 	= 'week'
					duration.week 	= seg.week
					duration.day 	= seg.day
					duration.hour 	= seg.hour
					duration.minute = seg.minute
					duration.second = seg.second
				else
					if task.start
						related = moment(task.start, "YYYYMMDDTHHmmss")
						rel = 'START'
						d = 0
					else if task.due
						related = moment(task.due, "YYYYMMDDTHHmmss")
						rel = 'END'
						d = 1
					else
						return true
					seg = @secondsToSegments(date.diff(related, 'seconds'))
					reminder.duration = {
						token: 'week'
						params: {
							related:	rel
							invert:		seg.invert
							id:			+seg.invert+''+d
						}
						week:	seg.week
						day:	seg.day
						hour:	seg.hour
						minute:	seg.minute
						second:	seg.second
					}
			else
				return false
			return true

		secondsToSegments: (s) ->
			if s<0
				s *= -1
				i = true
			else
				i = false
			w = Math.floor(s/604800)
			s -= w*604800
			d = Math.floor(s/86400)
			s -= d*86400
			h = Math.floor(s/3600)
			s -= h*3600
			m = Math.floor(s/60)
			s -= m*60
			return {week:w, day:d, hour:h, minute:m, second:s, invert: i}

		deleteReminderDate: (taskID) ->
			@_$tasksmodel.setReminder(taskID, null)
			@_persistence.setReminder(taskID,false)

		changeCalendarId: (taskID, calendarID) ->
			@_$tasksmodel.changeCalendarId(taskID, calendarID)
			@_persistence.changeCalendarId(taskID, calendarID)

		setTaskNote: (taskID, note) ->
			@_persistence.setTaskNote(taskID, note)

		setTaskName: (taskID, name) ->
			@_persistence.setTaskName(taskID, name)

		changeList: (listID, taskID) ->
			switch listID
				when 'starred'
					@starTask(taskID)
				when 'completed'
					@completeTask(taskID)
				when 'uncompleted'
					@uncompleteTask(taskID)
				when 'today'
					@setDue(taskID,moment().startOf('day').add('h',12),'all')
				when 'week', 'all'
				else
					@changeCalendarId(taskID,listID)

		updateModel: () ->
			@_$tasksmodel.voidAll()
			success = () =>
				@_$tasksmodel.removeVoid()
			@_persistence.getTasks('init', 'all', success, true)

		setShowHidden: (showHidden) ->
			@_persistence.setShowHidden(showHidden)

		addComment: (comment, onSuccess=null, onFailure=null) ->
			onSuccess or= ->
			onFailure or= ->

			@_$tasksmodel.addComment(comment)

			success = (response) =>
				if response.status == 'error'
					onFailure()
				else
					onSuccess(response.data)
			@_persistence.addComment(comment, success)

		deleteComment: (taskID, commentID) ->
			@_$tasksmodel.deleteComment(taskID, commentID)
			@_persistence.deleteComment(taskID, commentID)

		getCompletedTasks: (listID) ->
			@_persistence.getTasks('completed', listID)

	return new TasksBusinessLayer(TasksModel, Persistence)

]