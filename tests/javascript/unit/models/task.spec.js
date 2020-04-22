import Task from 'Models/task'

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
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set status to "NEEDS-ACTION" when complete is 0.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 0
		expect(task.status).toEqual('NEEDS-ACTION')
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set status to "IN-PROCESS" when complete is >0 and <100.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 50
		expect(task.status).toEqual('IN-PROCESS')
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to 100 when status is "COMPLETED".', () => {
		const task = new Task(vCalendar, {})
		task.status = 'COMPLETED'
		expect(task.complete).toEqual(100)
		expect(task.completed).toEqual(true)
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set complete to 0 when status is "NEEDS-ACTION".', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		task.status = 'NEEDS-ACTION'
		expect(task.complete).toEqual(0)
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to >0 and <100 when status is "IN-PROCESS".', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		task.status = 'IN-PROCESS'
		expect(task.complete).toBeGreaterThan(0)
		expect(task.complete).toBeLessThan(100)
		expect(task.completed).toEqual(false)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to <100 when setting completed to false.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 100
		task.completed = false
		expect(task.status).toEqual('IN-PROCESS')
		expect(task.complete).toBeLessThan(100)
		expect(task.completedDate).toEqual(null)
	})

	it('Should set complete to 100 when setting completed to true.', () => {
		const task = new Task(vCalendar, {})
		task.complete = 0
		task.completed = true
		expect(task.status).toEqual('COMPLETED')
		expect(task.complete).toEqual(100)
		expect(task.completedDate).not.toEqual(null)
	})

	it('Should set and get the uid', () => {
		const task = new Task(vCalendar, {})
		expect(task.uid).toEqual('pwen4kz18g')
		task.uid = 'pwen4kz19g'
		expect(task.uid).toEqual('pwen4kz19g')
	})

	it('Should set and get the summary', () => {
		const task = new Task(vCalendar, {})
		expect(task.summary).toEqual('Test 1')
		task.summary = 'Test 2'
		expect(task.summary).toEqual('Test 2')
	})

	it('Should set and get the priority', () => {
		const task = new Task(vCalendar, {})
		expect(task.priority).toEqual(null)
		task.priority = 1
		expect(task.priority).toEqual(1)
	})

	const vCalendar2 = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	RELATED-TO;RELTYPE=CHILD:255ce6ca-fbae-4263-89c5-5743f8456b22\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should not return "CHILD" relation.', () => {
		const task = new Task(vCalendar2, {})
		expect(task.related).toEqual(null)
	})

	const vCalendar3 = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	RELATED-TO;RELTYPE=SIBLING:255ce6ca-fbae-4263-89c5-5743f8456b22\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should not return "SIBLING" relation.', () => {
		const task = new Task(vCalendar3, {})
		expect(task.related).toEqual(null)
	})

	const vCalendar4 = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	RELATED-TO;RELTYPE=PARENT:255ce6ca-fbae-4263-89c5-5743f8456b22\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should return "PARENT" relation.', () => {
		const task = new Task(vCalendar4, {})
		expect(task.related).toEqual('255ce6ca-fbae-4263-89c5-5743f8456b22')
	})

	const vCalendar5 = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	RELATED-TO:255ce6ca-fbae-4263-89c5-5743f8456b22\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should return relation if RELTYPE is not specified.', () => {
		const task = new Task(vCalendar5, {})
		expect(task.related).toEqual('255ce6ca-fbae-4263-89c5-5743f8456b22')
	})

	const vCalendar6 = `
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

	it('Should correctly set the parent.', () => {
		const task = new Task(vCalendar6, {})
		expect(task.related).toEqual(null)
		task.related = 'newparent123'
		expect(task.related).toEqual('newparent123')
		task.related = 'newparent124'
		expect(task.related).toEqual('newparent124')
		task.related = null
		expect(task.related).toEqual(null)
	})

	const vCalendar7 = `
	BEGIN:VCALENDAR\n
	VERSION:2.0\n
	PRODID:-//Nextcloud Tasks 0.11.3\n
	BEGIN:VTODO\n
	CREATED:20181119T183919\n
	DTSTAMP:20190918T095816\n
	LAST-MODIFIED:20190918T095816\n
	UID:pwen4kz18g\n
	SUMMARY:Test 1\n
	RELATED-TO;RELTYPE=CHILD:255ce6ca-fbae-4263-89c5-5743f8456b22\n
	END:VTODO\n
	END:VCALENDAR`

	it('Should correctly set the parent if a "RELATED-TO;RELTYPE=CHILD" property already exists.', () => {
		const task = new Task(vCalendar7, {})
		expect(task.related).toEqual(null)
		task.related = 'newparent123'
		expect(task.related).toEqual('newparent123')
	})
})
