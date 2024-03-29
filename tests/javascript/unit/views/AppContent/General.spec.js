import General from '../../../../../src/views/AppContent/General.vue'
import router from '../../../../../src/router.js'
import TaskBody from '../../../../../src/components/TaskBody.vue'

import { store } from '../../setupStore.js'

import { mount } from '@vue/test-utils'

import { describe, expect, it, vi } from 'vitest'

describe('General.vue', async () => {
	'use strict'

	await router.push('/')
	// After this line, router is ready
	await router.isReady()

	const wrapper = mount(General, {
		global: {
			plugins: [store, router],
			components: {
				TaskBody,
			},
		},
	})
	await vi.dynamicImportSettled()

	/*
	 * The all view shows uncompleted tasks
	 */
	it('Checks that we get the correct number of calendars for the all view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'all') {
			await router.push({ name: 'collections', params: { collectionId: 'all' } })
		}
		expect(wrapper.vm.calendars.length).toBe(2)
	})

	it('Checks that only uncompleted and not cancelled tasks show in the all view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'all') {
			await router.push({ name: 'collections', params: { collectionId: 'all' } })
		}
		expect(wrapper.find('li[task-id="pwen4kz18g.ics"]').exists()).toBe(true)
		expect(wrapper.find('li[task-id="pwen4kz40g.ics"]').exists()).toBe(false)
		expect(wrapper.find('li[task-id="pwen9kz48g.ics"]').exists()).toBe(false)
	})

	/*
	 * The starred view shows important and uncompleted tasks
	 */
	it('Checks that we get the correct number of calendars for the starred view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'starred') {
			await router.push({ name: 'collections', params: { collectionId: 'starred' } })
		}
		expect(wrapper.vm.filteredCalendars.length).toBe(1)
	})

	it('Checks that only important tasks show in the starred view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'starred') {
			await router.push({ name: 'collections', params: { collectionId: 'starred' } })
		}
		expect(wrapper.find('li[task-id="pwen4kz18g.ics"]').exists()).toBe(true) // Important task --> shown
		expect(wrapper.find('li[task-id="pwen4kz19g.ics"]').exists()).toBe(false) // Not important task --> hidden
		expect(wrapper.find('li[task-id="pwen4kz20g.ics"]').exists()).toBe(true) // Has an important subsubtask --> shown
		expect(wrapper.find('li[task-id="pwen4kz24g.ics"]').exists()).toBe(true) // Important subsubtask --> shown
		expect(wrapper.find('li[task-id="pwen4kz25g.ics"]').exists()).toBe(false) // Has an important sibling, but no important child --> hidden
		// Not important, has important subtask which is completed --> hidden
		expect(wrapper.find('li[task-id="pwen4kz30g.ics"]').exists()).toBe(false)
		expect(wrapper.find('li[task-id="pwen9kz48g.ics"]').exists()).toBe(false) // Important but cancelled --> hidden
	})

	/*
	 * The current view shows uncompleted tasks which don't have a start date in the future
	 */
	it('Checks that we get the correct number of calendars for the current view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'current') {
			await router.push({ name: 'collections', params: { collectionId: 'current' } })
		}
		expect(wrapper.vm.filteredCalendars.length).toBe(2)
	})

	it('Checks that only current tasks show in the current view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'current') {
			await router.push({ name: 'collections', params: { collectionId: 'current' } })
		}
		expect(wrapper.find('li[task-id="pwen4kz18g.ics"]').exists()).toBe(true) // No start or due date --> shown
		expect(wrapper.find('li[task-id="pwen4kz19g.ics"]').exists()).toBe(false) // Start date in the future --> hidden
		expect(wrapper.find('li[task-id="pwen4kz20g.ics"]').exists()).toBe(true) // Start date in the future, but current subsubtask --> shown
		expect(wrapper.find('li[task-id="pwen4kz24g.ics"]').exists()).toBe(true) // Current subsubtask --> shown
		expect(wrapper.find('li[task-id="pwen4kz25g.ics"]').exists()).toBe(false) // Start date in the future and no current child --> hidden
		// Not current, has current subtask which is completed --> hidden
		expect(wrapper.find('li[task-id="pwen4kz30g.ics"]').exists()).toBe(false)
	})

	/*
	 * The today view shows uncompleted tasks which started or are due today or earlier
	 */
	it('Checks that we get the correct number of calendars for the today view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'today') {
			await router.push({ name: 'collections', params: { collectionId: 'today' } })
		}
		expect(wrapper.vm.filteredCalendars.length).toBe(2)
	})

	it('Checks that only today tasks show in the today view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'today') {
			await router.push({ name: 'collections', params: { collectionId: 'today' } })
		}
		expect(wrapper.find('li[task-id="pwen4kz18g.ics"]').exists()).toBe(true) // Already due --> shown
		expect(wrapper.find('li[task-id="pwen4kz19g.ics"]').exists()).toBe(false) // Start date in the future --> hidden
		expect(wrapper.find('li[task-id="pwen4kz20g.ics"]').exists()).toBe(true) // Start date in the future, but due subsubtask --> shown
		expect(wrapper.find('li[task-id="pwen4kz23g.ics"]').exists()).toBe(true) // Due subtask --> shown
		// Not today, has today subtask which is completed --> hidden
		expect(wrapper.find('li[task-id="pwen4kz30g.ics"]').exists()).toBe(false)
	})

	/*
	 * The completed view shows completed tasks
	 */
	it('Checks that we get the correct number of calendars for the completed view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'completed') {
			await router.push({ name: 'collections', params: { collectionId: 'completed' } })
		}
		expect(wrapper.vm.filteredCalendars.length).toBe(1)
	})

	it('Checks that only completed or cancelled tasks show in the completed view', async () => {
		if (wrapper.vm.$route.params.collectionId !== 'completed') {
			await router.push({ name: 'collections', params: { collectionId: 'completed' } })
		}
		expect(wrapper.find('li[task-id="pwen4kz19g.ics"]').exists()).toBe(false) // Not completed --> hidden
		expect(wrapper.find('li[task-id="pwen4kz40g.ics"]').exists()).toBe(true) // Completed --> shown
		expect(wrapper.find('li[task-id="pwen9kz48g.ics"]').exists()).toBe(true) // Cancelled --> shown
	})
})
