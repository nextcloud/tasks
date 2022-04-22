/**
 * Nextcloud - Tasks
 *
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import {
	COMPONENT_NAME_EVENT,
	COMPONENT_NAME_JOURNAL,
	COMPONENT_NAME_VTODO,
} from './consts.js'

import { getParserManager } from '@nextcloud/calendar-js'

/**
 * Creates a complete calendar-object-object based on given props
 *
 * @param {object} props Calendar-object-props already provided
 * @return {object}
 */
const getDefaultCalendarObjectObject = (props = {}) => Object.assign({}, {
	// Id of this calendar-object
	id: null,
	// Id of the associated calendar
	calendarId: null,
	// The cdav-library object storing the calendar-object
	dav: null,
	// The parsed calendar-js object
	calendarComponent: null,
	// The uid of the calendar-object
	uid: null,
	// The uri of the calendar-object
	uri: null,
	// The type of calendar-object
	objectType: null,
	// Whether or not the calendar-object is an event
	isEvent: false,
	// Whether or not the calendar-object is a journal
	isJournal: false,
	// Whether or not the calendar-object is a task
	isTodo: false,
	// Whether or not the calendar-object exists on the server
	existsOnServer: false,
}, props)

/**
 * Maps a calendar-object from c-dav to our calendar-object object
 *
 * @param {object} dav The c-dav VObject
 * @param {string} calendarId The calendar-id this object is associated with
 * @return {object}
 */
const mapCDavObjectToCalendarObject = (dav, calendarId) => {
	const parserManager = getParserManager()
	const parser = parserManager.getParserForFileType('text/calendar')

	// This should not be the case, but let's just be on the safe side
	if (typeof dav.data !== 'string' || dav.data.trim() === '') {
		throw new Error('Empty calendar object')
	}

	parser.parse(dav.data)
	const calendarComponentIterator = parser.getItemIterator()
	const calendarComponent = calendarComponentIterator.next().value
	if (!calendarComponent) {
		throw new Error('Empty calendar object')
	}

	const vObjectIterator = calendarComponent.getVObjectIterator()
	const firstVObject = vObjectIterator.next().value

	// Find the parent id if any
	let parent = null
	for (const rel of firstVObject.getRelationIterator()) {
		if (rel.relationType === 'PARENT') {
			parent = rel.relatedId
			break
		}
	}

	return getDefaultCalendarObjectObject({
		id: btoa(dav.url),
		calendarId,
		dav,
		calendarComponent,
		uid: firstVObject.uid,
		parent,
		uri: dav.url,
		objectType: firstVObject.name,
		isEvent: firstVObject.name === COMPONENT_NAME_EVENT,
		isJournal: firstVObject.name === COMPONENT_NAME_JOURNAL,
		isTodo: firstVObject.name === COMPONENT_NAME_VTODO,
		existsOnServer: true,
	})
}

export {
	getDefaultCalendarObjectObject,
	mapCDavObjectToCalendarObject,
}
