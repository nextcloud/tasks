/**
 * Nextcloud - Tasks
 *
 * @author John Molakvoæ
 * @copyright 2018 John Molakvoæ <skjnldsv@protonmail.com>
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

import uuid from 'uuid'
import ICAL from 'ical.js'

export default class Task {

	/**
	 * Creates an instance of Task
	 *
	 * @param {string} vcalendar the vcalendar data as string with proper new lines
	 * @param {object} calendar the calendar which the task belongs to
	 * @param {object} raw the raw vcalendar data
	 * @memberof Task
	 */
	constructor(vcalendar, calendar, raw) {
		if (typeof vcalendar !== 'string' || vcalendar.length === 0) {
			throw new Error('Invalid vCalendar')
		}
		this.vcalendar = vcalendar

		let jCal = ICAL.parse(vcalendar)
		if (jCal[0] !== 'vcalendar') {
			throw new Error('Only one task is allowed in the vCalendar data')
		}

		this.jCal = jCal
		this.calendar = calendar
		this.vCalendar = new ICAL.Component(this.jCal)

		// used to state a task is not up to date with
		// the server and cannot be pushed (etag)
		this.conflict = false

		// if no uid set, create one
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		if (!vtodo.hasProperty('uid')) {
			console.debug('This task did not have a proper uid. Setting a new one for ', this)
			vtodo.addPropertyWithValue('uid', uuid())
		}

		this.uri = raw.url.substr(raw.url.lastIndexOf('/') + 1)
	}

	/**
	 * Update internal data of this task
	 *
	 * @param {jCal} jCal jCal object from ICAL.js
	 * @memberof Task
	 */
	updateTask(jCal) {
		this.jCal = jCal
		this.vCalendar = new ICAL.Component(this.jCal)
	}

	/**
	 * Update linked calendar of this task
	 *
	 * @param {Object} calendar the calendar
	 * @memberof Contact
	 */
	updateCalendar(calendar) {
		this.calendar = calendar
	}

	/**
	 * Ensure we're normalizing the possible arrays
	 * into a string by taking the first element
	 * e.g. ORG:ABC\, Inc.; will output an array because of the semi-colon
	 *
	 * @param {Array|string} data the data to normalize
	 * @returns {string}
	 * @memberof Task
	 */
	firstIfArray(data) {
		return Array.isArray(data) ? data[0] : data
	}

	/**
	 * Return the url
	 *
	 * @readonly
	 * @memberof Task
	 */
	get url() {
		if (this.dav) {
			return this.dav.url
		}
		return ''
	}

	/**
	 * Return the uid
	 *
	 * @readonly
	 * @memberof Task
	 */
	get uid() {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		return vtodo.getFirstPropertyValue('uid') || ''
	}

	/**
	 * Set the uid
	 *
	 * @param {string} uid the uid to set
	 * @memberof Task
	 */
	set uid(uid) {
		this.vCalendar.updatePropertyWithValue('uid', uid)
		this.vcalendar = this.vCalendar.toString()
		return true
	}

	/**
	 * Return the first summary
	 *
	 * @readonly
	 * @memberof Task
	 */
	get summary() {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		return vtodo.getFirstPropertyValue('summary')
	}

	/**
	 * Set the summary
	 *
	 * @param {string} summary the summary
	 * @memberof Task
	 */
	set summary(summary) {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		vtodo.updatePropertyWithValue('summary', summary)
		this.updateLastModified()
		this.vcalendar = this.vCalendar.toString()
	}

	/**
	 * Return the categories
	 *
	 * @readonly
	 * @memberof Task
	 */
	get categories() {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		var categories = vtodo.getFirstProperty('categories')
		if (categories) {
			return categories.getValues()
		} else {
			return []
		}
	}

	/**
	 * Set the categories
	 *
	 * @param {string} newCategories the categories
	 * @memberof Task
	 */
	set categories(newCategories) {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		var categories = vtodo.getFirstProperty('categories')
		if (newCategories.length > 0) {
			if (categories) {
				categories.setValues(newCategories)
			} else {
				var prop = new ICAL.Property('categories')
				prop.setValues(newCategories)
				categories = vtodo.addProperty(prop)
			}
		} else {
			vtodo.removeProperty('categories')
		}
		this.updateLastModified()
		this.vcalendar = this.vCalendar.toString()
	}

	updateLastModified() {
		var vtodo = this.vCalendar.getFirstSubcomponent('vtodo')
		vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now())
		vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now())
	}

}
