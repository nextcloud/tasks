<!--
Nextcloud - Tasks

@author Jakob Röhrl
@copyright 2021 Jakob Röhrl <jakob.roehrl@web.de>

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
		<DashboardWidget id="tasks_panel"
			:items="filteredTasks.slice(0, hasTaskToday ? 6 : 4)"
			empty-content-icon="icon-tasks"
			:empty-content-message="t('tasks', 'No upcoming tasks')"
			:show-more-text="t('tasks', 'upcoming tasks')"
			:loading="loading"
			:show-items-and-empty-content="!hasTaskToday"
			:half-empty-content-message="t('tasks', 'No tasks today')">
			<template #default="{ item }">
				<DashboardWidgetItem :main-text="item.summary"
					:sub-text="formatSubtext(item)"
					:target-url="getTasksAppUrl(item)">
					<template #avatar>
						<div class="calendar-dot"
							:style="{'background-color': item.calendar.color}"
							:title="item.calendar.displayName" />
					</template>
					<template #actions>
						<ActionButton v-if="!item.calendar.readOnly && !(item.calendar.isSharedWithMe && item.class !== 'PUBLIC')"
							:close-after-click="true"
							@click="onMarkAsDone(item)">
							<template #icon>
								<Check :size="20" decorative />
							</template>
							{{ t('tasks', 'Mark as done') }}
						</ActionButton>
					</template>
				</DashboardWidgetItem>
			</template>
		</DashboardWidget>
		<div class="center-button">
			<button @click="toggleAddTaskModel">
				{{ t('tasks', 'Create a new task') }}
			</button>
			<TaskCreateDialog v-if="showAddTaskModal" @close="toggleAddTaskModel" />
		</div>
	</div>
</template>

<script>
import TaskCreateDialog from '../components/TaskCreateDialog.vue'
import client from '../services/cdav.js'
import { sort, isTaskInList } from '../store/storeHelper.js'

import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import DashboardWidget from '@nextcloud/vue/dist/Components/DashboardWidget'
import DashboardWidgetItem from '@nextcloud/vue/dist/Components/DashboardWidgetItem'

import Check from 'vue-material-design-icons/Check'

import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'Dashboard',
	components: {
		ActionButton,
		Check,
		DashboardWidget,
		DashboardWidgetItem,
		TaskCreateDialog,
	},
	data() {
		return {
			loading: true,
			tasks: [],
			showAddTaskModal: false,
			itemMenu: {
				markAsDone: {
					text: t('tasks', 'Mark as done'),
					icon: 'icon-checkmark',
				},
			},
		}
	},
	computed: {
		...mapGetters({
			calendars: 'getTaskCalendars',
		}),
		hasTaskToday() {
			return this.filteredTasks.some(task => isTaskInList(task, 'today'))
		},
		filteredTasks() {
			return sort(this.tasks.filter(task => !task.closed))
		},
	},
	mounted() {
		this.initializeEnvironment()
	},
	methods: {
		t,

		...mapActions([
			'toggleCompleted',
		]),

		async initializeEnvironment() {
			await client.connect({ enableCalDAV: true })
			await this.$store.dispatch('fetchCurrentUserPrincipal')
			let { calendars } = await this.$store.dispatch('getCalendarsAndTrashBin')
			calendars = calendars.filter(calendar => calendar.supportsTasks)
			const owners = []
			calendars.forEach((calendar) => {
				if (owners.indexOf(calendar.owner) === -1) {
					owners.push(calendar.owner)
				}
			})
			owners.forEach((owner) => {
				this.$store.dispatch('fetchPrincipalByUrl', {
					url: owner,
				})
			})
			// No calendars? Create a new one!
			if (calendars.length === 0) {
				const color = this.$OCA.Theming?.color || '#0082C9'
				await this.$store.dispatch('appendCalendar', { displayName: t('tasks', 'Tasks'), color })
			}
			await this.fetchTasks()
		},
		async fetchTasks() {
			this.loading = true
			const results = await Promise.all(this.calendars.map(calendar =>
				this.$store.dispatch('getTasksFromCalendar', { calendar, completed: false, related: null })
			))
			this.tasks = [...results.flat()]
			this.loading = false
		},
		/**
		 * @param {object} task The task to format
		 * @return {string}
		 */
		formatSubtext(task) {
			if (!task.dueMoment.isValid()) {
				return t('tasks', 'No due date assigned')
			}
			if (task.allDay) {
				return task.dueMoment.calendar(null, {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					lastDay: t('tasks', '[Due yesterday]'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					sameDay: t('tasks', '[Due today]'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					nextDay: t('tasks', '[Due tomorrow]'),
					lastWeek: t('tasks', '[Due] L'),
					nextWeek: t('tasks', '[Due] L'),
					sameElse: t('tasks', '[Due] L'),
				})
			} else {
				return task.dueMoment.calendar(null, {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					lastDay: t('tasks', '[Due yesterday at] LT'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					sameDay: t('tasks', '[Due today at] LT'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					nextDay: t('tasks', '[Due tomorrow at] LT'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					lastWeek: t('tasks', '[Due] L [at] LT'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					nextWeek: t('tasks', '[Due] L [at] LT'),
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
					sameElse: t('tasks', '[Due] L [at] LT'),
				})
			}
		},
		/**
		 * @param {object} task The task to generate the URL for
		 * @return {string}
		 */
		getTasksAppUrl(task) {
			return generateUrl('apps/tasks') + `/#/calendars/${task.calendar.id}/tasks/${task.uri}`
		},

		toggleAddTaskModel() {
			this.showAddTaskModal = !this.showAddTaskModal
		},

		async onMarkAsDone(item) {
			await this.toggleCompleted(item)
			await this.fetchTasks()
		},
	},

}
</script>

<style lang="scss">
#tasks_panel {
	.calendar-dot {
		height: 1rem;
		width: 1rem;
		margin-top: .2rem;
		border-radius: 50%;
		min-width: 1rem;
		min-height: 1rem;
	}
}

.center-button {
	text-align: center;
	margin-top: 10px;
}
</style>
