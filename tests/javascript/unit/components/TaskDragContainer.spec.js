import TaskDragContainer from '../../../../src/components/TaskDragContainer.vue'
import Task from '../../../../src/models/task.js'
import calendars from '../../../../src/store/calendars.js'
import collections from '../../../../src/store/collections.js'
import tasks from '../../../../src/store/tasks.js'
import settings from '../../../../src/store/settings.js'
import principals from '../../../../src/store/principals.js'
import router from '../../../../src/router.js'

import { loadICS } from '../../../assets/loadAsset.js'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

const calendar = {
	url: 'calendar-1/tmp',
	displayname: 'Calendar 1',
	id: 'calendar-1',
}

const vCalendarNames = [
	'vcalendars/vcalendar-sortOrder2',
	'vcalendars/vcalendar-sortOrder6',
	'vcalendars/vcalendar-sortOrder1',
	'vcalendars/vcalendar-sortOrderByCreated1',
	'vcalendars/vcalendar-sortOrderByCreated2',
]

const taskItems = vCalendarNames.map(vCalendar => new Task(loadICS(vCalendar), calendar))

describe('TaskDragContainer.vue', () => {
	'use strict'

	let store
	beforeEach(() => {
		// Override the "updateTask" method so we don't get warnings about unresolved promises.
		tasks.actions.updateTask = vi.fn()

		store = new Store({
			modules: {
				calendars,
				collections,
				tasks,
				settings,
				principals,
			},
		})
	})

	it('Checks that the tasks are sorted correctly on manual sort.', async () => {
		const wrapper = shallowMount(TaskDragContainer, {
			localVue,
			store,
			router,
			propsData: {
				tasks: taskItems,
			},
		})
		// Set correct sort parameters
		wrapper.vm.$store.commit('setSetting', { type: 'sortOrder', value: 'manual' })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })

		// Check correct order
		const names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'])
		const sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([1, 2, 6, 564345550, 564345559])
	})

	it('Checks that tasks are properly reordered.', async () => {
		const wrapper = shallowMount(TaskDragContainer, {
			localVue,
			store,
			router,
			propsData: {
				tasks: taskItems,
			},
		})
		// Set correct sort parameters
		wrapper.vm.$store.commit('setSetting', { type: 'sortOrder', value: 'manual' })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })

		// Check the initial sorting
		let sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([1, 2, 6, 564345550, 564345559])
		let names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'])

		// Move the second task to the second position
		wrapper.vm.adjustSortOrder(null, 1, 1)
		sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([1, 2, 6, 564345550, 564345559])
		names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'])

		// Move the first task to the second position
		wrapper.vm.adjustSortOrder(null, 1, 0)
		// We have to trigger the sorting to update the sortedTask computed property. Only necessary in test env.
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: true })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })
		sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([2, 5, 6, 564345550, 564345559])
		names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 2', 'Test 1', 'Test 3', 'Test 4', 'Test 5'])

		// Move the second task to the first position
		wrapper.vm.adjustSortOrder(null, 0, 1)
		// We have to trigger the sorting to update the sortedTask computed property. Only necessary in test env.
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: true })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })
		sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([1, 2, 6, 564345550, 564345559])
		names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'])

		// Move the third task to the first position
		wrapper.vm.adjustSortOrder(null, 0, 2)
		// We have to trigger the sorting to update the sortedTask computed property. Only necessary in test env.
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: true })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })
		sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([0, 1, 2, 564345550, 564345559])
		names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 3', 'Test 1', 'Test 2', 'Test 4', 'Test 5'])

		// Move the third task to the first position
		wrapper.vm.adjustSortOrder(null, 0, 3)
		// We have to trigger the sorting to update the sortedTask computed property. Only necessary in test env.
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: true })
		wrapper.vm.$store.commit('setSetting', { type: 'sortDirection', value: false })
		sortOrder = wrapper.vm.sortedTasks.map(task => { return task.sortOrder })
		expect(sortOrder).toEqual([0, 1, 2, 3, 564345559])
		names = wrapper.vm.sortedTasks.map(task => { return task.summary })
		expect(names).toEqual(['Test 4', 'Test 3', 'Test 1', 'Test 2', 'Test 5'])
	})
})
