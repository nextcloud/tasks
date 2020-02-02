import { sort } from 'Store/storeHelper'
import Task from 'Models/task'

const vCalendars = [`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20170101T180000\n
DTSTAMP:20180101T180000\n
LAST-MODIFIED:20180101T180000\n
UID:task01\n
SUMMARY:Test 1\n
DUE:20191119T183901\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20170101T180000\n
DTSTAMP:20180101T180000\n
LAST-MODIFIED:20180101T180000\n
UID:task02\n
SUMMARY:Test 1\n
DUE:20181119T183901\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20170101T180000\n
DTSTAMP:20180101T180000\n
LAST-MODIFIED:20180101T180000\n
UID:task03\n
SUMMARY:Test 1\n
END:VTODO\n
END:VCALENDAR`,
`
BEGIN:VCALENDAR\n
VERSION:2.0\n
PRODID:-//Nextcloud Tasks 0.11.3\n
BEGIN:VTODO\n
CREATED:20170101T180000\n
DTSTAMP:20180101T180000\n
LAST-MODIFIED:20180101T180000\n
UID:task04\n
SUMMARY:Test 1\n
DUE:20151119T183901\n
END:VTODO\n
END:VCALENDAR`]

const tasks = vCalendars.map((vCalendar) => { return new Task(vCalendar) })

describe('storeHelper', () => {
	'use strict'

	it('Tests descending sort by due date.', () => {
		const clonedTasks = tasks.slice(0)
		const expectedTasks = [tasks[3], tasks[1], tasks[0], tasks[2]]
		const receivedTasks = sort(clonedTasks, 'due', 0)
		expect(receivedTasks).toEqual(expectedTasks)
	})

	it('Tests ascending sort by due date.', () => {
		const clonedTasks = tasks.slice(0)
		const expectedTasks = [tasks[2], tasks[0], tasks[1], tasks[3]]
		const receivedTasks = sort(clonedTasks, 'due', 1)
		expect(receivedTasks).toEqual(expectedTasks)
	})
})
