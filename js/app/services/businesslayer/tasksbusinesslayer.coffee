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

		setDueDate: (taskID, due) ->
			@_$tasksmodel.setDueDate(taskID,due)
			date = moment(due, "YYYYMMDDTHHmmss")
			@_persistence.setDueDate(taskID,
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