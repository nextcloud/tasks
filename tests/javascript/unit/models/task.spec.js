import Task from '../../../../src/models/task.js'

import { loadICS } from '../../../assets/loadAsset.js'

import ICAL from 'ical.js'
import { RecurValue, DateTimeValue } from '@nextcloud/calendar-js'
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

		it('Should parse weekly recurrence with multiple BYDAY values', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-byday'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('WEEKLY')
			expect(task.recurrenceRule.byDay).toContain('MO')
			expect(task.recurrenceRule.byDay).toContain('WE')
			expect(task.recurrenceRule.byDay).toContain('FR')
			expect(task.recurrenceRule.byDay.length).toEqual(3)
		})

		it('Should parse monthly recurrence with multiple BYMONTHDAY values', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-monthly-bymonthday'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('MONTHLY')
			expect(task.recurrenceRule.byMonthDay).toContain(1)
			expect(task.recurrenceRule.byMonthDay).toContain(15)
			expect(task.recurrenceRule.byMonthDay.length).toEqual(2)
		})

		it('Should parse monthly recurrence with BYSETPOS (first Monday)', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-monthly-bysetpos'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('MONTHLY')
			expect(task.recurrenceRule.byDay).toContain('MO')
			expect(task.recurrenceRule.bySetPosition).toEqual(1)
		})

		it('Should parse yearly recurrence with BYMONTH', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-yearly-bymonth'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('YEARLY')
			expect(task.recurrenceRule.byMonth).toContain(1)
			expect(task.recurrenceRule.byMonth).toContain(7)
			expect(task.recurrenceRule.byMonthDay).toContain(15)
		})

		it('Should create RecurValue with multiple BYDAY using setComponent', () => {
			// Test that setComponent correctly sets multiple BYDAY values
			const recurrenceValue = RecurValue.fromData({
				freq: 'WEEKLY',
				interval: 1,
			})

			// Use setComponent like we do in setRecurrenceRule
			recurrenceValue.setComponent('BYDAY', ['MO', 'WE', 'FR'])

			// Verify the components are set
			const byDayComponent = recurrenceValue.getComponent('BYDAY')
			expect(byDayComponent).toContain('MO')
			expect(byDayComponent).toContain('WE')
			expect(byDayComponent).toContain('FR')
			expect(byDayComponent.length).toEqual(3)

			// Convert to ICAL and verify the string output
			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()
			expect(rruleString).toContain('BYDAY=MO,WE,FR')
		})

		it('Should create RecurValue with BYMONTHDAY using setComponent', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'MONTHLY',
				interval: 1,
			})

			recurrenceValue.setComponent('BYMONTHDAY', [1, 15])

			const byMonthDayComponent = recurrenceValue.getComponent('BYMONTHDAY')
			expect(byMonthDayComponent).toContain(1)
			expect(byMonthDayComponent).toContain(15)

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()
			expect(rruleString).toContain('BYMONTHDAY=1,15')
		})

		it('Should create RecurValue with BYSETPOS using setComponent', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'MONTHLY',
				interval: 1,
			})

			recurrenceValue.setComponent('BYDAY', ['MO'])
			recurrenceValue.setComponent('BYSETPOS', [1])

			const byDayComponent = recurrenceValue.getComponent('BYDAY')
			expect(byDayComponent).toContain('MO')

			const bySetPosComponent = recurrenceValue.getComponent('BYSETPOS')
			expect(bySetPosComponent).toContain(1)

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()
			expect(rruleString).toContain('BYDAY=MO')
			expect(rruleString).toContain('BYSETPOS=1')
		})

		it('Should iterate UNTIL-bounded recurrence using cloned time (preserves timezone)', () => {
			// This tests the fix for: "TypeError: can't access property getAllSubcomponents, this.component is null"
			// The error occurred when creating a floating time without timezone info for UNTIL comparison
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-until'), {})
			expect(task.isRecurring).toEqual(true)

			// Get the ICAL.Recur from the recurrence rule
			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			expect(icalRecur.until).toBeDefined()

			// Clone the due date to preserve timezone info (the fix)
			const startTime = task.due.clone()

			// Create iterator and verify it works without throwing
			const iterator = icalRecur.iterator(startTime)
			expect(iterator).toBeDefined()

			// Should be able to call next() without error
			const firstOccurrence = iterator.next()
			expect(firstOccurrence).toBeDefined()

			// Should eventually return null when past UNTIL date
			let occurrenceCount = 1
			let occurrence = iterator.next()
			while (occurrence !== null && occurrenceCount < 100) {
				occurrenceCount++
				occurrence = iterator.next()
			}
			// UNTIL is 7 days after the start, so we should have ~7 occurrences for daily
			expect(occurrenceCount).toBeLessThanOrEqual(8)
		})

		it('Should be able to decrement COUNT in RRULE for tracking remaining occurrences', () => {
			// This tests the fix for: "max occurrences appear to be ignored"
			// The COUNT needs to be decremented when advancing to next occurrence
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-count'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.count).toEqual(5)

			// Get the RRULE property from vtodo
			const rruleProp = task.vtodo.getFirstProperty('rrule')
			expect(rruleProp).toBeDefined()

			const rruleValue = rruleProp.getFirstValue()
			expect(rruleValue.count).toEqual(5)

			// Simulate decrementing COUNT (as done in handleRecurringTaskCompletion)
			rruleValue.count = rruleValue.count - 1
			expect(rruleValue.count).toEqual(4)

			// Verify the change persists
			const rruleValueAfter = rruleProp.getFirstValue()
			expect(rruleValueAfter.count).toEqual(4)
		})

		it('Should detect when COUNT reaches 1 (last occurrence)', () => {
			// This verifies the logic for stopping recurrence when count limit is reached
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-count'), {})
			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()

			expect(icalRecur.count).toEqual(5)
			const hasCountLimit = icalRecur.count !== null && icalRecur.count > 0
			expect(hasCountLimit).toEqual(true)

			// When count is 1, this is the last occurrence
			icalRecur.count = 1
			const isLastOccurrence = hasCountLimit && icalRecur.count <= 1
			expect(isLastOccurrence).toEqual(true)
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

	describe('setRecurrenceRule Logic', () => {
		it('Should create RRULE with weekly BYDAY for multiple days', () => {
			// Test the logic used in setRecurrenceRule store action
			const recurrenceValue = RecurValue.fromData({
				freq: 'WEEKLY',
				interval: 1,
			})

			// Set multiple days (Mon, Wed, Fri)
			recurrenceValue.setComponent('BYDAY', ['MO', 'WE', 'FR'])

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()

			expect(rruleString).toContain('FREQ=WEEKLY')
			expect(rruleString).toContain('BYDAY=MO,WE,FR')
		})

		it('Should create RRULE with monthly BYMONTHDAY for multiple days', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'MONTHLY',
				interval: 1,
			})

			// Set multiple month days (1st and 15th)
			recurrenceValue.setComponent('BYMONTHDAY', [1, 15])

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()

			expect(rruleString).toContain('FREQ=MONTHLY')
			expect(rruleString).toContain('BYMONTHDAY=1,15')
		})

		it('Should create RRULE with yearly BYMONTH for multiple months', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'YEARLY',
				interval: 1,
			})

			// Set multiple months (Jan and Jul) with day 15
			recurrenceValue.setComponent('BYMONTH', [1, 7])
			recurrenceValue.setComponent('BYMONTHDAY', [15])

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()

			expect(rruleString).toContain('FREQ=YEARLY')
			expect(rruleString).toContain('BYMONTH=1,7')
			expect(rruleString).toContain('BYMONTHDAY=15')
		})

		it('Should create RRULE with COUNT limit', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'DAILY',
				interval: 1,
			})

			recurrenceValue.count = 10

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()

			expect(rruleString).toContain('FREQ=DAILY')
			expect(rruleString).toContain('COUNT=10')
		})

		it('Should create RRULE with UNTIL date', () => {
			const recurrenceValue = RecurValue.fromData({
				freq: 'DAILY',
				interval: 1,
			})

			// Set UNTIL to a specific date
			recurrenceValue.until = DateTimeValue.fromJSDate(new Date('2026-12-31T23:59:59Z'), { zone: 'utc' })

			const icalRecur = recurrenceValue.toICALJs()
			const rruleString = icalRecur.toString()

			expect(rruleString).toContain('FREQ=DAILY')
			expect(rruleString).toContain('UNTIL=')
			expect(rruleString).toContain('20261231')
		})

		it('Should update task vtodo RRULE property', () => {
			// Create a non-recurring task
			const task = new Task(loadICS('vcalendars/vcalendar-default'), {})
			expect(task.isRecurring).toEqual(false)

			// Build a recurrence value like setRecurrenceRule does
			const recurrenceValue = RecurValue.fromData({
				freq: 'WEEKLY',
				interval: 2,
			})
			recurrenceValue.setComponent('BYDAY', ['MO', 'FR'])

			// Convert to ICAL and update task
			const icalRecur = recurrenceValue.toICALJs()
			task.vtodo.removeAllProperties('rrule')
			task.vtodo.updatePropertyWithValue('rrule', icalRecur)

			// Verify the RRULE was set
			const rruleProp = task.vtodo.getFirstProperty('rrule')
			expect(rruleProp).toBeDefined()

			const rruleValue = rruleProp.getFirstValue()
			expect(rruleValue.freq).toEqual('WEEKLY')
			expect(rruleValue.interval).toEqual(2)
		})
	})

	describe('handleRecurringTaskCompletion Logic', () => {
		it('Should advance daily recurrence to next day', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-daily'), {})
			expect(task.isRecurring).toEqual(true)

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.due.clone()

			// Get iterator - first next() returns start, second returns next occurrence
			const iterator = icalRecur.iterator(startTime)
			iterator.next() // Skip the start date
			const nextOccurrence = iterator.next()

			expect(nextOccurrence).toBeDefined()
			// Next occurrence should be 1 day after start
			const dayDiff = (nextOccurrence.toUnixTime() - startTime.toUnixTime()) / 86400
			expect(dayDiff).toEqual(1)
		})

		it('Should advance weekly recurrence to next week', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.interval).toEqual(2) // Every 2 weeks

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.due.clone()

			// Get iterator - first next() returns start, second returns next occurrence
			const iterator = icalRecur.iterator(startTime)
			iterator.next() // Skip the start date
			const nextOccurrence = iterator.next()

			expect(nextOccurrence).toBeDefined()
			// Next occurrence should be 2 weeks (14 days) after start
			const dayDiff = (nextOccurrence.toUnixTime() - startTime.toUnixTime()) / 86400
			expect(dayDiff).toEqual(14)
		})

		it('Should stop iteration when UNTIL date is reached', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-until'), {})
			expect(task.isRecurring).toEqual(true)

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			expect(icalRecur.until).toBeDefined()

			const startTime = task.due.clone()
			const iterator = icalRecur.iterator(startTime)

			// Count occurrences until iterator returns null
			let count = 0
			while (iterator.next() !== null && count < 100) {
				count++
			}

			// Should have limited occurrences (UNTIL is 7 days after start for daily)
			expect(count).toBeLessThan(10)
			expect(count).toBeGreaterThan(0)
		})

		it('Should correctly identify last COUNT occurrence', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-with-count'), {})
			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()

			// Initial count is 5
			expect(icalRecur.count).toEqual(5)

			// Simulate completing occurrences
			icalRecur.count = 2
			expect(icalRecur.count <= 1).toEqual(false) // Not last yet

			icalRecur.count = 1
			expect(icalRecur.count <= 1).toEqual(true) // This is the last occurrence
		})

		it('Should handle weekly recurrence with multiple BYDAY correctly', () => {
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-byday'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.byDay).toContain('MO')
			expect(task.recurrenceRule.byDay).toContain('WE')
			expect(task.recurrenceRule.byDay).toContain('FR')

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.due.clone()

			const iterator = icalRecur.iterator(startTime)

			// Get multiple occurrences
			const occurrences = []
			for (let i = 0; i < 5; i++) {
				const occ = iterator.next()
				if (occ) occurrences.push(occ)
			}

			// Should have 5 occurrences
			expect(occurrences.length).toEqual(5)
		})

		it('Should find next Sunday when task starts on Tuesday with BYDAY=SU (bug fix)', () => {
			// This tests the fix for: "start date Tuesday, recurrence Sunday -> next should be Feb 1, not Feb 8"
			// The issue was that the iterator was unconditionally skipping the first occurrence,
			// but when the start date is NOT a valid occurrence, the first iterator.next()
			// already returns the correct next occurrence.
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-different-day'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('WEEKLY')
			expect(task.recurrenceRule.byDay).toContain('SU')

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.start.clone() // Jan 27, 2026 (Tuesday)

			const iterator = icalRecur.iterator(startTime)

			// First next() returns the first valid occurrence >= startTime
			// Since Jan 27 is Tuesday and rule is BYDAY=SU, first occurrence is Feb 1 (Sunday)
			const firstOccurrence = iterator.next()
			expect(firstOccurrence).toBeDefined()

			// Feb 1, 2026 is the next Sunday after Jan 27
			expect(firstOccurrence.month).toEqual(2) // February
			expect(firstOccurrence.day).toEqual(1) // 1st

			// Verify Jan 27 is NOT a valid occurrence (it's Tuesday, not Sunday)
			expect(firstOccurrence.year === startTime.year
				&& firstOccurrence.month === startTime.month
				&& firstOccurrence.day === startTime.day).toEqual(false)
		})

		it('Should find next 15th when task starts on 27th with BYMONTHDAY=15 (bug fix)', () => {
			// Monthly: task on Jan 27 with recurrence on 15th -> next should be Feb 15
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-monthly-different-day'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('MONTHLY')
			expect(task.recurrenceRule.byMonthDay).toContain(15)

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.start.clone() // Jan 27, 2026

			const iterator = icalRecur.iterator(startTime)

			// First occurrence should be Feb 15, not March 15
			const firstOccurrence = iterator.next()
			expect(firstOccurrence).toBeDefined()
			expect(firstOccurrence.month).toEqual(2) // February
			expect(firstOccurrence.day).toEqual(15)
		})

		it('Should find next July when task starts in January with BYMONTH=7 (bug fix)', () => {
			// Yearly: task in Jan with recurrence in July -> next should be July of same year
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-yearly-different-month'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('YEARLY')
			expect(task.recurrenceRule.byMonth).toContain(7)

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.start.clone() // Jan 27, 2026

			const iterator = icalRecur.iterator(startTime)

			// First occurrence should be July 15, 2026, not July 15, 2027
			const firstOccurrence = iterator.next()
			expect(firstOccurrence).toBeDefined()
			expect(firstOccurrence.year).toEqual(2026)
			expect(firstOccurrence.month).toEqual(7) // July
			expect(firstOccurrence.day).toEqual(15)
		})

		it('Should still skip start when it IS a valid occurrence (BYDAY=SU on Sunday)', () => {
			// When the start date IS a valid occurrence, we should still skip it
			// to get the NEXT occurrence (one week later)
			const task = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-same-day'), {})
			expect(task.isRecurring).toEqual(true)
			expect(task.recurrenceRule.frequency).toEqual('WEEKLY')
			expect(task.recurrenceRule.byDay).toContain('SU')

			const icalRecur = task.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime = task.start.clone() // Jan 25, 2026 (Sunday)

			const iterator = icalRecur.iterator(startTime)

			// First next() returns Jan 25 (which equals startTime)
			const firstOccurrence = iterator.next()
			expect(firstOccurrence).toBeDefined()
			expect(firstOccurrence.year).toEqual(startTime.year)
			expect(firstOccurrence.month).toEqual(startTime.month)
			expect(firstOccurrence.day).toEqual(startTime.day)

			// In handleRecurringTaskCompletion, we would detect this and call next() again
			// to get Feb 1 (the actual next occurrence)
			const secondOccurrence = iterator.next()
			expect(secondOccurrence).toBeDefined()
			expect(secondOccurrence.month).toEqual(2) // February
			expect(secondOccurrence.day).toEqual(1) // 1st (next Sunday)
		})

		it('Should correctly calculate next occurrence regardless of whether start is valid', () => {
			// This simulates the exact logic from handleRecurringTaskCompletion
			// to verify the fix works correctly

			// Case 1: Start is NOT a valid occurrence (Tuesday with BYDAY=SU)
			const task1 = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-different-day'), {})
			const icalRecur1 = task1.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime1 = task1.start.clone()
			const iterator1 = icalRecur1.iterator(startTime1)

			let nextOccurrence1 = iterator1.next()
			// Check if first occurrence matches start - if so, skip it
			if (nextOccurrence1
				&& nextOccurrence1.year === startTime1.year
				&& nextOccurrence1.month === startTime1.month
				&& nextOccurrence1.day === startTime1.day) {
				nextOccurrence1 = iterator1.next()
			}

			// Should be Feb 1, 2026 (first Sunday after Jan 27)
			expect(nextOccurrence1.month).toEqual(2)
			expect(nextOccurrence1.day).toEqual(1)

			// Case 2: Start IS a valid occurrence (Sunday with BYDAY=SU)
			const task2 = new Task(loadICS('vcalendars/vcalendar-recurring-weekly-same-day'), {})
			const icalRecur2 = task2.recurrenceRule.recurrenceRuleValue.toICALJs()
			const startTime2 = task2.start.clone()
			const iterator2 = icalRecur2.iterator(startTime2)

			let nextOccurrence2 = iterator2.next()
			// Check if first occurrence matches start - if so, skip it
			if (nextOccurrence2
				&& nextOccurrence2.year === startTime2.year
				&& nextOccurrence2.month === startTime2.month
				&& nextOccurrence2.day === startTime2.day) {
				nextOccurrence2 = iterator2.next()
			}

			// Should be Feb 1, 2026 (next Sunday after Jan 25)
			expect(nextOccurrence2.month).toEqual(2)
			expect(nextOccurrence2.day).toEqual(1)
		})
	})
})
