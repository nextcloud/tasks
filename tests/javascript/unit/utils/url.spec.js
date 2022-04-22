/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { urldecode } from '../../../../src/utils/url.js'

describe('utils/url test suite', () => {
	it('should decode urls encoded by php', () => {
		const testData = [
			['my+group+%2B%26%3F%25', 'my group +&?%'],
			['my%2520+group', 'my%20 group'],
			['group%20with%20spaces', 'group with spaces'],
		]

		for (const [encoded, expected] of testData) {
			const decoded = urldecode(encoded)
			expect(decoded).toEqual(expected)
		}
	})
})
