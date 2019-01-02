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
	 * @memberof Task
	 */
	constructor(vcalendar, calendar) {
		if (typeof vcalendar !== 'string' || vcalendar.length === 0) {
			throw new Error('Invalid vCalendar')
		}

		let jCal = ICAL.parse(vcalendar)
		if (jCal[0] !== 'vcalendar') {
			throw new Error('Only one task is allowed in the vCalendar data')
		}

		this.jCal = jCal
		this.calendar = calendar
		this.vCalendar = new ICAL.Component(this.jCal)

		this.subTasks = {}

		// used to state a task is not up to date with
		// the server and cannot be pushed (etag)
		this.conflict = false

		// if no uid set, create one
		this.vtodo = this.vCalendar.getFirstSubcomponent('vtodo')

		if (!this.vtodo) {
			this.vtodo = new ICAL.Component('vtodo')
			this.vCalendar.addSubcomponent(this.vtodo)
		}

		if (!this.vtodo.hasProperty('uid')) {
			console.debug('This task did not have a proper uid. Setting a new one for ', this)
			this.vtodo.addPropertyWithValue('uid', uuid())
		}
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
	 * Return the key
	 *
	 * @readonly
	 * @memberof Task
	 */
	get key() {
		return this.uid + '~' + this.calendar.id
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
	 * Return the uri
	 *
	 * @readonly
	 * @memberof Task
	 */
	get uri() {
		if (this.dav) {
			return this.dav.url.substr(this.dav.url.lastIndexOf('/') + 1)
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
		return this.vtodo.getFirstPropertyValue('uid') || ''
	}

	/**
	 * Set the uid
	 *
	 * @param {string} uid the uid to set
	 * @memberof Task
	 */
	set uid(uid) {
		this.vCalendar.updatePropertyWithValue('uid', uid)
		return true
	}

	/**
	 * Return the first summary
	 *
	 * @readonly
	 * @memberof Task
	 */
	get summary() {
		return this.vtodo.getFirstPropertyValue('summary') || ''
	}

	/**
	 * Set the summary
	 *
	 * @param {string} summary the summary
	 * @memberof Task
	 */
	set summary(summary) {
		this.vtodo.updatePropertyWithValue('summary', summary)
		this.updateLastModified()
	}

	get priority() {
		return this.vtodo.getFirstPropertyValue('priority')
	}

	set priority(priority) {
		// TODO: check that priority is >= 0 and <10
		this.vtodo.updatePropertyWithValue('priority', priority)
		this.updateLastModified()
	}

	get complete() {
		return this.vtodo.getFirstPropertyValue('percent-complete') || 0
	}

	set complete(complete) {
		this.vtodo.updatePropertyWithValue('percent-complete', complete)
		this.updateLastModified()
		if (complete < 100) {
			this.completed = null
			if (complete === 0) {
				this.status = 'NEEDS-ACTION'
			} else {
				this.status = 'IN-PROCESS'
			}
		} else {
			this.completed = ICAL.Time.now()
			this.status = 'COMPLETED'
		}
	}

	get completed() {
		var comp = this.vtodo.getFirstPropertyValue('completed')
		if (comp) {
			return true
		} else {
			return false
		}
	}

	set completed(completed) {
		if (completed) {
			this.vtodo.updatePropertyWithValue('completed', completed)
		} else {
			this.vtodo.removeProperty('completed')
		}
		this.updateLastModified()
	}

	get completedDate() {
		var comp = this.vtodo.getFirstPropertyValue('completed')
		if (comp) {
			return comp.toJSDate()
		} else {
			return null
		}
	}

	get status() {
		return this.vtodo.getFirstPropertyValue('status')
	}

	set status(status) {
		this.vtodo.updatePropertyWithValue('status', status)
		this.updateLastModified()
	}

	get note() {
		return this.vtodo.getFirstPropertyValue('description') || ''
	}

	set note(note) {
		this.vtodo.updatePropertyWithValue('description', note)
		this.updateLastModified()
	}

	get related() {
		return this.vtodo.getFirstPropertyValue('related-to') || null
	}

	set related(related) {
		if (related) {
			this.vtodo.updatePropertyWithValue('related-to', related)
		} else {
			this.vtodo.removeProperty('related-to')
		}
		this.updateLastModified()
	}

	get hideSubtasks() {
		return +this.vtodo.getFirstPropertyValue('x-oc-hidesubtasks') || 0
	}

	set hideSubtasks(hide) {
		this.vtodo.updatePropertyWithValue('x-oc-hidesubtasks', +hide)
		this.updateLastModified()
	}

	get hideCompletedSubtasks() {
		return +this.vtodo.getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0
	}

	set hideCompletedSubtasks(hide) {
		this.vtodo.updatePropertyWithValue('x-oc-hidecompletedsubtasks', +hide)
		this.updateLastModified()
	}

	get start() {
		return this.vtodo.getFirstPropertyValue('dtstart')
	}

	set start(start) {
		if (start) {
			this.vtodo.updatePropertyWithValue('dtstart', start)
		} else {
			this.vtodo.removeProperty('dtstart')
		}
		this.updateLastModified()
	}

	get due() {
		return this.vtodo.getFirstPropertyValue('due')
	}

	set due(due) {
		if (due) {
			this.vtodo.updatePropertyWithValue('due', due)
		} else {
			this.vtodo.removeProperty('due')
		}
		this.updateLastModified()
	}

	get allDay() {
		var start = this.vtodo.getFirstPropertyValue('dtstart')
		var due = this.vtodo.getFirstPropertyValue('due')
		var d = due || start
		return d !== null && d.isDate
	}

	set allDay(allDay) {
		var start = this.vtodo.getFirstPropertyValue('dtstart')
		if (start) {
			start.isDate = allDay
			this.vtodo.updatePropertyWithValue('dtstart', start)
		}
		var due = this.vtodo.getFirstPropertyValue('due')
		if (due) {
			due.isDate = allDay
			this.vtodo.updatePropertyWithValue('due', due)
		}
		this.updateLastModified()
	}

	get comments() {
		return null
	}

	get loadedCompleted() {
		return this.loaded
	}

	set loadedCompleted(loadedCompleted) {
		this.loaded = loadedCompleted
	}

	get reminder() {
		return null
	}

	/**
	 * Return the categories
	 *
	 * @readonly
	 * @memberof Task
	 */
	get categories() {
		var categories = this.vtodo.getFirstProperty('categories')
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
		var categories = this.vtodo.getFirstProperty('categories')
		if (newCategories.length > 0) {
			if (categories) {
				categories.setValues(newCategories)
			} else {
				var prop = new ICAL.Property('categories')
				prop.setValues(newCategories)
				categories = this.vtodo.addProperty(prop)
			}
		} else {
			this.vtodo.removeProperty('categories')
		}
		this.updateLastModified()
	}

	updateLastModified() {
		this.vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now())
		this.vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now())
	}

}
