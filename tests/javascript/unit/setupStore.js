import calendars, { Calendar } from '../../../src/store/calendars.js'
import collections from '../../../src/store/collections.js'
import tasks from '../../../src/store/tasks.js'
import settings from '../../../src/store/settings.js'
import Task from '../../../src/models/task.js'

import { loadICS } from '../../assets/loadAsset.js'

import { createStore } from 'vuex'

const store = createStore({
	modules: {
		calendars,
		collections,
		tasks,
		settings,
	},
})

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
		task.dav = response
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
				list[task.uid] = task
				return list
			}, parent.subTasks)
		},
	)

	store.commit('addCalendar', calendar)
	store.commit('appendTasksToCalendar', { calendar, tasks })
})

export { store }
