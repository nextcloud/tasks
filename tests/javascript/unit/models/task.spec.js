import Task from 'Models/task.js'

import { loadICS } from '../../../assets/loadAsset.js'

import ICAL from 'ical.js'

import { CalendarComponent, RecurrenceManager, ToDoComponent } from '@nextcloud/calendar-js'
import { copyCalendarObjectInstanceIntoTaskComponent } from '../../../../src/models/task.js'

describe('task', () => {
	'use strict'

	it('Should set status to "COMPLETED" on completion.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 100
		expect(task.status).toEqual('COMPLETED')
		expect(task.completed).toEqual(true)
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set status to "NEEDS-ACTION" when complete is 0.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 0
		expect(task.status).toEqual('NEEDS-ACTION')
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set status to "IN-PROCESS" when complete is >0 and <100.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 50
		expect(task.status).toEqual('IN-PROCESS')
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to 100 when status is "COMPLETED".', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.status = 'COMPLETED'
		expect(task.complete).toEqual(100)
		expect(task.completed).toEqual(true)
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set complete to 0 when status is "NEEDS-ACTION".', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 100
		task.status = 'NEEDS-ACTION'
		expect(task.complete).toEqual(0)
		// Check that property gets removed instead of being set to zero
		const complete = task.vtodo.getFirstPropertyValue('percent-complete')
		expect(complete).toEqual(null)
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to >0 and <100 when status is "IN-PROCESS".', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 100
		task.status = 'IN-PROCESS'
		expect(task.complete).toBeGreaterThan(0)
		expect(task.complete).toBeLessThan(100)
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to <100 when setting completed to false.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 100
		task.completed = false
		expect(task.status).toEqual('IN-PROCESS')
		expect(task.complete).toBeLessThan(100)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to 100 when setting completed to true.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 0
		task.completed = true
		expect(task.status).toEqual('COMPLETED')
		expect(task.complete).toEqual(100)
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set and get the uid', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.uid).toEqual('pwen4kz18g')
		task.uid = 'pwen4kz19g'
		expect(task.uid).toEqual('pwen4kz19g')
	})

	it('Should set and get the summary', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.summary).toEqual('Test 1')
		task.summary = 'Test 2'
		expect(task.summary).toEqual('Test 2')
	})

	it('Should set and get the priority', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.priority).toEqual(0)
		task.priority = 1
		expect(task.priority).toEqual(1)
		task.priority = 0
		expect(task.priority).toEqual(0)
		// Check that property gets removed instead of being set to zero
		const priority = task.vtodo.getFirstPropertyValue('priority')
		expect(priority).toEqual(null)
	})

	it('Should not return "CHILD" relation.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-reltype-child'), {})
		expect(task.related).toEqual(null)
	})

	it('Should not return "SIBLING" relation.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-reltype-sibling'), {})
		expect(task.related).toEqual(null)
	})

	it('Should return "PARENT" relation.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-reltype-parent'), {})
		expect(task.related).toEqual('255ce6ca-fbae-4263-89c5-5743f8456b22')
	})

	it('Should return relation if RELTYPE is not specified.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-reltype-default'), {})
		expect(task.related).toEqual('255ce6ca-fbae-4263-89c5-5743f8456b22')
	})

	it('Should correctly set the parent.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.related).toEqual(null)
		task.related = 'newparent123'
		expect(task.related).toEqual('newparent123')
		task.related = 'newparent124'
		expect(task.related).toEqual('newparent124')
		task.related = null
		expect(task.related).toEqual(null)
	})

	it('Should correctly set the parent if a "RELATED-TO;RELTYPE=CHILD" property already exists.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-reltype-child'), {})
		expect(task.related).toEqual(null)
		task.related = 'newparent123'
		expect(task.related).toEqual('newparent123')
	})

	it('Should not change the sort order, when the created date is changed and x-apple-sort-order is set.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-sortOrder1'), {})
		expect(task.sortOrder).toEqual(1)
		task.created = ICAL.Time.fromDateTimeString('2018-11-19T18:39:11')
		expect(task.sortOrder).toEqual(1)
	})

	it('Should update the sort order, when the created date is changed and x-apple-sort-order is not set.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-sortOrderByCreated1'), {})
		expect(task.sortOrder).toEqual(564345550)
		task.created = ICAL.Time.fromDateTimeString('2018-11-19T18:39:11')
		expect(task.sortOrder).toEqual(564345551)
	})

	it('Should update the sort order, when x-apple-sort-order is deleted.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-sortOrder1'), {})
		expect(task.sortOrder).toEqual(1)
		task.sortOrder = null
		expect(task.sortOrder).toEqual(564345559)
	})

	it('Should update the sort order, when a new sort order is set.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-sortOrder1'), {})
		expect(task.sortOrder).toEqual(1)
		task.sortOrder = 2
		expect(task.sortOrder).toEqual(2)
	})

	it('Should show all tags from multiple properties.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-multiple'), {})
		expect(task.tags.length).toEqual(3)
	})

	it('Should properly add and remove tags from multiple properties.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-multiple'), {})
		expect(task.tags.length).toEqual(3)
		expect(task.tags).toEqual(['cat1', 'cat2', 'cat3'])
		task.tags = ['cat1', 'cat5']
		expect(task.tags).toEqual(['cat1', 'cat5'])
		task.tags = []
		expect(task.tags.length).toEqual(0)
	})

	it('Should properly add and remove tags from a single property.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-single'), {})
		expect(task.tags.length).toEqual(2)
		expect(task.tags).toEqual(['cat1', 'cat2'])
		task.tags = ['cat1', 'cat3']
		expect(task.tags).toEqual(['cat1', 'cat3'])
		task.tags = []
		expect(task.tags.length).toEqual(0)
	})

	it('Should properly add and remove tags if none are set yet.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-none'), {})
		expect(task.tags.length).toEqual(0)
		task.tags = ['cat1', 'cat3']
		expect(task.tags).toEqual(['cat1', 'cat3'])
		task.tags = []
		expect(task.tags.length).toEqual(0)
	})

	it('Should remove status property when set to null', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.status = null
		// Check that status gets removed instead of being set to zero
		const complete = task.vtodo.getFirstPropertyValue('status')
		expect(complete).toEqual(null)
	})

	it('Indicates cloesed when completed or cancelled', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.status = 'CANCELLED'
		expect(task.closed).toEqual(true)
		task.status = null
		expect(task.closed).toEqual(false)
		task.complete = 100
		expect(task.closed).toEqual(true)
	})

	it('Should map object to cal-js component correctly', () => {
		const todo = new ToDoComponent('VTODO')
		const calendar = new CalendarComponent('VCALENDAR')
		todo.recurrenceManager = new RecurrenceManager(todo)
		calendar.addComponent(todo)

		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		copyCalendarObjectInstanceIntoTaskComponent(task, todo)

		expect(todo.uid).toEqual(task.uid)
		expect(todo.title).toEqual(task.summary)
		expect(todo.status).toEqual(task.status)

		// CalendarJS returns true if start or due dates are null
		expect(todo.startDate !== null && todo.dueTime !== null ? todo.isAllDay() : false).toEqual(task.allDay)

		expect(todo.startDate?.toICALJs() ?? null).toEqual(task.start)
		expect(todo.dueTime?.toICALJs() ?? null).toEqual(task.due)
		expect(todo.creationTime?.toICALJs() ?? null).toEqual(task.created)

		// CalendarJS sets percent to null if we assign 0.
		expect(todo.percent || 0).toEqual(task.complete)
	})
})
