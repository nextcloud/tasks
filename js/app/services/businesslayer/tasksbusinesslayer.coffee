###

ownCloud - News

@author Bernhard Posselt
@copyright 2012 Bernhard Posselt dev@bernhard-posselt.com

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

		starTask: (taskID) ->
			@_$tasksmodel.star(taskID)
			@_persistence.starTask(taskID)

		unstarTask: (taskID) ->
			@_$tasksmodel.unstar(taskID)
			@_persistence.unstarTask(taskID)

		completeTask: (taskID) ->
			@_$tasksmodel.complete(taskID)
			@_persistence.completeTask(taskID)

		uncompleteTask: (taskID) ->
			@_$tasksmodel.uncomplete(taskID)
			@_persistence.uncompleteTask(taskID)

		deleteTask: (taskID) ->
			@_$tasksmodel.removeById(taskID)
			@_persistence.deleteTask(taskID)

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
			else
				return
			@_$tasksmodel.setDueDate(taskID,due.format('YYYYMMDDTHHmmss'))
			@_persistence.setDueDate(taskID,
				if due.isValid() then due.unix() else false)

		deleteDueDate: (taskID) ->
			@_$tasksmodel.setDueDate(taskID, null)
			@_persistence.setDueDate(taskID, false)

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
			@_persistence.setStartDate(taskID,
				if start.isValid() then start.unix() else false)

		deleteStartDate: (taskID) ->
			@_$tasksmodel.setStartDate(taskID, null)
			@_persistence.setStartDate(taskID, false)

		setReminder: (taskID, date, type='day') ->
			reminder = @_$tasksmodel.getById(taskID).reminder
			newreminder = {
				type:		'DATE-TIME',
				action:		'DISPLAY',
				duration:	null,
				trigger: 	null
			}
			if type == 'day'
				if !(angular.isUndefined(reminder) || reminder == null)
					reminderdate = moment(reminder.date, "YYYYMMDDTHHmmss")
					newreminder.action = reminder.action
					if (reminderdate.isValid() && reminder.type == 'DATE-TIME')
						reminderdate.year(date.year()).month(date.month()).date(date.date())
					else
						reminderdate = date.add('h',12)
				else
					reminderdate = date.add('h',12)
			else if type == 'time'
				if !(angular.isUndefined(reminder) || reminder == null)
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
			@_$tasksmodel.setReminderDate(taskID,newreminder)
			@_persistence.setReminder(taskID,newreminder)

		deleteReminderDate: (taskID) ->
			@_$tasksmodel.setReminderDate(taskID, null)
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
					@setDueDate(taskID,moment().format("YYYYMMDDTHHmmss"))
				when 'week', 'all'
				else
					@changeCalendarId(taskID,listID)

		updateModel: () ->
			@_$tasksmodel.voidAll()
			success = () =>
				@_$tasksmodel.removeVoid()
			@_persistence.getTasks(success, true)


	return new TasksBusinessLayer(TasksModel, Persistence)

]