import Task from '../../src/models/task'

describe('task', () => {
	'use strict'

	const vCalendar = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should set status to "COMPLETED" on completion.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		expect(task.status).toEqual('COMPLETED')
		expect(task.completed).toEqual(true)
	})

	it('Should set status to "NEEDS-ACTION" when complete is 0.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 0
		expect(task.status).toEqual('NEEDS-ACTION')
		expect(task.completedDate).toEqual(null)
		expect(task.completed).toEqual(false)
	})

	it('Should set status to "IN-PROCESS" when complete is >0 and <100.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 50
		expect(task.status).toEqual('IN-PROCESS')
		expect(task.completedDate).toEqual(null)
		expect(task.completed).toEqual(false)
	})

	it('Should set complete to 100 when status is "COMPLETED".', () => {
		const task = new Task(vCalendar, {})
		task.status = 'COMPLETED'
		expect(task.complete).toEqual(100)
		expect(task.completedDate).not.toEqual(null)
		expect(task.completed).toEqual(true)
	})

	it('Should set complete to 0 when status is "NEEDS-ACTION".', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		task.status = 'NEEDS-ACTION'
		expect(task.complete).toEqual(0)
		expect(task.completed).toEqual(false)
	})

	it('Should set complete to >0 and <100 when status is "IN-PROCESS".', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		task.status = 'IN-PROCESS'
		expect(task.complete).toBeGreaterThan(0)
		expect(task.complete).toBeLessThan(100)
		expect(task.completed).toEqual(false)
	})

	it('Should set and get the uid', () => {
		const task = new Task(vCalendar, {})
		expect(task.uid).toEqual('pwen4kz18g')
		task.uid = 'pwen4kz19g'
		expect(task.uid).toEqual('pwen4kz19g')
	})
})
