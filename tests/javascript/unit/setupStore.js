import calendars, { Calendar } from 'Store/calendars.js'
import collections from 'Store/collections.js'
import tasks from 'Store/tasks.js'
import settings from 'Store/settings.js'
import Task from 'Models/task.js'
import router from '@/router.js'

import { loadICS } from '../../assets/loadAsset.js'

import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'
import { sync } from 'vuex-router-sync'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Store({
	modules: {
		calendars,
		collections,
		tasks,
		settings,
	},
})

// Sync router and store so that we can access
// the router from within the store
sync(store, router)

const calendarsData = [
	{
		url: 'calendar-1/tmp',
		displayname: 'Calendar 1',
		color: '#123456',
		isWriteable: () => { return true },
		isShareable: () => { return true },
		shares: [],
		components: ['VTODO'],
		calendarQuery: () => { return null },
		tasks: [
			'vcalendars/calendar1/vcalendar-vtodo1',
			'vcalendars/calendar1/vcalendar-vtodo2',
			'vcalendars/calendar1/vcalendar-vtodo3',
			'vcalendars/calendar1/vcalendar-vtodo3_1',
			'vcalendars/calendar1/vcalendar-vtodo3_1_1',
			'vcalendars/calendar1/vcalendar-vtodo3_2',
			'vcalendars/calendar1/vcalendar-vtodo4',
			'vcalendars/calendar1/vcalendar-vtodo4_1',
			'vcalendars/calendar1/vcalendar-vtodo5',
			'vcalendars/calendar1/vcalendar-vtodo6',
			'vcalendars/calendar1/vcalendar-vtodo7',
		].map(vcalendar => loadICS(vcalendar)),
	},
	{
		url: 'calendar-2/tmp',
		displayname: 'Calendar 2',
		color: '#123456',
		isWriteable: () => { return true },
		isShareable: () => { return true },
		shares: [],
		components: ['VTODO', 'VEVENT'],
		calendarQuery: () => { return null },
		tasks: [
			'vcalendars/calendar2/vcalendar-vtodo1',
			'vcalendars/calendar2/vcalendar-vtodo2',
			'vcalendars/calendar2/vcalendar-vtodo3',
			'vcalendars/calendar2/vcalendar-vtodo4',
			'vcalendars/calendar2/vcalendar-vtodo4_1',
			'vcalendars/calendar2/vcalendar-vtodo4_2',
			'vcalendars/calendar2/vcalendar-vtodo4_2_1',
		].map(vcalendar => loadICS(vcalendar)),
	},
]

calendarsData.forEach(calendarData => {
	const calendar = Calendar(calendarData)
	const tasks = calendarData.tasks.map(taskData => {
		const task = new Task(taskData, calendar)
		const response = {
			url: `${calendar.id}/${task.uid}.ics`,
			update: () => { return Promise.resolve(response) },
		}
		localVue.set(task, 'dav', response)
		return task
	})
	// Add subtasks correctly
	tasks.forEach(
		parent => {
			const subTasks = tasks.filter(task => {
				return task.related === parent.uid
			})

			// Convert list into an array and remove duplicate
			parent.subTasks = subTasks.reduce((list, task) => {
				if (list[task.uid]) {
					console.debug('Duplicate task overridden', list[task.uid], task)
				}
				localVue.set(list, task.uid, task)
				return list
			}, parent.subTasks)
		},
	)

	store.commit('addCalendar', calendar)
	store.commit('appendTasksToCalendar', { calendar, tasks })
})

export { store, localVue }
