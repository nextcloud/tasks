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

export default class TaskStatus {

	/**
	 * Creates an instance of a status
	 *
	 * @param {String} type The type of the status
	 * @param {String} message The type of the status
	 * @param {String} action The type of the status
	 * @memberof Status
	 */
	constructor(type, message, action = null) {

		this.duration = -1
		this.type = type

		switch (type) {
		case 'refresh':
			this.cssClass = 'refresh'
			break
		case 'sync':
			this.cssClass = 'icon-loading-small-dark'
			break
		case 'success':
			this.cssClass = 'success'
			this.duration = 5000 // timeout in ms
			break
		}

		this.action = action
		this.message = message
	}

}
