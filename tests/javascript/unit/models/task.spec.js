import Task from 'Models/task'

import { loadICS } from '../../../assets/loadAsset'

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
		expect(task.priority).toEqual(null)
		task.priority = 1
		expect(task.priority).toEqual(1)
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
})
