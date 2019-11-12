import { mount } from '@vue/test-utils'
import Week from '../../../../../src/components/TheCollections/Week'
import router from '../../../../../src/components/TheRouter'

import { store, localVue } from '../../setupStore'

import VTooltip from 'v-tooltip'
localVue.use(VTooltip)

describe('Week.vue', () => {
	'use strict'

	it('Checks that the correct tasks are shown for day 0 (today)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz18g.ics"]').exists()).toBe(true)	// Was due today		--> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz20g.ics"]').exists()).toBe(true)	// Has a due subtask	--> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz23g.ics"]').exists()).toBe(true)	// Due subtask			--> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen4kz25g.ics"]').exists()).toBe(false)	// Start date in future	--> hidden
		expect(wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true)	// Was due today		--> shown
		expect(wrapper.find('div[day="0"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(false)	// Subtask due in 2 days--> hidden
	})

	it('Checks that the correct tasks are shown for day 1 (tomorrow)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="1"] li[task-id="pwen4kz41g.ics"]').exists()).toBe(true)	// Starts tomorrow		--> shown
	})

	it('Checks that the correct tasks are shown for day 2 (day after tomorrow)', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="2"] li[task-id="pwen4kz21g.ics"]').exists()).toBe(true)	// Start the day after tomorrow	--> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen8kz22g.ics"]').exists()).toBe(true)	// Was due today, but has subtask due in 2 days	--> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen7kz22g.ics"]').exists()).toBe(true)	// Subtask due in 2 days--> shown
		expect(wrapper.find('div[day="2"] li[task-id="pwen2kz37g.ics"]').exists()).toBe(false)	// Subtask due in a month --> hidden
	})

	it('Checks that the correct tasks are shown for day 6', () => {
		const wrapper = mount(Week, { localVue, store, router })
		expect(wrapper.find('div[day="6"] li[task-id="pwen4kz22g.ics"]').exists()).toBe(true)	// Starts in 7 days		--> shown
	})

	it('Checks that only the clicked task is marked active', () => {
		const wrapper = mount(Week, { localVue, store, router })
		let taskAtDay0 = wrapper.find('div[day="0"] li[task-id="pwen8kz22g.ics"] > div')
		let taskAtDay2 = wrapper.find('div[day="2"] li[task-id="pwen8kz22g.ics"] > div')

		// Click on first task to open it
		taskAtDay0.trigger('click')

		expect(taskAtDay0.classes('active')).toBe(true)	// Should be shown active, since it was clicked
		expect(taskAtDay2.classes('active')).toBe(false)	// Shouldn't be shown active, since it was not clicked
	})
})
