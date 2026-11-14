/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2026 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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
import DeleteCompletedModal from '../../../../src/components/DeleteCompletedModal.vue'
import calendars from '../../../../src/store/calendars.js'
import collections from '../../../../src/store/collections.js'
import tasks from '../../../../src/store/tasks.js'
import settings from '../../../../src/store/settings.js'
import principals from '../../../../src/store/principals.js'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { reactive } from 'vue'

/**
 * Waits for pending promise callbacks (e.g. dispatched actions) to settle.
 *
 * @return {Promise}
 */
function flushPromises() {
	return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Builds a minimal closed root task, sufficient for the `findClosedRootTasks`
 * getter and the mocked `deleteTask` action used in these tests.
 *
 * @param {string} uid Unique id for the task
 * @return {object}
 */
function makeClosedTask(uid) {
	return {
		uid,
		related: null,
		closed: true,
		subTasks: {},
	}
}

describe('DeleteCompletedModal.vue', () => {
	'use strict'

	let store
	let deleteTaskMock
	let resolvers

	beforeEach(() => {
		resolvers = []
		// Every dispatched deleteTask stays pending until we resolve it explicitly,
		// so the tests can control exactly when each deletion in the batch "finishes".
		// On resolution it mimics the real deleteTaskFromCalendar mutation and removes
		// the task from its calendar, so already-deleted tasks stay deleted.
		deleteTaskMock = vi.fn((context, { task }) => new Promise((resolve) => {
			resolvers.push(() => {
				delete task.calendar.tasks[task.uid]
				resolve()
			})
		}))
		tasks.actions.deleteTask = deleteTaskMock

		store = createStore({
			modules: {
				calendars,
				collections,
				tasks,
				settings,
				principals,
			},
		})
	})

	/**
	 * Mounts the component with `count` completed root tasks in the calendar.
	 *
	 * @param {number} count Number of completed root tasks to seed
	 * @return {object} The mounted wrapper
	 */
	function mountWithTasks(count) {
		const calendarTasks = {}
		for (let i = 0; i < count; i++) {
			calendarTasks[`task-${i}`] = makeClosedTask(`task-${i}`)
		}
		// Reactive, like the real Vuex-backed calendar object, so the component's
		// computed properties pick up the deletions performed by deleteTaskMock.
		const calendar = reactive({
			displayName: 'Test calendar',
			loadedCompleted: true,
			readOnly: false,
			tasks: calendarTasks,
		})
		Object.values(calendar.tasks).forEach((task) => { task.calendar = calendar })

		const wrapper = shallowMount(DeleteCompletedModal, {
			global: {
				plugins: [store],
			},
			props: {
				calendar,
			},
		})
		wrapper.vm.openModal()
		return wrapper
	}

	it('is not deleting before the user starts the bulk deletion', () => {
		const wrapper = mountWithTasks(3)

		expect(wrapper.vm.deleting).toBe(false)
	})

	it('deletes every completed task, one at a time, when not canceled', async () => {
		const wrapper = mountWithTasks(3)

		const runPromise = wrapper.vm.deleteCompletedTasks()

		// The first deletion is dispatched synchronously, the rest wait for it.
		expect(wrapper.vm.deleting).toBe(true)
		expect(deleteTaskMock).toHaveBeenCalledTimes(1)

		resolvers[0]()
		await flushPromises()
		expect(deleteTaskMock).toHaveBeenCalledTimes(2)

		resolvers[1]()
		await flushPromises()
		expect(deleteTaskMock).toHaveBeenCalledTimes(3)

		resolvers[2]()
		await runPromise

		expect(deleteTaskMock).toHaveBeenCalledTimes(3)
		expect(wrapper.vm.deleting).toBe(false)
	})

	it('stops dispatching further deletions once canceled, but lets the in-flight one finish', async () => {
		const wrapper = mountWithTasks(3)

		const runPromise = wrapper.vm.deleteCompletedTasks()
		expect(deleteTaskMock).toHaveBeenCalledTimes(1)

		wrapper.vm.cancelDeletion()
		// The task that was already in flight when cancel was requested still completes...
		resolvers[0]()
		await runPromise

		// ...but the remaining two tasks in the batch are never dispatched.
		expect(deleteTaskMock).toHaveBeenCalledTimes(1)
		expect(wrapper.vm.deleting).toBe(false)
		expect(wrapper.vm.cancelRequested).toBe(true)
		// The task that did finish deleting stays deleted.
		expect(Object.keys(wrapper.props('calendar').tasks)).toEqual(['task-1', 'task-2'])
	})

	it('resets the cancellation flag and continues with the remaining tasks when restarted', async () => {
		const wrapper = mountWithTasks(2)

		const firstRun = wrapper.vm.deleteCompletedTasks()
		wrapper.vm.cancelDeletion()
		resolvers[0]()
		await firstRun

		expect(deleteTaskMock).toHaveBeenCalledTimes(1)
		expect(wrapper.vm.cancelRequested).toBe(true)

		const secondRun = wrapper.vm.deleteCompletedTasks()
		expect(wrapper.vm.cancelRequested).toBe(false)

		resolvers[1]()
		await secondRun

		expect(deleteTaskMock).toHaveBeenCalledTimes(2)
		expect(wrapper.vm.deleting).toBe(false)
		expect(Object.keys(wrapper.props('calendar').tasks)).toEqual([])
	})
})
