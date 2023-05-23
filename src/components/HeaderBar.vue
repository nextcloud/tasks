<!--
Nextcloud - Tasks

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
	<div class="header">
		<div v-if="$route.params.collectionId !== 'completed' && calendar && !calendar.readOnly"
			class="header__input">
			<NcTextField :value.sync="newTaskName"
				:label="placeholder"
				autocomplete="off"
				class="reactive"
				trailing-button-icon="arrowRight"
				:show-trailing-button="newTaskName !== ''"
				:trailing-button-label="placeholder"
				@trailing-button-click="addTask"
				@keyup.esc="clearNewTask($event)"
				@keyup.enter="addTask"
				@paste.stop="addMultipleTasks">
				<Plus :size="20" />
			</NcTextField>
		</div>
		<SortorderDropdown />
		<CreateMultipleTasksDialog v-if="showCreateMultipleTasksModal"
			:calendar="calendar"
			:tasks-to-create="multipleTasks"
			:tasks-additional-properties="additionalTaskProperties"
			@cancel="createMultipleTasksCancelled"
			@close="createMultipleTasksSuccessful" />
	</div>
</template>

<script>
import SortorderDropdown from './SortorderDropdown.vue'

import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'

import Plus from 'vue-material-design-icons/Plus.vue'

import { mapGetters, mapActions } from 'vuex'

import { textToTask } from '../utils/textToTask.js'
import CreateMultipleTasksDialog from './CreateMultipleTasksDialog.vue'

export default {
	components: {
		CreateMultipleTasksDialog,
		NcTextField,
		SortorderDropdown,
		Plus,
	},
	data() {
		return {
			newTaskName: '',
			showCreateMultipleTasksModal: false,
			multipleTasks: { numberOfTasks: 0, tasks: {} },
			additionalTaskProperties: {},
		}
	},
	computed: {
		...mapGetters({
			calendar: 'getCalendarByRoute',
		}),

		placeholder() {
			switch (this.$route.params.collectionId) {
			case 'starred':
				return t('tasks', 'Add an important task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'week':
			case 'today':
				return t('tasks', 'Add a task due today to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'current':
				return t('tasks', 'Add a current task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			default:
				return t('tasks', 'Add a task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			}
		},
	},
	methods: {
		...mapActions([
			'createTask',
		]),

		clearNewTask(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTaskWithName(task) {
			// If the task is created in the calendar view,
			// we set the current calendar
			if (this.$route.params.calendarId) {
				task.calendar = this.calendar
			}

			return this.createTask({
				...task,
				...this.getAdditionalTaskProperties(),
			})
		},

		getAdditionalTaskProperties() {
			const taskProperties = {}
			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.$route.params.collectionId === 'starred') {
				taskProperties.priority = 1
			}
			if (this.$route.params.collectionId === 'today'
				|| this.$route.params.collectionId === 'week') {
				taskProperties.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
				taskProperties.allDay = this.$store.state.settings.settings.allDay
			}
			if (this.$route.params.collectionId === 'current') {
				taskProperties.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}
			return taskProperties
		},

		addMultipleTasks($event) {
			const pastedText = $event.clipboardData.getData('text')
			const tasksFromText = textToTask(pastedText)

			if (tasksFromText.numberOfTasks <= 1) {
				return
			}

			this.multipleTasks = tasksFromText
			this.showCreateMultipleTasksModal = true
			this.additionalTaskProperties = this.getAdditionalTaskProperties()
		},

		addTask() {
			this.addTaskWithName({ summary: this.newTaskName })
			this.newTaskName = ''
		},

		createMultipleTasksCancelled() {
			this.showCreateMultipleTasksModal = false
			this.multipleTasks = { numberOfTasks: 0, tasks: {} }
			this.additionalTaskProperties = {}
		},

		createMultipleTasksSuccessful() {
			this.showCreateMultipleTasksModal = false
			this.multipleTasks = { numberOfTasks: 0, tasks: {} }
			this.additionalTaskProperties = {}
			this.newTaskName = ''
		},
	},
}
</script>

<style lang="scss" scoped>
// mobile breakpoint
$breakpoint-mobile: 1024px;

.header {
	padding: 12px 15px 12px 59px;
	position: sticky;
	top: 0;
	background-color: var(--color-background-dark);
	z-index: 1000;
	display: flex;

	@media only screen and (max-width: $breakpoint-mobile) {
		padding-right: 0;
		padding-left: 44px;
	}

	&__input {
		position: relative;
		width: calc(100% - 44px);

		:deep() .input-field {
			&__main-wrapper,
			&__input {
				height: 44px !important;
			}

			&__icon,
			&__clear-button.button-vue {
				height: 40px !important;
				width: 40px !important;
			}

			&__input--leading-icon {
				padding-left: 40px;
			}
		}
	}

	.sortorder {
		margin-left: auto;
	}
}
</style>
