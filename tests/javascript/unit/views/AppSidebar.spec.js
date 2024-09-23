/**
 * Nextcloud - Tasks
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import AppSidebar from '../../../../src/views/AppSidebar.vue'
import router from '../../../../src/router.js'

import { store } from '../setupStore.js'

import { shallowMount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

describe('AppSidebar.vue', () => {
	'use strict'

	// We set the route before mounting AppSidebar to prevent messages that the task was not found
	// Could be adjusted with future tests
	router.push({ name: 'calendarsTask', params: { calendarId: 'calendar-1', taskId: 'pwen4kz18g.ics' } })

	it('Returns the correct value for the new dates', () => {
		const wrapper = shallowMount(AppSidebar, {
			global: {
				plugins: [store, router],
			},
		})

		let actual = wrapper.vm.newStartDate
		let expected = new Date('2019-01-01T12:00:00')
		expect(actual.getTime()).toBe(expected.getTime())

		actual = wrapper.vm.newDueDate
		expected = new Date('2019-01-01T12:34:00')
		expect(actual.getTime()).toBe(expected.getTime())

		const newDueDate = new Date('2019-01-01T15:01:00')
		wrapper.vm.setDueDate({ task: wrapper.vm.task, value: newDueDate })
		actual = wrapper.vm.newDueDate
		expect(actual.getTime()).toBe(newDueDate.getTime())
	})

	it('Task completed date is set correctly', () => {
		const wrapper = shallowMount(AppSidebar, {
			global: {
				plugins: [store, router],
			},
		})

		let actual = wrapper.vm.newCompletedDate
		expect(actual).toBe(null)

		const newCompletedDate = new Date('2019-01-01T12:00:00')
		wrapper.vm.changeCompletedDate({ task: wrapper.vm.task, value: newCompletedDate })
		
		actual = wrapper.vm.newCompletedDate
		expect(actual.getTime()).toBe(newCompletedDate.getTime())
	})

	it('Setting completed date to future is ignored', () => {
		const wrapper = shallowMount(AppSidebar, {
			global: {
				plugins: [store, router],
			},
		})

		let actual = wrapper.vm.newCompletedDate
		const expected = new Date('2019-01-01T12:00:00')
		expect(actual.getTime()).toBe(expected.getTime())

		const newCompletedDate = new Date('2020-01-01T12:00:01')
		wrapper.vm.changeCompletedDate({ task: wrapper.vm.task, value: newCompletedDate })

		actual = wrapper.vm.newCompletedDate
		expect(actual.getTime()).toBe(expected.getTime())
	})
})
