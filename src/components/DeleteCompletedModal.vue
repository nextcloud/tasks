<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<div class="loadmore reactive">
		<ButtonVue v-show="completedTasksCount"
			type="tertiary"
			@click="openModal">
			<template #icon>
				<Delete :size="20" />
			</template>
			{{ t('tasks', 'Delete all completed tasks.') }}
		</ButtonVue>
		<Modal v-if="modalOpen"
			size="normal"
			:out-transition="true"
			@close="closeModal">
			<div class="delete-completed">
				<Delete :size="64" />
				<div v-if="completedTasksCount" class="delete-completed__header">
					<h3>
						{{ n('tasks', 'This will delete {taskCount} completed task and its subtasks from calendar "{calendar}".', 'This will delete {taskCount} completed tasks and their subtasks from calendar "{calendar}".', initialCompletedRootTasksCount, {taskCount: initialCompletedRootTasksCount, calendar: calendar.displayName}, { sanitize: false, escape: false }) }}
					</h3>
					<ButtonVue type="primary"
						class="delete-completed__button"
						@click="deleteCompletedTasks">
						<template #icon>
							<Delete :size="20" />
						</template>
						{{ t('tasks', 'Delete completed tasks.') }}
					</ButtonVue>
				</div>
				<div v-else>
					<h3>
						{{ t('tasks', 'Deleted all completed tasks from calendar "{calendar}".', { calendar: calendar.displayName }, undefined, { sanitize: false, escape: false }) }}
					</h3>
				</div>
				<div>
					<progress :max="initialCompletedTasksCount" :value="progress" class="delete-completed__progress" />
					<p class="delete-completed__tracker">
						<span>{{ percentage }} %</span>
						<span v-if="failed === 0">
							{{ t('tasks', 'No errors') }}
						</span>
						<span v-else v-tooltip.auto="t('tasks', 'Open your browser console for more details')">
							{{ n('tasks', 'Could not delete {failedCount} task.', 'Could not delete {failedCount} tasks.', failed, { failedCount: failed }) }}
						</span>
					</p>
				</div>
			</div>
		</Modal>
	</div>
</template>

<script>
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import ButtonVue from '@nextcloud/vue/dist/Components/ButtonVue'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import Tooltip from '@nextcloud/vue/dist/Directives/Tooltip'

import Delete from 'vue-material-design-icons/Delete'

import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		ButtonVue,
		Delete,
		Modal,
	},
	directives: {
		Tooltip,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			modalOpen: false,
			initialCompletedTasksCount: 0,
			initialCompletedRootTasksCount: 0,
		}
	},
	computed: {
		loadedCompleted() {
			return this.calendar.loadedCompleted
		},
		tasks() {
			return this.closedRootTasks(this.calendar.tasks)
		},
		completedTasksCount() {
			const closedCount = function counter(tasks) {
				let i = tasks.length
				tasks.forEach((task) => {
					i += counter(Object.values(task.subTasks))
				})
				return i
			}
			return closedCount(this.tasks)
		},
		failed() {
			return 0
		},
		progress() {
			return this.initialCompletedTasksCount - this.completedTasksCount
		},
		percentage() {
			return this.initialCompletedTasksCount <= 0
				? 0
				: Math.floor(this.progress / this.initialCompletedTasksCount * 100)
		},
		...mapGetters({
			closedCount: 'getCalendarCountClosed',
			closedRootTasks: 'findClosedRootTasks',
		}),
	},
	methods: {
		t,
		n,

		...mapActions([
			'deleteTask',
		]),
		openModal() {
			this.modalOpen = true
			this.initialCompletedTasksCount = this.completedTasksCount
			// Number of completed root tasks
			this.initialCompletedRootTasksCount = this.tasks.length
		},
		closeModal() {
			this.modalOpen = false
		},
		deleteCompletedTasks() {
			this.tasks.map(
				(task) => this.deleteTask({ task, dav: true })
			)
		},
	},
}
</script>

<style lang="scss" scoped>
.loadmore {
	display: flex;
	justify-content: center;
	top: 20px;
	position: relative;
}

.delete-completed {
	padding: 20px;
	padding-top: 40px;
	&__header {
		text-align: center;
		margin-bottom: 20px;
	}
	h3 {
		padding-top: 20px;
		max-width: 80%;
		margin: 12px auto;
	}
	&__button {
		margin: 0 auto;
	}
	&__progress {
		width: 80%;
		margin: 20px auto;
	}
	&__tracker {
		display: flex;
		justify-content: space-between;
		width: 80%;
		margin: auto;
		padding-top: 10px;
	}
}
</style>
