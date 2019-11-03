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
DUE:20190101T123400\n
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
DTSTART:20190918T095816\n
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
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20181119T183919\n
DTSTAMP:20190918T095816\n
LAST-MODIFIED:20190918T095816\n
RELATED-TO:pwen4kz20g\n
UID:pwen4kz23g\n
SUMMARY:Calendar 1 - Task 3 - Subtask 1\n
DUE:20190101T123400\n
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
RELATED-TO:pwen4kz20g\n
UID:pwen4kz25g\n
SUMMARY:Calendar 1 - Task 3 - Subtask 2\n
DTSTART:20190918T095816\n
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
RELATED-TO:pwen4kz23g\n
UID:pwen4kz24g\n
SUMMARY:Calendar 1 - Task 3 - Subtask 1 - Subsubtask 1\n
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
UID:pwen4kz30g\n
SUMMARY:Calendar 1 - Task 4\n
DTSTART:20190918T095816\n
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
RELATED-TO:pwen4kz30g\n
UID:pwen4kz31g\n
SUMMARY:Calendar 1 - Task 4 - Subtask 1\n
PRIORITY:1\n
PERCENT-COMPLETE:100\n
STATUS:COMPLETED\n
COMPLETED:20190918T095816\n
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
UID:pwen4kz40g\n
SUMMARY:Calendar 1 - Task 2\n
PRIORITY:9\n
PERCENT-COMPLETE:100\n
STATUS:COMPLETED\n
COMPLETED:20190918T095816\n
DTSTART:20190918T095816\n
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
		const task = new Task(taskData, calendar)
		const response = {
			url: `${calendar.id}/${task.uid}.ics`
		}
		localVue.set(task, 'dav', response)
		return task
	})
	// Add subtasks correctly
	tasks.forEach(
		parent => {
			var subTasks = tasks.filter(task => {
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
		}
	)

	store.commit('addCalendar', calendar)
	store.commit('appendTasksToCalendar', { calendar, tasks })
})

export { store, localVue }
