import Week from 'Views/AppContent/Week.vue'
import router from '@/router.js'

import { store, localVue } from '../../setupStore.js'

import { mount } from '@vue/test-utils'

describe('Week.vue', () => {
	'use strict'

	/**
	 * We asynchronously import the "TaskBody" component inside "TaskDragContainer",
	 * so the first test always fails, since "TaskBody" is not loaded yet.
	 * I didn't find a proper solution yet, but mounting once before the actual tests
	 * mitigates the error.
	 * Proper solutions welcome, though.
	 */
	mount(Week, { localVue, store, router })

	it('Checks that the correct tasks are shown for day 0 (today)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz18g.ics"]').exists()).toBe(true) // Was due today --> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz20g.ics"]').exists()).toBe(true) // Has a due subtask --> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz23g.ics"]').exists()).toBe(true) // Due subtask --> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz25g.ics"]').exists()).toBe(false) // Start date in future --> hidden
		expect(wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true) // Was due today --> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(false) // Subtask due in 2 days --> hidden
	})

	it('Checks that the correct tasks are shown for day 1 (tomorrow)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="1"] li[task-id="pwen4kz41g.ics"]').exists()).toBe(true) // Starts tomorrow --> shown
	})

	it('Checks that the correct tasks are shown for day 2 (day after tomorrow)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="2"] li[task-id="pwen4kz21g.ics"]').exists()).toBe(true) // Start the day after tomorrow --> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true) // Was due today, but has subtask due in 2 days --> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(true) // Subtask due in 2 days --> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(false) // Subtask due in a month --> hidden
	})

	it('Checks that the correct tasks are shown for day 6', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="6"] li[task-id="pwen4kz22g.ics"]').exists()).toBe(true) // Starts in 7 days --> shown
	})

	it('Checks that only the clicked task is marked active', async () => {
		const wrapper = mount(Week, { localVue, store, router })
		const taskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"] > div')
		const taskAtDay2 = wrapper.find('div[day="2"] li[task-id="pwen8kz22g.ics"] > div')

		// Click on first task to open it
		taskAtDay0.trigger('click')
		await localVue.nextTick()

		expect(taskAtDay0.classes('task-item__body--active')).toBe(true) // Should be shown active, since it was clicked
		expect(taskAtDay2.classes('task-item__body--active')).toBe(false) // Shouldn't be shown active, since it was not clicked
	})

	it('Checks that not matching subtasks are only shown for active tasks', async () => {
		const wrapper = mount(Week, { localVue, store, router })
		const taskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"] > div')

		if (wrapper.vm.$route.params.taskId !== null) {
			router.push({ name: 'collections', params: { collectionId: 'week' } })
			await localVue.nextTick()
		}
		expect(taskAtDay0.classes('task-item__body--active')).toBe(false)

		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(false) // Not shown, since it doesn't match collection
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(false) // Not shown, since it doesn't match collection
		expect(wrapper.find('div[day="2"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(true) // Shown, since it is due in 2 days

		// Click on first task to open it
		taskAtDay0.trigger('click')
		await localVue.nextTick()
		expect(taskAtDay0.classes('task-item__body--active')).toBe(true)

		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(true) // Shown now, because parent is active
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(true) // Shown now, because parent is active
		expect(wrapper.find('div[day="2"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(false) // Not shown, since parent is not active
	})

	it('Checks that an active task and its ancestors are shown', async () => {
		const wrapper = mount(Week, { localVue, store, router })
		const taskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"] > div')

		if (wrapper.vm.$route.params.taskId !== null) {
			router.push({ name: 'collections', params: { collectionId: 'week' } })
			await localVue.nextTick()
		}
		expect(taskAtDay0.classes('task-item__body--active')).toBe(false)

		expect(wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true) // Shown, since it is due today
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(false) // Not shown, since it is only due in a month
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz38g.ics"]').exists()).toBe(false) // Not shown, since it is not due at all

		// Click on first task to open it
		taskAtDay0.trigger('click')
		await localVue.nextTick()
		expect(taskAtDay0.classes('task-item__body--active')).toBe(true)

		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(true) // Shown now, since parent is active
		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(true) // Shown now, since parent is active

		const subtaskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"] > div')
		// Click on subtask to open it
		subtaskAtDay0.trigger('click')
		await localVue.nextTick()
		expect(subtaskAtDay0.classes('task-item__body--active')).toBe(true)

		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz38g.ics"]').exists()).toBe(true) // Shown now, since parent is active
		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(false) // Not shown, since only sibling is active

		const subsubtaskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen2kz38g.ics"] > div')
		// Click on subtask to open it
		subsubtaskAtDay0.trigger('click')
		await localVue.nextTick()
		expect(subsubtaskAtDay0.classes('task-item__body--active')).toBe(true)

		expect(wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true) // Shown, since it is due today
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(true) // Shown, since child is active
		expect(wrapper.find('div[day="0"] li[task-id="pwen2kz38g.ics"]').exists()).toBe(true) // Shown, since it is active
	})
})
