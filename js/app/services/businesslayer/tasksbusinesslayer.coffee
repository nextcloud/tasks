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

		setDueDay: (taskID, day) ->
			due = moment(@_$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss")
			if moment(due).isValid()
				due.year(day.year()).month(day.month()).day(day.day())
			else
				due = day.add('h',12)

			@_$tasksmodel.setDueDate(taskID,due.format('YYYYMMDDTHHmmss'))
			@_persistence.setDueDate(taskID,
				if due.isValid() then due.unix() else false)

		setDueTime: (taskID, time) ->
			due = moment(@_$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss")
			if moment(due).isValid()
				due.hour(time.hour()).minute(time.minute())
			else
				due = time
			@_$tasksmodel.setDueDate(taskID,due.format('YYYYMMDDTHHmmss'))
			@_persistence.setDueDate(taskID,
				if due.isValid() then due.unix() else false)

		deleteDueDate: (taskID) ->
			@_$tasksmodel.setDueDate(taskID, undefined)
			@_persistence.setDueDate(taskID, false)

		setStartDay: (taskID, day) ->
			start = moment(@_$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss")
			if moment(start).isValid()
				start.year(day.year()).month(day.month()).day(day.day())
			else
				start = day.add('h',12)

			@_$tasksmodel.setStartDate(taskID,start.format('YYYYMMDDTHHmmss'))
			@_persistence.setStartDate(taskID,
				if start.isValid() then start.unix() else false)

		setStartTime: (taskID, time) ->
			start = moment(@_$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss")
			if moment(start).isValid()
				start.hour(time.hour()).minute(time.minute())
			else
				start = time
			@_$tasksmodel.setStartDate(taskID,start.format('YYYYMMDDTHHmmss'))
			@_persistence.setStartDate(taskID,
				if start.isValid() then start.unix() else false)

		deleteStartDate: (taskID) ->
			@_$tasksmodel.setStartDate(taskID, undefined)
			@_persistence.setStartDate(taskID, false)


		setStartDate: (taskID, start) ->
			@_$tasksmodel.setStartDate(taskID,start)
			date = moment(start, "YYYYMMDDTHHmmss")
			@_persistence.setStartDate(taskID,
				if date.isValid() then date.unix() else false)

		setReminderDate: (taskID, reminder) ->
			@_$tasksmodel.setReminderDate(taskID,reminder)

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