/**
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { textToTask } from '../../../../src/utils/textToTask.js'

import { describe, expect, it } from 'vitest'

describe('utils/textToTask test suite', () => {
	it('should convert simple list with empty lines', () => {
		const text
			= `    
- task1
	
- task2
- task3
`

		const tasks = textToTask(text)

		expect(tasks).toEqual({
			numberOfTasks: 3,
			tasks: [
				{ summary: 'task1', children: [] },
				{ summary: 'task2', children: [] },
				{ summary: 'task3', children: [] },
			],
		})
	})

	it('should convert different prefixes', () => {
		const text
			= `
task
- task
+ task
* task
- [] task
- [x] task
- [X] task
- [ ] task`

		const tasks = textToTask(text)

		const expectedTasks = Array(8).fill({ summary: 'task', children: [] })
		expect(tasks).toEqual({ numberOfTasks: 8, tasks: expectedTasks })
	})

	it('should convert lists with sub-tasks', () => {
		const text
			= `
- task1
	- task1.1
		- task1.1.1
`

		const tasks = textToTask(text)

		const expectedTasks = [
			{
				summary: 'task1',
				children: [
					{
						summary: 'task1.1',
						children: [
							{ summary: 'task1.1.1', children: [] },
						],
					},
				],
			},
		]
		expect(tasks).toEqual({ numberOfTasks: 3, tasks: expectedTasks })
	})

	it('should convert lists with uneven indentation', () => {
		const text
			= `
-   task1
    - task1.1
     - task1.1.1
	- task1.2
 - task1.3
- task2
`

		const tasks = textToTask(text)

		const expectedTasks = [
			{
				summary: 'task1',
				children: [
					{
						summary: 'task1.1',
						children: [
							{ summary: 'task1.1.1', children: [] },
						],
					},
					{ summary: 'task1.2', children: [] },
					{ summary: 'task1.3', children: [] },
				],
			},
			{ summary: 'task2', children: [] },
		]
		expect(tasks).toEqual({ numberOfTasks: 6, tasks: expectedTasks })
	})

	it('should convert complex lists with sub-tasks', () => {
		const text
			= `
- task1
	- task1.1
		- task1.1.1
		- task1.1.2
	- task1.2
		- task1.2.1
- task2
- task3
	- task3.1
		- task3.1.1
`

		const tasks = textToTask(text)

		const expectedTasks = [
			{
				summary: 'task1',
				children: [
					{
						summary: 'task1.1',
						children: [
							{ summary: 'task1.1.1', children: [] },
							{ summary: 'task1.1.2', children: [] },
						],
					},
					{
						summary: 'task1.2',
						children: [
							{ summary: 'task1.2.1', children: [] },
						],
					},
				],
			},
			{ summary: 'task2', children: [] },
			{
				summary: 'task3',
				children: [
					{
						summary: 'task3.1',
						children: [
							{ summary: 'task3.1.1', children: [] },
						],
					},
				],
			},
		]
		expect(tasks).toEqual({ numberOfTasks: 10, tasks: expectedTasks })
	})
})
