/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * @author John Molakvoæ
 * @copyright 2018 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author Georg Ehrke
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Thomas Citharel <tcit@tcit.fr>
 * @copyright 2018 Thomas Citharel <tcit@tcit.fr>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict'

import Vue from 'vue'
import ICAL from 'ical.js'
import parseIcs from '../services/parseIcs'
import client from '../services/cdav'
import Task from '../models/task'
import pLimit from 'p-limit'
import { isParentInList, searchSubTasks } from './storeHelper'
import { findVTODObyState } from './cdav-requests'

const calendarModel = {
	id: '',
	color: '',
	displayName: '',
	enabled: true,
	owner: '',
	shares: [],
	tasks: [],
	url: '',
	readOnly: false,
	dav: false,
	supportsTasks: true,
	loadedCompleted: false,
}

const state = {
	calendars: []
}

/**
 * Maps a dav collection to our calendar object model
 *
 * @param {Object} calendar The calendar object from the cdav library
 * @returns {Object}
 */
export function mapDavCollectionToCalendar(calendar) {
	return {
		// get last part of url
		id: calendar.url.split('/').slice(-2, -1)[0],
		displayName: calendar.displayname,
		color: calendar.color,
		enabled: calendar.enabled !== false,
		owner: calendar.owner,
		readOnly: !calendar.isWriteable(),
		tasks: [],
		url: calendar.url,
		dav: calendar,
		supportsTasks: calendar.components.includes('VTODO'),
		loadedCompleted: false,
	}
}

const getters = {

	/**
	 * Returns the calendars sorted alphabetically
	 *
	 * @param {Object} state The store data
	 * @returns {Array<Calendar>} Array of the calendars sorted alphabetically
	 */
	getSortedCalendars: state => {
		return state.calendars.sort(function(cal1, cal2) {
			var n1 = cal1.displayName.toUpperCase()
			var n2 = cal2.displayName.toUpperCase()
			return (n1 < n2) ? -1 : (n1 > n2) ? 1 : 0
		})
	},

	/**
	 * Returns the calendars sorted alphabetically
	 *
	 * @param {Object} state The store data
	 * @returns {Array<Calendar>} Array of the calendars sorted alphabetically
	 */
	getSortedWritableCalendars: state => {
		return state.calendars.filter(calendar => {
			return !calendar.readOnly
		})
			.sort(function(cal1, cal2) {
				var n1 = cal1.displayName.toUpperCase()
				var n2 = cal2.displayName.toUpperCase()
				return (n1 < n2) ? -1 : (n1 > n2) ? 1 : 0
			})
	},

	/**
	 * Returns the calendar with the given calendarId
	 *
	 * @param {Object} state The store data
	 * @param {String} calendarId The id of the requested calendar
	 * @returns {Calendar} The requested calendar
	 */
	getCalendarById: state => (calendarId) => {
		var calendar = state.calendars.find(search => search.id === calendarId)
		return calendar
	},

	/**
	 * Returns the number of tasks in a calendar
	 *
	 * Tasks have to be
	 *	- a root task
	 *	- uncompleted
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {String} calendarId The id of the requested calendar
	 * @returns {Integer} The number of tasks
	 */
	getCalendarCount: (state, getters, rootState) => (calendarId) => {
		let calendar = getters.getCalendarById(calendarId)
		let tasks = Object.values(calendar.tasks)
			.filter(task => {
				return task.completed === false && (!task.related || !isParentInList(task, calendar.tasks))
			})
		if (rootState.tasks.searchQuery) {
			tasks = tasks.filter(task => {
				if (task.matches(rootState.tasks.searchQuery)) {
					return true
				}
				// We also have to show tasks for which one sub(sub...)task matches.
				return searchSubTasks(task, rootState.tasks.searchQuery)
			})
		}
		return tasks.length
	},

	/**
	 * Returns the count of completed tasks in a calendar
	 *
	 * Tasks have to be
	 *	- a root task
	 *	- completed
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {String} calendarId The id of the calendar in question
	 * @returns {Integer} The count of completed tasks in a calendar
	 */
	getCalendarCountCompleted: (state, getters) => (calendarId) => {
		var calendar = getters.getCalendarById(calendarId)
		return Object.values(calendar.tasks)
			.filter(task => {
				return task.completed === true && (!task.related || !isParentInList(task, calendar.tasks))
			}).length
	},

	/**
	 * Returns if a calendar name is already used by an other calendar
	 *
	 * @param {Object} state The store data
	 * @param {String} name The name to check
	 * @param {String} id The id of the calendar to exclude
	 * @returns {Boolean} If a calendar name is already used
	 */
	isCalendarNameUsed: state => (name, id) => {
		return state.calendars.some(calendar => {
			return (calendar.displayName === name && calendar.id !== id)
		})
	},

	/**
	 * Returns the current calendar
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {Calendar} The calendar by route
	 */
	getCalendarByRoute: (state, getters, rootState) => {
		return getters.getCalendarById(rootState.route.params.calendarId)
	},

	/**
	 * Returns the default calendar
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {Calendar} The default calendar
	 */
	getDefaultCalendar: (state, getters, rootState) => {
		return getters.getCalendarById(rootState.settings.settings.defaultCalendarId) || getters.getSortedCalendars[0]
	}
}

const mutations = {

	/**
	 * Adds a calendar to the state
	 *
	 * @param {Object} state The store data
	 * @param {Calendar} calendar The calendar to add
	 */
	addCalendar(state, calendar) {
		// extend the calendar to the default model
		state.calendars.push(Object.assign({}, calendarModel, calendar))
	},

	/**
	 * Delete calendar
	 *
	 * @param {Object} state The store data
	 * @param {Calendar} calendar The calendar to delete
	 */
	deleteCalendar(state, calendar) {
		state.calendars.splice(state.calendars.indexOf(calendar), 1)
	},

	/**
	 * Toggles whether a calendar is enabled
	 *
	 * @param {Object} context The store mutations
	 * @param {Calendar} calendar The calendar to toggle
	 */
	toggleCalendarEnabled(context, calendar) {
		calendar.enabled = !calendar.enabled
	},

	/**
	 * Changes the name and the color of a calendar
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar to change
	 * @param {String} data.newName The new name of the calendar
	 * @param {String} data.newColor The new color of the calendar
	 */
	renameCalendar(context, { calendar, newName, newColor }) {
		calendar.displayName = newName
		calendar.color = newColor
	},

	/**
	 * Appends a list of tasks to a calendar
	 * and removes duplicates
	 *
	 * @param {Object} state The store data
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar to add the tasks to
	 * @param {Task[]} data.tasks Array of tasks to append
	 */
	appendTasksToCalendar(state, { calendar, tasks }) {
		// Convert list into an array and remove duplicate
		calendar.tasks = tasks.reduce((list, task) => {
			if (list[task.uid]) {
				console.debug('Duplicate task overridden', list[task.uid], task)
			}
			Vue.set(list, task.uid, task)
			return list
		}, calendar.tasks)

	},

	/**
	 * Adds a task to a calendar and overwrites if duplicate uid
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task to add
	 */
	addTaskToCalendar(state, task) {
		Vue.set(task.calendar.tasks, task.uid, task)
	},

	/**
	 * Deletes a task from its calendar
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task to delete
	 */
	deleteTaskFromCalendar(state, task) {
		Vue.delete(task.calendar.tasks, task.uid)
	},

	/**
	 * Shares a calendar with a user or group
	 *
	 * @param {Object} state The store data
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {String} data.sharee The sharee
	 * @param {String} data.id The id
	 * @param {Boolean} data.group The group
	 */
	shareCalendar(state, { calendar, sharee, id, group }) {
		let newSharee = {
			displayname: sharee,
			id,
			writeable: false,
			group
		}
		calendar.shares.push(newSharee)
	},

	/**
	 * Removes a sharee from calendar shares list
	 *
	 * @param {Object} state The store data
	 * @param {Object} sharee The sharee
	 */
	removeSharee(state, sharee) {
		let calendar = state.calendars.find(search => {
			for (let i in search.shares) {
				if (search.shares[i] === sharee) {
					return true
				}
			}
		})
		calendar.shares.splice(calendar.shares.indexOf(sharee), 1)
	},

	/**
	 * Toggles sharee's writable permission
	 *
	 * @param {Object} state The store data
	 * @param {Object} sharee The sharee
	 */
	updateShareeWritable(state, sharee) {
		let calendar = state.calendars.find(search => {
			for (let i in search.shares) {
				if (search.shares[i] === sharee) {
					return true
				}
			}
		})
		sharee = calendar.shares.find(search => search === sharee)
		sharee.writeable = !sharee.writeable
	}
}

const actions = {
	/**
	 * Retrieves and commits calendars
	 *
	 * @param {Object} context The store mutations
	 * @returns {Promise<Array>} The calendars
	 */
	async getCalendars(context) {
		let calendars = await client.calendarHomes[0].findAllCalendars()
			.then(calendars => {
				return calendars.map(calendar => {
					return mapDavCollectionToCalendar(calendar)
				})
			})

		// Remove calendars which don't support tasks
		calendars = calendars.filter(calendar => calendar.supportsTasks)

		calendars.forEach(calendar => {
			context.commit('addCalendar', calendar)
		})

		return calendars
	},

	/**
	 * Appends a new calendar to array of existing calendars
	 *
	 * @param {Object} context The store mutations
	 * @param {Calendar} calendar The calendar to append
	 * @returns {Promise}
	 */
	async appendCalendar(context, calendar) {
		return client.calendarHomes[0].createCalendarCollection(calendar.displayName, calendar.color, ['VTODO'])
			.then((response) => {
				calendar = mapDavCollectionToCalendar(response)
				context.commit('addCalendar', calendar)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Delete calendar
	 * @param {Object} context The store mutations Current context
	 * @param {Calendar} calendar The calendar to delete
	 * @returns {Promise}
	 */
	async deleteCalendar(context, calendar) {
		return calendar.dav.delete()
			.then((response) => {
				// Delete all the tasks from the store that belong to this calendar
				Object.values(calendar.tasks)
					.forEach(task => context.commit('deleteTask', task))
				// Then delete the calendar
				context.commit('deleteCalendar', calendar)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Toggles whether a calendar is enabled
	 * @param {Object} context The store mutations current context
	 * @param {Calendar} calendar The calendar to toggle
	 * @returns {Promise}
	 */
	async toggleCalendarEnabled(context, calendar) {
		calendar.dav.enabled = !calendar.dav.enabled
		return calendar.dav.update()
			.then((response) => context.commit('toggleCalendarEnabled', calendar))
			.catch((error) => { throw error })
	},

	/**
	 * Changes the name and the color of a calendar
	 *
	 * @param {Object} context The store mutations Current context
	 * @param {Calendar} data.calendar The calendar to change
	 * @param {String} data.newName The new name of the calendar
	 * @param {String} data.newColor The new color of the calendar
	 * @returns {Promise}
	 */
	async changeCalendar(context, { calendar, newName, newColor }) {
		calendar.dav.displayname = newName
		calendar.dav.color = newColor
		return calendar.dav.update()
			.then((response) => context.commit('renameCalendar', { calendar, newName, newColor }))
			.catch((error) => { throw error })
	},

	/**
	 * Retrieves the tasks of the specified calendar
	 * and commits the results
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {String} data.completed Are the requested tasks completed
	 * @param {String} data.related The uid of the parent task
	 * @returns {Promise}
	 */
	async getTasksFromCalendar(context, { calendar, completed = false, related = null }) {
		return findVTODObyState(calendar, completed, related)
			.then((response) => {
				// We don't want to lose the url information
				// so we need to parse one by one
				const tasks = response.map(item => {
					let task = new Task(item.data, calendar)
					Vue.set(task, 'dav', item)
					return task
				})

				// Initialize subtasks so we don't have to search for them on every change.
				// We do have to manually adjust this list when a task is added, deleted or moved.
				tasks.forEach(
					parent => {
						var subTasks = tasks.filter(task => {
							return task.related === parent.uid
						})

						// Convert list into an array and remove duplicate
						parent.subTasks = subTasks.reduce((list, task) => {
							if (list[task.uid]) {
								console.debug('Duplicate task overridden', list[task.uid], task)
							}
							Vue.set(list, task.uid, task)
							return list
						}, parent.subTasks)

						// If necessary, add the tasks as subtasks to parent tasks already present in the store.
						if (!related) {
							context.commit('addTaskToParent', parent)
						}
					}
				)

				// If the requested tasks are related to a task, add the tasks as subtasks
				if (related) {
					let parent = Object.values(calendar.tasks).find(search => search.uid === related)
					if (parent) {
						parent.loadedCompleted = true
						tasks.map(task => Vue.set(parent.subTasks, task.uid, task))
					}
				}

				context.commit('appendTasksToCalendar', { calendar, tasks })
				context.commit('appendTasks', tasks)
				return tasks
			})
			.catch((error) => {
				// unrecoverable error, if no tasks were loaded,
				// remove the calendar
				// TODO: create a failed calendar state and show that there was an issue?
				context.commit('deleteCalendar', calendar)
				console.error(error)
			})
	},

	/**
	 * Imports tasks into a calendar from an ics file
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} importDetails = { ics, calendar }
	 */
	async importTasksIntoCalendar(context, { ics, calendar }) {
		const tasks = parseIcs(ics, calendar)
		context.commit('changeStage', 'importing')

		// max simultaneous requests
		const limit = pLimit(3)
		const requests = []

		// create the array of requests to send
		tasks.map(async task => {
			// Get vcard string
			try {
				let vData = ICAL.stringify(task.vCard.jCal)
				// push task to server and use limit
				requests.push(limit(() => task.calendar.dav.createVCard(vData)
					.then((response) => {
						// setting the task dav property
						Vue.set(task, 'dav', response)

						// success, update store
						context.commit('addTask', task)
						context.commit('addTaskToCalendar', task)
						context.commit('incrementAccepted')
					})
					.catch((error) => {
						// error
						context.commit('incrementDenied')
						console.error(error)
					})
				))
			} catch (e) {
				context.commit('incrementDenied')
			}
		})

		Promise.all(requests).then(() => {
			context.commit('changeStage', 'default')
		})
	},

	/**
	 * Removes a sharee from a calendar
	 *
	 * @param {Object} context The store mutations Current context
	 * @param {Object} sharee Calendar sharee object
	 */
	removeSharee(context, sharee) {
		context.commit('removeSharee', sharee)
	},

	/**
	 * Toggles permissions of calendar sharees writeable rights
	 *
	 * @param {Object} context The store mutations Current context
	 * @param {Object} sharee Calendar sharee object
	 */
	toggleShareeWritable(context, sharee) {
		context.commit('updateShareeWritable', sharee)
	},

	/**
	 * Shares a calendar with a user or a group
	 *
	 * @param {Object} context The store mutations Current context
	 * @param {Calendar} data.calendar The calendar
	 * @param {String} data.sharee The sharee
	 * @param {Boolean} data.id The id
	 * @param {Boolean} data.group The group
	 */
	shareCalendar(context, { calendar, sharee, id, group }) {
		// Share a calendar with the entered group or user
		context.commit('shareCalendar', { calendar, sharee, id, group })
	},
}

export default { state, getters, mutations, actions }
