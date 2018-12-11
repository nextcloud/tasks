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
			<div v-for="day in dayHasEntry(days)" :key="day" class="grouped-tasks ui-droppable">
				<h2 class="heading">
					{{ day | formatDay }}
				</h2>
				<ol collectionID="week"
					class="tasks"
					listID=""
					type="list"
				>
					<TaskBody v-for="task in sort(uncompletedRootTasks(tasks), sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
					<!-- ng-repeat="task in filtered = filteredTasks() | filter:taskAtDay(task,day) | filter:hasNoParent(task) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
				</ol>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { sort } from '../../store/storeHelper'
import SortorderDropdown from '../SortorderDropdown'
import TaskBody from '../Task'

export default {
	components: {
		'TaskBody': TaskBody,
		'SortorderDropdown': SortorderDropdown
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
	data() {
		return {
			days: [0, 1, 2, 3, 4, 5, 6]
		}
	},
	computed: {
		...mapGetters({
			tasks: 'getAllTasks',
			uncompletedRootTasks: 'findUncompletedRootTasks',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection'
		}),
	},
	methods: {
		sort,
		dayHasEntry: function(days) {
			return days
		}
	}
}
</script>
