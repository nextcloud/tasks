/**
 * Nextcloud - Tasks
 *
 * @copyright Copyright (c) 2018 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import DavClient from '@nextcloud/cdav-library'
import { generateRemoteUrl } from '@nextcloud/router'

/**
 * Function to create an XML http request with the correct
 * headers
 *
 * @return {object} the XML http request
 */
function xhrProvider() {
	const headers = {
		'X-Requested-With': 'XMLHttpRequest',
		requesttoken: OC.requestToken,
	}
	const xhr = new XMLHttpRequest()
	const oldOpen = xhr.open

	// override open() method to add headers
	xhr.open = function() {
		const result = oldOpen.apply(this, arguments)
		for (const name in headers) {
			xhr.setRequestHeader(name, headers[name])
		}
		return result
	}
	OC.registerXHRForErrorProcessing(xhr)
	return xhr
}

export default new DavClient({
	rootUrl: generateRemoteUrl('dav'),
}, xhrProvider)
