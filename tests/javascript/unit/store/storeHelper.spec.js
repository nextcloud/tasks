import { sort } from '../../../../src/store/storeHelper'

const tasks = [
	{
		id: 1,
		due: '20191119T183901'
	},
	{
		id: 2,
		due: '20181119T183901'
	},
	{
		id: 3,
		due: null
	},
	{
		id: 4,
		due: '20151119T183901'
	},
]

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

	it("Tests if correct tasks are found for the 'current' collection.", () => {
	})
})
