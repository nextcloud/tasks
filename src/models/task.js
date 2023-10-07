/**
 * Nextcloud - Tasks
 *
 * @author John Molakvoæ
 *
 * @copyright 2018 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import moment from '@nextcloud/moment'

import { v4 as uuid } from 'uuid'
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

		this.syncStatus = null

		// Time in seconds before the task is going to be deleted
		this.deleteCountdown = null

		// Flags if an update is currently running or scheduled,
		// because we only want to allow one update at a time
		// (otherwise we will run into problems with changed ETags).
		this.updateRunning = false
		this.updateScheduled = false
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
		this._priority = this.vtodo.getFirstPropertyValue('priority') || 0
		this._complete = this.vtodo.getFirstPropertyValue('percent-complete') || 0
		const comp = this.vtodo.getFirstPropertyValue('completed')
		this._completed = !!comp
		this._completedDate = comp ? comp.toJSDate() : null
		this._completedDateMoment = moment(this._completedDate, 'YYYYMMDDTHHmmssZ')
		this._recurrence = this.vtodo.getFirstPropertyValue('rrule')
		this._status = this.vtodo.getFirstPropertyValue('status')
		this._note = this.vtodo.getFirstPropertyValue('description') || ''
		this._related = this.getParent()?.getFirstValue() || null
		this._hideSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidesubtasks') || 0
		this._hideCompletedSubtaks = +this.vtodo.getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0
		this._start = this.vtodo.getFirstPropertyValue('dtstart')
		this._startMoment = moment(this._start, 'YYYYMMDDTHHmmssZ')
		this._due = this.vtodo.getFirstPropertyValue('due')
		this._dueMoment = moment(this._due, 'YYYYMMDDTHHmmssZ')
		const start = this.vtodo.getFirstPropertyValue('dtstart')
		const due = this.vtodo.getFirstPropertyValue('due')
		const d = due || start
		this._allDay = d !== null && d.isDate
		this._loaded = false
		this._tags = this.getTags()
		this._modified = this.vtodo.getFirstPropertyValue('last-modified')
		this._modifiedMoment = moment(this._modified, 'YYYYMMDDTHHmmssZ')
		this._created = this.vtodo.getFirstPropertyValue('created')
		this._createdMoment = moment(this._created, 'YYYYMMDDTHHmmssZ')
		this._class = this.vtodo.getFirstPropertyValue('class') || 'PUBLIC'
		this._pinned = this.vtodo.getFirstPropertyValue('x-pinned') === 'true'
		this._location = this.vtodo.getFirstPropertyValue('location') || ''
		this._customUrl = this.vtodo.getFirstPropertyValue('url') || ''

		let sortOrder = this.vtodo.getFirstPropertyValue('x-apple-sort-order')
		if (sortOrder === null) {
			sortOrder = this.getSortOrder()
		}
		this._sortOrder = +sortOrder
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
	 * @param {object} calendar the calendar
	 * @memberof Task
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
	 * @return {string}
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
			return this.dav.url.slice(this.dav.url.lastIndexOf('/') + 1)
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
		return Number(this._priority)
	}

	set priority(priority) {
		// TODO: check that priority is >= 0 and <10
		if (priority === null || priority === 0) {
			this.vtodo.removeProperty('priority')
		} else {
			this.vtodo.updatePropertyWithValue('priority', priority)
		}
		this.updateLastModified()
		this._priority = this.vtodo.getFirstPropertyValue('priority') || 0
	}

	get closed() {
		return this.completed || this._status === 'CANCELLED'
	}

	get complete() {
		return Number(this._complete)
	}

	set complete(complete) {
		this.setComplete(complete)
		// Make complete a number
		complete = +complete
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
		if (complete === null || complete === 0) {
			this.vtodo.removeProperty('percent-complete')
		} else {
			this.vtodo.updatePropertyWithValue('percent-complete', complete)
		}
		this.updateLastModified()
		this._complete = this.vtodo.getFirstPropertyValue('percent-complete') || 0
	}

	get completed() {
		return this._completed || this._status === 'COMPLETED'
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
		const now = ICAL.Time.fromJSDate(new Date(), true)
		if (completed) {
			this.vtodo.updatePropertyWithValue('completed', now)
		} else {
			this.vtodo.removeProperty('completed')
		}
		this.updateLastModified()
		this._completed = completed
		this._completedDate = completed ? now.toJSDate() : null
		this._completedDateMoment = moment(this._completedDate, 'YYYYMMDDTHHmmssZ')
	}

	get completedDate() {
		return this._completedDate
	}

	get completedDateMoment() {
		return this._completedDateMoment.clone()
	}

	/**
	 * Return the recurrence
	 *
	 * @readonly
	 * @memberof Task
	 */
	get recurrence() {
		return this._recurrence
	}

	/**
	 * Whether this task repeats
	 *
	 * @readonly
	 * @memberof Task
	 */
	get recurring() {
		if (this._start === null || this._recurrence === null) {
			return false
		}
		const iter = this._recurrence.iterator(this.start)
		iter.next()
		return iter.next() !== null
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
		} else if (status === 'NEEDS-ACTION' || status === null) {
			this.setCompleted(false)
			if (this.complete === 100) {
				this.setComplete(99)
			}
		}
	}

	setStatus(status) {
		if (status === null) {
			this.vtodo.removeProperty('status')
		} else {
			this.vtodo.updatePropertyWithValue('status', status)
		}
		this.updateLastModified()
		this._status = this.vtodo.getFirstPropertyValue('status')
	}

	get location() {
		return this._location
	}

	set location(location) {
		if (location === null) {
			this.vtodo.removeProperty('location')
		} else {
			this.vtodo.updatePropertyWithValue('location', location)
		}
		this.updateLastModified()
		this._location = this.vtodo.getFirstPropertyValue('location') || ''
	}

	get customUrl() {
		return this._customUrl
	}

	set customUrl(url) {
		if (url === null) {
			this.vtodo.removeProperty('url')
		} else {
			this.vtodo.updatePropertyWithValue('url', url)
		}
		this.updateLastModified()
		this._customUrl = this.vtodo.getFirstPropertyValue('url') || ''
	}

	get note() {
		return this._note
	}

	set note(note) {
		// Delete custom description property
		this.vtodo.removeProperty('x-alt-desc')
		// To avoid inconsistent property parameters (bug #3863 in nextcloud/calendar), delete the property, then recreate
		this.vtodo.removeProperty('description')
		this.vtodo.addPropertyWithValue('description', note)
		this.updateLastModified()
		this._note = this.vtodo.getFirstPropertyValue('description') || ''
	}

	get related() {
		return this._related
	}

	set related(related) {
		const parent = this.getParent()
		// If a parent already exists, update or remove it
		if (parent) {
			if (related) {
				parent.setValue(related)
			} else {
				this.vtodo.removeProperty(parent)
			}
		// Otherwise create a new property, so we don't overwrite RELTYPE=CHILD/SIBLING entries.
		} else {
			if (related) {
				this.vtodo.addPropertyWithValue('related-to', related)
			}
		}
		this.updateLastModified()
		this._related = this.getParent()?.getFirstValue() || null
	}

	getParent() {
		const related = this.vtodo.getAllProperties('related-to')
		// Return only the first parent for now
		return related.find(related => {
			return related.getFirstParameter('reltype') === 'PARENT' || related.getFirstParameter('reltype') === undefined
		})
	}

	get pinned() {
		return this._pinned
	}

	set pinned(pinned) {
		if (pinned === true) {
			this.vtodo.updatePropertyWithValue('x-pinned', 'true')
		} else {
			this.vtodo.removeProperty('x-pinned')
		}
		this.updateLastModified()
		this._pinned = this.vtodo.getFirstPropertyValue('x-pinned') === 'true'
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
		this.setStart(start)
	}

	setStart(start) {
		if (start) {
			this.vtodo.updatePropertyWithValue('dtstart', start)
		} else {
			this.vtodo.removeProperty('dtstart')
		}
		this.updateLastModified()
		this._start = this.vtodo.getFirstPropertyValue('dtstart')
		this._startMoment = moment(this._start, 'YYYYMMDDTHHmmssZ')
		// Check all day setting
		const d = this._due || this._start
		this._allDay = d !== null && d.isDate
	}

	get startMoment() {
		return this._startMoment.clone()
	}

	get due() {
		return this._due
	}

	set due(due) {
		this.setDue(due)
	}

	setDue(due) {
		if (due) {
			this.vtodo.updatePropertyWithValue('due', due)
		} else {
			this.vtodo.removeProperty('due')
		}
		this.updateLastModified()
		this._due = this.vtodo.getFirstPropertyValue('due')
		this._dueMoment = moment(this._due, 'YYYYMMDDTHHmmssZ')
		// Check all day setting
		const d = this._due || this._start
		this._allDay = d !== null && d.isDate
	}

	get dueMoment() {
		return this._dueMoment.clone()
	}

	get allDay() {
		return this._allDay
	}

	set allDay(allDay) {
		const start = this.vtodo.getFirstPropertyValue('dtstart')
		if (start) {
			start.isDate = allDay
			if (!allDay) {
				// If we converted to datetime, we set the hour to zero in the current timezone.
				const startJs = start.toJSDate()
				startJs.setHours(0)
				this.setStart(ICAL.Time.fromJSDate(startJs, true))
			} else {
				this.setStart(ICAL.Time.fromDateString(this._startMoment.format('YYYY-MM-DD')))
			}
		}
		const due = this.vtodo.getFirstPropertyValue('due')
		if (due) {
			due.isDate = allDay
			if (!allDay) {
				// If we converted to datetime, we set the hour to zero in the current timezone.
				const dueJs = due.toJSDate()
				dueJs.setHours(0)
				this.setDue(ICAL.Time.fromJSDate(dueJs, true))
			} else {
				this.setDue(ICAL.Time.fromDateString(this._dueMoment.format('YYYY-MM-DD')))
			}
		}
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
	 * Return the tags
	 *
	 * @readonly
	 * @memberof Task
	 */
	get tags() {
		return this._tags
	}

	getTags() {
		let tags = []
		for (const t of this.vtodo.getAllProperties('categories')) {
			if (t) {
				tags = tags.concat(t.getValues().filter(t => t))
			}
		}
		return tags
	}

	/**
	 * Set the tags
	 *
	 * @param {string} newTags The tags
	 * @memberof Task
	 */
	set tags(newTags) {
		if (newTags.length > 0) {
			let tags = this.vtodo.getAllProperties('categories')
			// If there are no tags set yet, just set them
			if (tags.length < 1) {
				const prop = new ICAL.Property('categories')
				prop.setValues(newTags)
				tags = this.vtodo.addProperty(prop)
			// If there is only one tags property, overwrite it
			} else if (tags.length < 2) {
				tags[0].setValues(newTags)
			// If there are multiple tags properties, we have to iterate over all
			// and remove unwanted tags and add new ones
			} else {
				const toRemove = this._tags.filter(c => !newTags.includes(c))
				const toAdd = newTags.filter(c => !this._tags.includes(c))
				// Remove all unwanted tags
				for (const ts of tags) {
					const t = ts.getValues().filter(c => !toRemove.includes(c))
					if (t.length) {
						ts.setValues(t)
					} else {
						this.vtodo.removeProperty(ts)
					}
				}
				// Add new tags
				tags[0].setValues(tags[0].getValues().concat(toAdd))
			}
		} else {
			this.vtodo.removeAllProperties('categories')
		}
		this.updateLastModified()
		this._tags = this.getTags()
	}

	updateLastModified() {
		const now = ICAL.Time.fromJSDate(new Date(), true)
		this.vtodo.updatePropertyWithValue('last-modified', now)
		this.vtodo.updatePropertyWithValue('dtstamp', now)
		this._modified = now
		this._modifiedMoment = moment(this._modified, 'YYYYMMDDTHHmmssZ')
	}

	get modified() {
		return this._modified
	}

	get modifiedMoment() {
		return this._modifiedMoment.clone()
	}

	get created() {
		return this._created
	}

	get createdMoment() {
		return this._createdMoment.clone()
	}

	set created(createdDate) {
		this.vtodo.updatePropertyWithValue('created', createdDate)
		this.updateLastModified()
		this._created = this.vtodo.getFirstPropertyValue('created')
		this._createdMoment = moment(this._created, 'YYYYMMDDTHHmmssZ')
		// Update the sortorder if necessary
		if (this.vtodo.getFirstPropertyValue('x-apple-sort-order') === null) {
			this._sortOrder = this.getSortOrder()
		}
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

	get sortOrder() {
		return this._sortOrder
	}

	set sortOrder(sortOrder) {
		// We expect a number for the sort order.
		sortOrder = parseInt(sortOrder)
		if (isNaN(sortOrder)) {
			this.vtodo.removeProperty('x-apple-sort-order')
			// Get the default sort order.
			sortOrder = this.getSortOrder()
		} else {
			this.vtodo.updatePropertyWithValue('x-apple-sort-order', sortOrder)
		}
		this.updateLastModified()
		this._sortOrder = sortOrder
	}

	/**
	 * Construct the default value for the sort order
	 * from the created date.
	 *
	 * @return {number} The sort order
	 */
	getSortOrder() {
		// If there is no created date we return 0.
		if (this._created === null) {
			return 0
		}
		return this._created.subtractDate(
			new ICAL.Time({
				year: 2001,
				month: 1,
				day: 1,
				hour: 0,
				minute: 0,
				second: 0,
				isDate: false,
			}),
		).toSeconds()
	}

	/**
	 * For completing a recurring task, tries to set the task start date to the next recurrence date.
	 *
	 * Does nothing if we are at the end of the recurrence (RRULE:UNTIL was reached).
	 */
	completeRecurring() {
		// Get recurrence iterator, starting at start date
		const iter = this.recurrence.iterator(this.start)
		// Skip the start date itself
		iter.next()
		// If there is a next recurrence, update the start date to next recurrence date
		const nextRecurrence = iter.next()
		if (nextRecurrence !== null) {
			this.start = nextRecurrence
			// If the due date now lies before start date, clear it
			if (this.due !== null && this.due.compare(this.start) < 0) {
				this.due = null
			}
		}
	}

	/**
	 * Checks if the task matches the search query
	 *
	 * @param {string} searchQuery The search string
	 * @param {object} filter Object containing the filter parameters
	 * @return {boolean} If the task matches
	 */
	matches(searchQuery, filter) {
		// Check whether the filter matches
		// Needs to match all tags
		for (const tag of (filter?.tags || {})) {
			if (!this.tags.includes(tag)) {
				return false
			}
		}

		// If the search query is empty, the task matches by default.
		if (!searchQuery) {
			return true
		}
		// We search in these task properties
		const keys = ['summary', 'note', 'tags']
		// Make search case-insensitive.
		searchQuery = searchQuery.toLowerCase()
		for (const key of keys) {
			// For the tags search the array
			if (key === 'tags') {
				for (const tag of this[key]) {
					if (tag.toLowerCase().includes(searchQuery)) {
						return true
					}
				}
			} else {
				if (this[key].toLowerCase().includes(searchQuery)) {
					return true
				}
			}
		}
		return false
	}

}
