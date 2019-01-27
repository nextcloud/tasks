<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div>
		<SortorderDropdown />
		<div class="task-list">
			<div v-for="day in days" :key="day.diff" class="grouped-tasks ui-droppable">
				<h2 class="heading">
					{{ day.diff | formatDay }}
				</h2>
				<task-drag-container
					collection-id="week"
					class="tasks"
					type="list"
				>
					<TaskBody v-for="task in sort(day.tasks, sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</task-drag-container>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { sort } from '../../store/storeHelper'
import SortorderDropdown from '../SortorderDropdown'
import TaskBody from '../Task'
import TaskDragContainer from '../TaskDragContainer'

export default {
	components: {
		'TaskBody': TaskBody,
		'SortorderDropdown': SortorderDropdown,
		TaskDragContainer,
	},
	filters: {
		formatDay: function(day) {
			var date = moment().add(day, 'day')
			var dayString
			if (day === 0) {
				dayString = t('tasks', 'Today')
			} else if (day === 1) {
				dayString = t('tasks', 'Tomorrow')
			} else {
				dayString = date.format('dddd')
			}
			return dayString + ', ' + date.format('LL')
		}
	},
	computed: {
		...mapGetters({
			tasks: 'getAllTasks',
			uncompletedRootTasks: 'findUncompletedRootTasks',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection'
		}),

		/**
		 * Returns an array with an entry for every day which has tasks for this day.
		 *
		 * @returns {Array} the array with the days
		 */
		days: function() {
			// Construct array with days for the current week.
			var days = []
			for (var day = 0; day < 7; day++) {
				days.push({ diff: day, tasks: [] })
			}

			// Add every task due at a certain day to that day.
			var tasks = this.uncompletedRootTasks(this.tasks)
			var start, due
			tasks.forEach(task => {
				var diff, startdiff, duediff
				start = moment(task.start, 'YYYYMMDDTHHmmss').startOf('day')
				due = moment(task.due, 'YYYYMMDDTHHmmss').startOf('day')

				// Add all tasks whose start date will be reached at that day.
				if (start.isValid() && !due.isValid()) {
					diff = start.diff(moment().startOf('day'), 'days')
				}

				// Add all tasks whose due date will be reached at that day.
				if (due.isValid() && !start.isValid()) {
					diff = due.diff(moment().startOf('day'), 'days')
				}

				// Add all tasks whose due or start date will be reached at that day.
				// Add the task to the day at which either due or start date are reached first.
				if (start.isValid() && due.isValid()) {
					startdiff = start.diff(moment().startOf('day'), 'days')
					duediff = due.diff(moment().startOf('day'), 'days')
					// chose the date that is reached first
					diff = (startdiff < duediff) ? startdiff : duediff
				}

				// If the date was reached before today, map it to today.
				if (diff < 0) {
					diff = 0
				}
				// Add the task to the respective day if it is within the next week.
				if (diff < 7) {
					days[diff].tasks.push(task)
				}

			})

			// Remove all days without tasks.
			return days.filter(day => day.tasks.length)
		}
	},
	methods: {
		sort
	}
}
</script>
