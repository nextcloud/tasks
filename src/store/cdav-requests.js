/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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
'use strict'

import { namespaces as NS } from '@nextcloud/cdav-library'

/**
 * Finds all VTODOs in a calendar with requested state and relation
 *
 * @param {object} calendar The calendar
 * @param {boolean} completed Completed state of the VTODOs
 * @param {string} related uid of the parent VTODO
 * @return {Promise}
 */
function findVTODObyState(calendar, completed, related) {
	const query = {
		name: [NS.IETF_CALDAV, 'comp-filter'],
		attributes: [
			['name', 'VCALENDAR'],
		],
		children: [{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VTODO'],
			],
		}],
	}
	if (completed !== null) {
		query.children[0].children = [{
			name: [NS.IETF_CALDAV, 'prop-filter'],
			attributes: [
				['name', 'completed'],
			],
		}]
		if (!completed) {
			query.children[0].children[0].children = [{
				name: [NS.IETF_CALDAV, 'is-not-defined'],
			}]
		}
	}
	if (related) {
		query.children[0].children.push({
			name: [NS.IETF_CALDAV, 'prop-filter'],
			attributes: [
				['name', 'related-to'],
			],
			children: [{
				name: [NS.IETF_CALDAV, 'text-match'],
				value: related,
			}],
		})
	}
	return calendar.dav.calendarQuery([query])
}

/**
 * Finds a VTODO by the uid
 *
 * @param {object} calendar The calendar to search in
 * @param {string} taskUid The UID
 * @return {object} The dav query
 */
function findVTODObyUid(calendar, taskUid) {
	const query = {
		name: [NS.IETF_CALDAV, 'comp-filter'],
		attributes: [
			['name', 'VCALENDAR'],
		],
		children: [{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VTODO'],
			],
		}],
	}
	query.children[0].children = [{
		name: [NS.IETF_CALDAV, 'prop-filter'],
		attributes: [
			['name', 'uid'],
		],
		children: [{
			name: [NS.IETF_CALDAV, 'text-match'],
			value: taskUid,
		}],
	}]
	return calendar.dav.calendarQuery([query])
}

export {
	findVTODObyState,
	findVTODObyUid,
}
