/**
 * Nextcloud - Inventory
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

import { namespaces as NS } from 'cdav-library'

/**
 * Find all VTODOs in a calendar with requested state and relation
 *
 * @param {Object} calendar the calendar
 * @param {Bool} completed completed state of the VTODOs
 * @param {String} related uid of the parent VTODO
 * @returns {Promise<VTODO[]>}
 */
function findVTODObyState(calendar, completed, related) {
	const query = {
		name: [NS.IETF_CALDAV, 'comp-filter'],
		attributes: [
			['name', 'VCALENDAR']
		],
		children: [{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VTODO']
			],
			children: [{
				name: [NS.IETF_CALDAV, 'prop-filter'],
				attributes: [
					['name', 'completed']
				]
			}]
		}]
	}
	if (!completed) {
		query.children[0].children[0].children = [{
			name: [NS.IETF_CALDAV, 'is-not-defined']
		}]
	}
	if (related) {
		query.children[0].children.push({
			name: [NS.IETF_CALDAV, 'prop-filter'],
			attributes: [
				['name', 'related-to']
			],
			children: [{
				name: [NS.IETF_CALDAV, 'text-match'],
				value: related
			}]
		})
	}
	return calendar.dav.calendarQuery([query])
}

export {
	findVTODObyState
}
