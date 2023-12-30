import { sort, parseString } from '../../../../src/store/storeHelper.js'
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

describe('storeHelper - sort', () => {
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

describe('storeHelper - parseString', () => {
	'use strict'

	it('returns the whole summary if no delimiters are present', () => {
		const summary = 'plain summary without special delimiters'
		const result = parseString(summary)
		expect(result).toEqual({ summary, tags: [] })
	})

	it('returns the summary and single tag found', () => {
		const summary = 'summary and #tag'
		const result = parseString(summary)
		expect(result).toEqual({ summary: 'summary and', tags: ['tag'] })
	})

	it('returns the summary and multiple tags found', () => {
		const summary = 'summary and #tag1 #tag2'
		const result = parseString(summary)
		expect(result).toEqual({ summary: 'summary and', tags: ['tag1', 'tag2'] })
	})

	it('returns the summary and multiple tags found in varying order', () => {
		const summary = '#tag1 summary and #tag2 #tag3 more summary #tag4'
		const result = parseString(summary)
		expect(result).toEqual({ summary: 'summary and more summary', tags: ['tag1', 'tag2', 'tag3', 'tag4'] })
	})
})
