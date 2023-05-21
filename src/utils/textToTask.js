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


/*
task
- task
+ task
* task
- [] task
- [x] task
- [X] task
- [ ] task
*/

/*
- task
	- task
	- task
		- task
	- task
*/

export const textToTask = (text) => {
	var lines = text.split(/\r?\n/)
		.filter(isNotOnlyWhitespace)
		.map(spaceToTab)

	const rootTask = {
		title: "ROOT",
		parent: undefined,
		depth: 0,
		children: []
	}
	var curTask = rootTask
	var numberOfTasks = 0

	while(lines.length){
		var line = lines.shift()
		var curDepth = countSpacesDepth(line)

		while (curTask.parent !== undefined && curDepth <= curTask.depth) {
			curTask = curTask.parent
		}

		var prefix = listLikePrefix(line)
		var title = line.substring(prefix.length)
		var nextTask = {
			title: title,
			parent: curTask,
			depth: curDepth,
			children: []
		}
		curTask.children.push(nextTask)
		curTask = nextTask
		numberOfTasks++
	}

	return {numberOfTasks, tasks: cleanTasks(rootTask.children)}
}

const cleanTasks = (tasks) => tasks.map(t => ({
	title: t.title,
	children: cleanTasks(t.children)
}))

const isNotOnlyWhitespace = (s) => {
	return /\S/.test(s)
}

// tab counts as 4 spaces
const spaceToTab = (s) => s.replace(/\t/g, '    ')

const listLikePrefix = (s) => s.match(/^([-+*\s]*(\[(\s|x|X)?]\s*)?)/)?.[0] || ""

const countSpacesDepth = (s) => s.match(/^(\s+)/)?.[0].length || 0
