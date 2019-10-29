import { mount } from '@vue/test-utils'
import General from '../../../../../src/components/TheCollections/General'
import router from '../../../../../src/components/TheRouter'

import { store, localVue } from '../../setupStore'

import VTooltip from 'v-tooltip'
localVue.use(VTooltip)

describe('General.vue', () => {
	'use strict'

	it('Checks that we get the correct number of calendars for the all view', () => {
		const wrapper = mount(General, { localVue, store, router })
		if (wrapper.vm.$route.params.collectionId !== 'all') {
			router.push({ name: 'collections', params: { collectionId: 'all' } })
		}
		expect(wrapper.vm.calendars.length).toBe(2)
	})

	it('Checks that we get the correct number of calendars for the starred view', () => {
		const wrapper = mount(General, { localVue, store, router })
		if (wrapper.vm.$route.params.collectionId !== 'starred') {
			router.push({ name: 'collections', params: { collectionId: 'starred' } })
		}
		expect(wrapper.vm.filteredCalendars.length).toBe(1)
	})
})
