/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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
import Vuex from 'vuex'
import DummyCalendars from './dummyCalendars'

import { isTaskInList } from './storeHelper'

Vue.use(Vuex)

const state = {
	calendars: DummyCalendars.calendars
}

const getters = {

	/**
	 * Returns the calendars sorted alphabetically
	 */
	getSortedCalendars: state => {
		return Object.values(state.calendars).sort(function(cal1, cal2) {
			var n1 = cal1.displayname.toUpperCase()
			var n2 = cal2.displayname.toUpperCase()
			return (n1 < n2) ? -1 : (n1 > n2) ? 1 : 0
		})
	},

	/**
	 * Returns the count of tasks in a calendar
	 *
	 * Tasks have to be
	 *	- a root task
		*	- uncompleted
		*
		* @param {String} calendarId the Id of the calendar in question
		*/
	getCalendarCount: state => (calendarId) => {
		return Object.values(state.calendars[calendarId].tasks)
			.filter(task => {
				return task.completed === false && !task.related
			}).length
	},

	/**
	 * Returns the count of tasks in a calendar belonging to a collection
	 *
	 * Tasks have to be
	 *	- belong to the collection with collectionId
		*	- a root task
		*	- uncompleted
		*
		* @param {String} calendarId the Id of the calendar in question
		* @param {String} collectionId the Id of the collection in question
		*/
	getCalendarCountByCollectionId: state => (calendarId, collectionId) => {
		var calendar = state.calendars[calendarId]
		var count = calendar.tasks.filter(task => {
			return isTaskInList(task, collectionId) && !task.related
		}).length
		return count
	},

	/**
	 * Returns the count of tasks in a calendar
	 *
	 * Tasks have to be
	 *	- a root task
		*	- completed
		*
		* @param {String} calendarId the Id of the calendar in question
		*/
	getCalendarCountCompleted: state => (calendarId) => {
		return Object.values(state.calendars[calendarId].tasks)
			.filter(task => {
				return task.completed === true && !task.related
			}).length
	},

	/**
	 * Returns if a calendar name is already used by an other calendar
	 *
	 * @param {String} name the name to check
	 * @param {String} uri the uri of the calendar to exclude
	 */
	isCalendarNameUsed: state => (name, uri) => {
		var calendars = Object.values(state.calendars)
		return calendars.some(calendar => {
			return (calendar.displayname === name && calendar.uri !== uri)
		})
	},

	/**
	 * Returns the current calendar
	 */
	getCalendarByRoute: (state, getters, rootState) => {
		return state.calendars[rootState.route.params.calendarId]
	},

	/**
	 * Returns the default calendar
	 *
	 * For now, this is the first calendar in the list.
	 * Calendar order might change randomly.
	 */
	getDefaultCalendar: (state) => {
		return Object.values(state.calendars)[0]
	}
}

const mutations = {}

const actions = {}

export default { state, getters, mutations, actions }
