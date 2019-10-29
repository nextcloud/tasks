import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import calendars from '../../../src/store/calendars'
import collections from '../../../src/store/collections'
import tasks from '../../../src/store/tasks'
import settings from '../../../src/store/settings'
import Task from '../../../src/models/task'

import { mapDavCollectionToCalendar } from '../../../src/store/calendars'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		calendars,
		collections,
		tasks,
		settings
	}
})

const calendarsData = [
	{
		url: 'calendar-1/tmp',
		displayname: 'Calendar 1',
		color: '#123456',
		isWriteable: () => { return true },
		shares: [],
		components: ['VTODO'],
		tasks: [`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
UID:pwen4kz18g\n
SUMMARY:Calendar 1 - Task 1\n
PRIORITY:1\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
UID:pwen4kz19g\n
SUMMARY:Calendar 1 - Task 2\n
PRIORITY:9\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
UID:pwen4kz20g\n
SUMMARY:Calendar 1 - Task 3\n
END:VTODO\n
END:VCALENDAR`
		],
	},
	{
		url: 'calendar-2/tmp',
		displayname: 'Calendar 2',
		color: '#123456',
		isWriteable: () => { return true },
		shares: [],
		components: ['VTODO', 'VEVENT'],
		tasks: [`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
UID:pwen4kz21g\n
SUMMARY:Calendar 2 - Task 1\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
UID:pwen4kz22g\n
SUMMARY:Calendar 2 - Task 2\n
END:VTODO\n
END:VCALENDAR`
		],
	},
]

calendarsData.forEach(calendarData => {
	const calendar = mapDavCollectionToCalendar(calendarData)
	const tasks = calendarData.tasks.map(taskData => {
		return new Task(taskData, calendar)
	})
	store.commit('addCalendar', calendar)
	store.commit('appendTasksToCalendar', { calendar, tasks })
})

export { store, localVue }
