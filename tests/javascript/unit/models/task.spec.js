import Task from '../../../../src/models/task.js'

import { loadICS } from '../../../assets/loadAsset.js'

import ICAL from 'ical.js'
import { RecurValue } from '@nextcloud/calendar-js'
import { describe, expect, it } from 'vitest'

describe('task', () => {
	'use strict'
	
	it('RecurValue should be available', () => {
		expect(RecurValue).toBeDefined()
		expect(typeof RecurValue.fromData).toEqual('function')
		
		// Test creating a simple recurrence rule
		const recurValue = RecurValue.fromData({ freq: 'DAILY', interval: 1 })
		expect(recurValue).toBeDefined()
		expect(recurValue.frequency).toEqual('DAILY')
	})
	
	it('Should manually parse RRULE', () => {
		const ics = loadICS('vcalendars/vcalendar-recurring-daily')
		const jCal = ICAL.parse(ics)
		const vCalendar = new ICAL.Component(jCal)
		const vtodo = vCalendar.getFirstSubcomponent('vtodo')
		const rruleProp = vtodo.getFirstProperty('rrule')
		const icalRecur = rruleProp.getFirstValue()
		
		// Try to convert to RecurValue
		const recurData = {
			freq: icalRecur.freq,
			interval: icalRecur.interval || 1,
		}
		const recurValue = RecurValue.fromData(recurData)
		
		expect(recurValue).toBeDefined()
		expect(recurValue.frequency).toEqual('DAILY')
	})
	
	it('Should parse RRULE when task is created', () => {
		// Log to see what's happening
		const origWarn = console.warn
		const warnings = []
		console.warn = (...args) => { warnings.push(args.join(' ')); origWarn(...args) }
		
		const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
		
		console.warn = origWarn
		
		// Check if there were warnings
		if (warnings.length > 0) {
			console.log('Warnings during task creation:', warnings)
		}
		
		// The task should have recurrence parsed
		console.log('Task isRecurring:', task.isRecurring)
		console.log('Task recurrenceRule:', JSON.stringify(task.recurrenceRule, null, 2))
		
		expect(task.isRecurring).toEqual(true)
	})

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

	it('Should set complete to <100 when status is "NEEDS-ACTION".', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 100
		task.status = 'NEEDS-ACTION'
		expect(task.complete).toBeLessThan(100)
		const complete = task.vtodo.getFirstPropertyValue('percent-complete')
		expect(complete).toEqual(99)
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should not adjust complete when not completed and status is "NEEDS-ACTION".', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.complete = 90
		task.status = 'NEEDS-ACTION'
		expect(task.complete).toBeLessThan(100)
		const complete = task.vtodo.getFirstPropertyValue('percent-complete')
		expect(complete).toEqual(90)
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

	it('Should show no tag if CATEGORIES parameter is empty.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-empty'), {})
		expect(task.tags.length).toEqual(0)
	})

	it('Should remove status property when set to null', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.status = null
		// Check that status gets removed instead of being set to zero
		const complete = task.vtodo.getFirstPropertyValue('status')
		expect(complete).toEqual(null)
	})

	it('Indicates closed when completed or cancelled', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		task.status = 'CANCELLED'
		expect(task.closed).toEqual(true)
		task.status = null
		expect(task.closed).toEqual(false)
		task.complete = 100
		expect(task.closed).toEqual(true)
	})

	it('Should show completed when status is completed', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-status-completed'), {})
		expect(task.closed).toEqual(true)
		expect(task.completed).toEqual(true)
	})

	it('Should filter by tags.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-categories-multiple'), {})
		expect(task.tags.length).toEqual(3)
		expect(task.matches('', { tags: [] })).toEqual(true)
		expect(task.matches('', { tags: ['cat1'] })).toEqual(true)
		expect(task.matches('', { tags: ['cat1', 'cat2', 'cat3'] })).toEqual(true)
		expect(task.matches('', { tags: ['cat1', 'cat2', 'cat3', 'cat4'] })).toEqual(false)
	})

	it('Should get the location.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default-location'), {})
		expect(task.location).toEqual('Nextcloud Headquarter')
	})

	it('Should set and return the location.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.location).toEqual('')
		const expected = 'Nextcloud Headquarter'
		task.location = expected
		expect(task.location).toEqual(expected)
	})

	it('Should get the URL.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default-url'), {})
		expect(task.customUrl).toEqual('www.nextcloud.com')
	})

	it('Should set and return the URL.', () => {
		const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
		expect(task.customUrl).toEqual('')
		const expected = 'www.nextcloud.com'
		task.customUrl = expected
		expect(task.customUrl).toEqual(expected)
	})

	describe('Recurring Tasks', () => {
		it('Should load RRULE from ICS file', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			// Debug: check what we actually got
			const rruleProp = task.vtodo.getFirstProperty('rrule')
			console.log('RRULE property:', rruleProp)
			if (rruleProp) {
				const rruleValue = rruleProp.getFirstValue()
				console.log('RRULE value:', rruleValue)
				console.log('RRULE value.freq:', rruleValue.freq)
				console.log('RRULE value.interval:', rruleValue.interval)
				console.log('RRULE value.parts:', rruleValue.parts)
				console.log('RRULE value.toString():', rruleValue.toString())
			}
			console.log('Task due:', task.due)
			console.log('Task _due:', task._due)
			console.log('Task recurrenceRule:', task.recurrenceRule)
			expect(rruleProp).toBeDefined()
		})

		it('Should parse daily recurrence rule', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule).toBeDefined()
			expect(task.recurrenceRule.frequency).toEqual('DAILY')
			expect(task.recurrenceRule.interval).toEqual(1)
		})

		it('Should parse weekly recurrence rule with interval', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('WEEKLY')
			expect(task.recurrenceRule.interval).toEqual(2)
		})

		it('Should parse recurrence rule with count', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-count'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.count).toEqual(5)
		})

		it('Should parse recurrence rule with until date', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-until'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.until).toBeDefined()
		})

		it('Should not be recurring without RRULE', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
			expect(task.isRecurring).toEqual(false)
			expect(task.recurrenceRule.frequency).toEqual('NONE')
		})

		it('Should have recurrenceRuleValue when recurring', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.recurrenceRuleValue).toBeDefined()
			expect(task.recurrenceRule.recurrenceRuleValue.frequency).toEqual('DAILY')
		})

		it('Should detect multiple RRULE properties', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			expect(task.hasMultipleRRules).toEqual(false)
		})

		it('Should parse RRULE with DTSTART instead of DUE', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-dtstart'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('DAILY')
		})

		it('Should parse RRULE even without due or start date (Thunderbird compatibility)', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-no-date'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('DAILY')
		})

		it('Should be able to create recurrence exceptions when recurring', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			expect(task.canCreateRecurrenceException).toEqual(true)
		})

		it('Should not be able to create recurrence exceptions when not recurring', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
			expect(task.canCreateRecurrenceException).toEqual(false)
		})
	})

	describe('RECURRENCE-ID Exception Instances', () => {
		it('Should parse RECURRENCE-ID property', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurrence-exception'), {})
			expect(task.isRecurrenceException).toEqual(true)
			expect(task.recurrenceId).toBeTruthy()
		})

		it('Should NOT parse RRULE when RECURRENCE-ID is present', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurrence-exception'), {})
			expect(task.isRecurrenceException).toEqual(true)
			expect(task.isRecurring).toEqual(false)
		})

		it('Should not have RECURRENCE-ID on normal tasks', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
			expect(task.isRecurrenceException).toEqual(false)
			expect(task.recurrenceId).toBeNull()
		})
	})
})
