/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import TaskBody from '../../../../src/components/TaskBody.vue'
import { routes } from '../../../../src/router.js'

import { createRouter, createWebHistory } from 'vue-router'

import { store } from '../setupStore.js'

import { shallowMount, flushPromises } from '@vue/test-utils'

import { beforeEach, describe, expect, it } from 'vitest'

const router = createRouter({
	history: createWebHistory(),
	routes,
})

const openTask = async (taskId) => {
	await router.push({ name: 'calendarsTask', params: { calendarId: 'calendar-2', taskId } })
	await flushPromises()
}

describe('TaskBody.vue', () => {
	'use strict'

	// "Calendar 2 - Task 4", which has two subtasks
	const task = store.getters.getTaskByUri('pwen8kz22g.ics')

	const mountTaskBody = () => shallowMount(TaskBody, {
		global: {
			plugins: [store, router],
		},
		props: {
			task,
		},
	})

	beforeEach(async () => {
		await openTask('pwen4kz21g.ics')
		task.hideSubtasks = false
	})

	it('Clicking the open task hides and shows its subtasks', async () => {
		await openTask('pwen8kz22g.ics')
		const wrapper = mountTaskBody()
		expect(wrapper.vm.showSubtasks).toBe(true)

		await wrapper.find('.task-body__info').trigger('click')
		expect(task.hideSubtasks).toBe(1)
		expect(wrapper.vm.showSubtasks).toBe(false)

		await wrapper.find('.task-body__info').trigger('click')
		expect(task.hideSubtasks).toBe(0)
		expect(wrapper.vm.showSubtasks).toBe(true)
	})

	it('Clicking the open task hides subtasks that are only shown because it is open', async () => {
		task.hideSubtasks = true
		await openTask('pwen8kz22g.ics')
		const wrapper = mountTaskBody()
		expect(wrapper.vm.showSubtasks).toBe(true)

		await wrapper.find('.task-body__info').trigger('click')
		expect(task.hideSubtasks).toBe(1)
		expect(wrapper.vm.showSubtasks).toBe(false)
	})

	it('Clicking a task that is not open opens it without hiding its subtasks', async () => {
		const wrapper = mountTaskBody()

		await wrapper.find('.task-body__info').trigger('click')
		await flushPromises()
		expect(router.currentRoute.value.params.taskId).toBe('pwen8kz22g.ics')
		expect(task.hideSubtasks).toBe(0)
		expect(wrapper.vm.showSubtasks).toBe(true)
	})

	it('The second click of a double click does not show the subtasks again', async () => {
		await openTask('pwen8kz22g.ics')
		const wrapper = mountTaskBody()

		await wrapper.find('.task-body__info').trigger('click', { detail: 1 })
		await wrapper.find('.task-body__info').trigger('click', { detail: 2 })
		expect(task.hideSubtasks).toBe(1)
		expect(wrapper.vm.showSubtasks).toBe(false)
	})

	it('Opening the task again shows its subtasks again', async () => {
		await openTask('pwen8kz22g.ics')
		const wrapper = mountTaskBody()

		await wrapper.find('.task-body__info').trigger('click')
		expect(wrapper.vm.showSubtasks).toBe(false)

		await openTask('pwen4kz21g.ics')
		expect(wrapper.vm.showSubtasks).toBe(false)
		await openTask('pwen8kz22g.ics')
		expect(task.hideSubtasks).toBe(1)
		expect(wrapper.vm.showSubtasks).toBe(true)
	})
})
