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
import PQueue from 'p-queue'

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

		const jCal = ICAL.parse(vcalendar)
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

		this.initTodo()

		this.syncstatus = null

		// Queue for update requests with concurrency 1,
		// because we only want to allow one request at a time
		// (otherwise we will run into problems with changed ETags).
		this.updateQueue = new PQueue({ concurrency: 1 })
	}

	initTodo() {
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

		// Define properties, so Vue reacts to changes of them
		this._uid = this.vtodo.getFirstPropertyValue('uid') || ''
		this._summary = this.vtodo.getFirstPropertyValue('summary') || ''
		this._priority = this.vtodo.getFirstPropertyValue('priority')
		this._complete = this.vtodo.getFirstPropertyValue('percent-complete') || 0
		var comp = this.vtodo.getFirstPropertyValue('completed')
		this._completed = !!comp
		this._completedDate = comp ? comp.toJSDate() : null
		this._status = this.vtodo.getFirstPropertyValue('status')
		this._note = this.vtodo.getFirstPropertyValue('description') || ''
		this._related = this.vtodo.getFirstPropertyValue('related-to') || null
		this._hideSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidesubtasks') || 0
		this._hideCompletedSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0
		this._start = this.vtodo.getFirstPropertyValue('dtstart')
		this._due = this.vtodo.getFirstPropertyValue('due')
		var start = this.vtodo.getFirstPropertyValue('dtstart')
		var due = this.vtodo.getFirstPropertyValue('due')
		var d = due || start
		this._allDay = d !== null && d.isDate
		this._loaded = false
		var categories = this.vtodo.getFirstProperty('categories')
		this._categories = categories ? categories.getValues() : []
		this._modified = this.vtodo.getFirstPropertyValue('last-modified')
		this._created = this.vtodo.getFirstPropertyValue('created')
		this._class = this.vtodo.getFirstPropertyValue('class') || 'PUBLIC'

		this._searchQuery = ''
		this._matchesSearchQuery = true
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
		this.initTodo()
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
		return this._uid
	}

	/**
	 * Set the uid
	 *
	 * @param {string} uid the uid to set
	 * @memberof Task
	 */
	set uid(uid) {
		this.vtodo.updatePropertyWithValue('uid', uid)
		this._uid = this.vtodo.getFirstPropertyValue('uid') || ''
		return true
	}

	/**
	 * Return the first summary
	 *
	 * @readonly
	 * @memberof Task
	 */
	get summary() {
		return this._summary
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
		this._summary = this.vtodo.getFirstPropertyValue('summary') || ''
	}

	get priority() {
		return this._priority
	}

	set priority(priority) {
		// TODO: check that priority is >= 0 and <10
		this.vtodo.updatePropertyWithValue('priority', priority)
		this.updateLastModified()
		this._priority = this.vtodo.getFirstPropertyValue('priority')
	}

	get complete() {
		return this._complete
	}

	set complete(complete) {
		// Make complete a number
		complete = +complete
		this.setComplete(complete)
		if (complete < 100) {
			this.setCompleted(false)
			if (complete === 0) {
				this.setStatus('NEEDS-ACTION')
			} else {
				this.setStatus('IN-PROCESS')
			}
		} else {
			this.setCompleted(true)
			this.setStatus('COMPLETED')
		}
	}

	setComplete(complete) {
		this.vtodo.updatePropertyWithValue('percent-complete', complete)
		this.updateLastModified()
		this._complete = this.vtodo.getFirstPropertyValue('percent-complete') || 0
	}

	get completed() {
		return this._completed
	}

	set completed(completed) {
		this.setCompleted(completed)
		if (completed) {
			this.setComplete(100)
			this.setStatus('COMPLETED')
		} else {
			if (this.complete === 100) {
				this.setComplete(99)
				this.setStatus('IN-PROCESS')
			}
		}
	}

	setCompleted(completed) {
		if (completed) {
			this.vtodo.updatePropertyWithValue('completed', ICAL.Time.now())
		} else {
			this.vtodo.removeProperty('completed')
		}
		this.updateLastModified()
		var comp = this.vtodo.getFirstPropertyValue('completed')
		this._completed = !!comp
		this._completedDate = comp ? comp.toJSDate() : null
	}

	get completedDate() {
		return this._completedDate
	}

	get status() {
		return this._status
	}

	set status(status) {
		this.setStatus(status)
		if (status === 'COMPLETED') {
			this.setComplete(100)
			this.setCompleted(true)
		} else if (status === 'IN-PROCESS') {
			this.setCompleted(false)
			if (this.complete === 100) {
				this.setComplete(99)
			} else if (this.complete === 0) {
				this.setComplete(1)
			}
		} else if (status === 'NEEDS-ACTION') {
			this.setComplete(0)
			this.setCompleted(false)
		}
	}

	setStatus(status) {
		this.vtodo.updatePropertyWithValue('status', status)
		this.updateLastModified()
		this._status = this.vtodo.getFirstPropertyValue('status')
	}

	get note() {
		return this._note
	}

	set note(note) {
		this.vtodo.updatePropertyWithValue('description', note)
		this.updateLastModified()
		this._note = this.vtodo.getFirstPropertyValue('description') || ''
	}

	get related() {
		return this._related
	}

	set related(related) {
		if (related) {
			this.vtodo.updatePropertyWithValue('related-to', related)
		} else {
			this.vtodo.removeProperty('related-to')
		}
		this.updateLastModified()
		this._related = this.vtodo.getFirstPropertyValue('related-to') || null
	}

	get hideSubtasks() {
		return this._hideSubtaks
	}

	set hideSubtasks(hide) {
		this.vtodo.updatePropertyWithValue('x-oc-hidesubtasks', +hide)
		this.updateLastModified()
		this._hideSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidesubtasks') || 0
	}

	get hideCompletedSubtasks() {
		return this._hideCompletedSubtaks
	}

	set hideCompletedSubtasks(hide) {
		this.vtodo.updatePropertyWithValue('x-oc-hidecompletedsubtasks', +hide)
		this.updateLastModified()
		this._hideCompletedSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0
	}

	get start() {
		return this._start
	}

	set start(start) {
		if (start) {
			this.vtodo.updatePropertyWithValue('dtstart', start)
		} else {
			this.vtodo.removeProperty('dtstart')
		}
		this.updateLastModified()
		this._start = this.vtodo.getFirstPropertyValue('dtstart')
	}

	get due() {
		return this._due
	}

	set due(due) {
		if (due) {
			this.vtodo.updatePropertyWithValue('due', due)
		} else {
			this.vtodo.removeProperty('due')
		}
		this.updateLastModified()
		this._due = this.vtodo.getFirstPropertyValue('due')
	}

	get allDay() {
		return this._allDay
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
		start = this.vtodo.getFirstPropertyValue('dtstart')
		due = this.vtodo.getFirstPropertyValue('due')
		var d = due || start
		this._allDay = d !== null && d.isDate
	}

	get comments() {
		return null
	}

	get loadedCompleted() {
		return this._loaded
	}

	set loadedCompleted(loadedCompleted) {
		this._loaded = loadedCompleted
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
		return this._categories
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
		categories = this.vtodo.getFirstProperty('categories')
		this._categories = categories ? categories.getValues() : []
	}

	updateLastModified() {
		var now = ICAL.Time.now()
		this.vtodo.updatePropertyWithValue('last-modified', now)
		this.vtodo.updatePropertyWithValue('dtstamp', now)
		this._modified = now
	}

	get modified() {
		return this._modified
	}

	get created() {
		return this._created
	}

	set created(createdDate) {
		this.vtodo.updatePropertyWithValue('created', createdDate)
		this.updateLastModified()
		this._created = this.vtodo.getFirstPropertyValue('created')
	}

	get class() {
		return this._class
	}

	set class(classification) {
		if (classification) {
			this.vtodo.updatePropertyWithValue('class', classification)
		} else {
			this.vtodo.removeProperty('class')
		}
		this.updateLastModified()
		this._class = this.vtodo.getFirstPropertyValue('class') || 'PUBLIC'
	}

	/**
	 * Checks if the task matches the search query
	 *
	 * @param {String} searchQuery The search string
	 * @returns {Boolean} If the task matches
	 */
	matches(searchQuery) {
		// If the search query maches the previous search, we don't have to search again.
		if (this._searchQuery === searchQuery) {
			return this._matchesSearchQuery
		}
		// We cache the current search query for faster future comparison.
		this._searchQuery = searchQuery
		// If the search query is empty, the task matches by default.
		if (!searchQuery) {
			this._matchesSearchQuery = true
			return this._matchesSearchQuery
		}
		// We search in these task properties
		var keys = ['summary', 'note', 'categories']
		// Make search case-insensitive.
		searchQuery = searchQuery.toLowerCase()
		for (const key of keys) {
			// For the categories search the array
			if (key === 'categories') {
				for (const category of this[key]) {
					if (category.toLowerCase().indexOf(searchQuery) > -1) {
						this._matchesSearchQuery = true
						return this._matchesSearchQuery
					}
				}
			} else {
				if (this[key].toLowerCase().indexOf(searchQuery) > -1) {
					this._matchesSearchQuery = true
					return this._matchesSearchQuery
				}
			}
		}
		this._matchesSearchQuery = false
		return this._matchesSearchQuery
	}

}
