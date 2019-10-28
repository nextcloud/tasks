import { mount, createLocalVue } from '@vue/test-utils'
import General from '../../../../../src/components/TheCollections/General'
import store from '../../../../../src/store/store'
import router from '../../../../../src/components/TheRouter'

import { mapDavCollectionToCalendar } from '../../../../../src/store/calendars'

import VTooltip from 'v-tooltip'

const localVue = createLocalVue()
localVue.use(VTooltip)

describe('General.vue', () => {
	'use strict'

	const calendarsData = [
		{
			url: 'calendar-1/tmp',
			displayname: 'Calendar 1',
			color: '#123456',
			isWriteable: () => { return true },
			shares: [],
			components: ['VTODO'],
		},
		{
			url: 'calendar-2/tmp',
			displayname: 'Calendar 2',
			color: '#123456',
			isWriteable: () => { return true },
			shares: [],
			components: ['VTODO', 'VEVENT'],
		},
	]

	calendarsData.forEach(calendarData => {
		const calendar = mapDavCollectionToCalendar(calendarData)
		store.commit('addCalendar', calendar)
	})

	it('Checks that we get the correct number of calendars', () => {
		const wrapper = mount(General, { localVue, store, router })
		expect(wrapper.vm.calendars.length).toBe(2)
	})

	// it('Checks if correct tasks are found for current collection', () => {
	// 	const wrapper = mount(General, { localVue, store, router })
	// })
})
