/**
 * Nextcloud - Tasks
 *
 * @copyright Copyright (c) 2021 Jakob Röhrl <jakob.roehrl@web.de>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 *
 * @author Jakob Röhrl <jakob.roehrl@web.de>
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
import store from '../store/store.js'

import Vue from 'vue'

const buildSelector = (selector, propsData = {}) => {
	return new Promise((resolve, reject) => {
		const container = document.createElement('div')
		document.getElementById('body-user').append(container)
		const View = Vue.extend(selector)
		const ComponentVM = new View({
			propsData,
			store,
		}).$mount(container)
		ComponentVM.$root.$on('close', () => {
			ComponentVM.$el.remove()
			ComponentVM.$destroy()
			reject(new Error('Selection canceled'))
		})
		ComponentVM.$root.$on('select', (id) => {
			ComponentVM.$el.remove()
			ComponentVM.$destroy()
			resolve(id)
		})
	})
}

export {
	buildSelector,
}
