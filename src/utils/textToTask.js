/**
 * Nextcloud - Tasks
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

export const textToTask = (text) => {
	const lines = text.split(/\r?\n/)
		.filter(isNotOnlyWhitespace)
		.map(spaceToTab)

	const rootTask = {
		summary: 'ROOT',
		parent: undefined,
		depth: 0,
		children: [],
	}
	let curTask = rootTask
	let numberOfTasks = 0

	while (lines.length) {
		const line = lines.shift()
		const curDepth = countSpacesDepth(line)

		while (curTask.parent !== undefined && curDepth <= curTask.depth) {
			curTask = curTask.parent
		}

		const prefix = listLikePrefix(line)
		const summary = line.substring(prefix.length)
		const nextTask = {
			summary,
			parent: curTask,
			depth: curDepth,
			children: [],
		}
		curTask.children.push(nextTask)
		curTask = nextTask
		numberOfTasks++
	}

	return { numberOfTasks, tasks: cleanTasks(rootTask.children) }
}

const cleanTasks = (tasks) => tasks.map(t => ({
	summary: t.summary,
	children: cleanTasks(t.children),
}))

const isNotOnlyWhitespace = (s) => {
	return /\S/.test(s)
}

// tab counts as 4 spaces
const spaceToTab = (s) => s.replace(/\t/g, '    ')

const listLikePrefix = (s) => s.match(/^([-+*\s]*(\[(\s|x|X)?]\s*)?)/)?.[0] || ''

const countSpacesDepth = (s) => s.match(/^(\s+)/)?.[0].length || 0
