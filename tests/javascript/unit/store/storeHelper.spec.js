import { sort } from '../../../../src/store/storeHelper.js'
import Task from '../../../../src/models/task.js'

import { loadICS } from '../../../assets/loadAsset.js'

import { describe, expect, it } from 'vitest'

const vCalendarNames = [
	'vcalendars/vcalendar-due-2019',
	'vcalendars/vcalendar-due-2018',
	'vcalendars/vcalendar-due-undefined',
	'vcalendars/vcalendar-due-2015',
]

const tasks = vCalendarNames.map((vCalendar) => { return new Task(loadICS(vCalendar)) })

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
