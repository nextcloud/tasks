import { describe, it, expect } from 'vitest'
import { createStore } from 'vuex'
import { loadICS } from '../../../assets/loadAsset.js'
import tasksModule from '../../../../src/store/tasks.js'
import Task from '../../../../src/models/task.js'
import dayjs from 'dayjs'
import ICAL from 'ical.js'

const store = createStore({
	modules: {
		tasks: tasksModule,
	},
})

describe('Tasks Store - setDue', () => {

	it('should set due date with allDay flag true', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		const dueDate = dayjs('2024-12-25 14:30:00')
		store.commit('setDue', {
			task,
			due: dueDate,
			allDay: true,
		})

		const expectedDueDate = new Date('2024-12-25')
		expect(task.due.toUnixTime()).toBe(expectedDueDate.getTime() / 1000)
		expect(task.allDay).toBe(true)
	})

	it('should set due date with allDay flag false', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		const dueDate = dayjs('2024-12-25 14:30:00')
		store.commit('setDue', {
			task,
			due: dueDate,
			allDay: false,
		})

		const expectedDueDate = new Date('2024-12-25T14:30:00')
		expect(task.due.toUnixTime()).toBe(Math.floor(expectedDueDate.getTime() / 1000))
		expect(task.allDay).toBe(false)
	})

	it('should clear due date when due is null', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		store.commit('setDue', {
			task,
			due: null,
			allDay: false,
		})

		expect(task.due).toBeNull()
	})

	it('should shift start before new due to match difference with old due', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.start = ICAL.Time.fromDateString('2024-12-20')
		task.due = ICAL.Time.fromDateString('2024-12-22') // 2 days difference

		const newDueDate = dayjs('2024-12-15')

		store.commit('setDue', {
			task,
			due: newDueDate,
			allDay: true,
		})

		expect(task.due.toUnixTime()).toBe(Math.floor(newDueDate.toDate().getTime() / 1000))
		expect(task.start.toUnixTime()).toBe(Math.floor(dayjs('2024-12-13').toDate().getTime() / 1000))
	})

	it('should shift start to new due when there is no old due', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.start = ICAL.Time.fromDateString('2024-12-20')
		task.due = null

		const newDueDate = dayjs('2024-12-19')
		store.commit('setDue', {
			task,
			due: newDueDate,
			allDay: true,
		})

		expect(task.due.toUnixTime()).toBe(Math.floor(newDueDate.toDate().getTime() / 1000))
		expect(task.start.toUnixTime()).toBe(Math.floor(newDueDate.toDate().getTime() / 1000))
	})
})

describe('Tasks Store - setStart', () => {

	it('should set start date with allDay flag true', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		const startDate = dayjs('2024-01-15')
		store.commit('setStart', {
			task,
			start: startDate,
			allDay: true,
		})

		expect(task.start).toBeDefined()
		expect(task.allDay).toBe(true)
	})

	it('should set start date with allDay flag false', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		const startDate = dayjs('2024-01-15 09:00:00')
		store.commit('setStart', {
			task,
			start: startDate,
			allDay: false,
		})

		expect(task.start).toBeDefined()
		expect(task.allDay).toBe(false)
	})

	it('should clear start date when start is null', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		store.commit('setStart', {
			task,
			start: null,
			allDay: false,
		})

		expect(task.start).toBeNull()
	})

	it('should shift due after new start to match difference with old start', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.start = ICAL.Time.fromDateString('2024-12-20')
		task.due = ICAL.Time.fromDateString('2024-12-22') // 2 days difference

		const newStartDate = dayjs('2024-12-25')

		store.commit('setStart', {
			task,
			start: newStartDate,
			allDay: true,
		})

		expect(task.start.toUnixTime()).toBe(Math.floor(newStartDate.toDate().getTime() / 1000))
		expect(task.due.toUnixTime()).toBe(Math.floor(dayjs('2024-12-27').toDate().getTime() / 1000))
	})

	it('should shift due to new start when there is no old start', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.start = null
		task.due = ICAL.Time.fromDateString('2024-12-25')

		const newStartDate = dayjs('2024-12-26')
		store.commit('setStart', {
			task,
			start: newStartDate,
			allDay: true,
		})

		expect(task.start.toUnixTime()).toBe(Math.floor(newStartDate.toDate().getTime() / 1000))
		expect(task.due.toUnixTime()).toBe(Math.floor(newStartDate.toDate().getTime() / 1000))
	})
})
