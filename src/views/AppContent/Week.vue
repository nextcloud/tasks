<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div>
		<Header />
		<div class="task-list">
			<div v-for="day in days"
				:key="day.diff"
				:day="day.diff"
				class="grouped-tasks ui-droppable">
				<h2 class="heading">
					<span class="heading__title">{{ dayString(day.diff) }}</span>
				</h2>
				<TaskDragContainer :tasks="day.tasks"
					:collection-string="`week-${day.diff}`"
					:collection-id="`week-${day.diff}`" />
			</div>
		</div>
	</div>
</template>

<script>
import Header from '../../components/Header.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'
import { isTaskInList } from '../../store/storeHelper.js'
import './task-list.scss'

import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

import { mapGetters } from 'vuex'

export default {
	components: {
		Header,
		TaskDragContainer,
	},
	computed: {
		...mapGetters({
			tasks: 'getAllTasks',
			openRootTasks: 'findOpenRootTasks',
		}),

		/**
		 * Returns an array with an entry for every day which has tasks for this day.
		 *
		 * @return {Array} the array with the days
		 */
		days() {
			// Get all open root tasks
			const tasks = this.openRootTasks(this.tasks)

			// Construct array with days for the current week.
			const days = []
			for (let day = 0; day < 8; day++) {
				days.push({ diff: day, tasks: [] })

				tasks.forEach(task => {
					// Add the task to the respective day if it is within the next week.
					if (isTaskInList(task, `week-${day}`)) {
						days[day].tasks.push(task)
					}
				})
			}

			// Remove all days without tasks.
			return days.filter(day => day.tasks.length)
		},
	},
	methods: {
		dayString(day) {
			const date = moment().add(day, 'day')
			let dayString
			if (day === 0) {
				dayString = t('tasks', 'Today')
			} else if (day === 1) {
				dayString = t('tasks', 'Tomorrow')
			} else {
				dayString = date.format('dddd')
			}
			return dayString + ', ' + date.format('LL')
		},
	},
}
</script>
