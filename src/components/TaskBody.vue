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
	<li v-if="showTask"
		ref="taskItem"
		:task-id="task.uri"
		:class="{
			'task-item--closed': task.closed,
			'task-item--deleted': task.deleteCountdown !== null,
			'task-item--input-visible': (filteredSubtasksShown.length || showSubtaskInput),
			'task-item--subtasks-visible': filteredSubtasksShown.length,
			'task-item--non-started': !overdue(task.startMoment) && task.start
		}"
		:data-priority="[task.priority]"
		class="task-item"
		@dragstart="dragStart($event)">
		<div :task-id="task.uri"
			:class="{'task-item__body--active': isTaskOpen()}"
			class="task-item__body reactive"
			type="task"
			@click="navigate($event)">
			<!-- Checkbox -->
			<TaskCheckbox :completed="task.completed"
				class="no-nav"
				:cancelled="task.status === 'CANCELLED'"
				:read-only="readOnly"
				:recurring="task.recurring"
				:priority-class="priorityClass"
				@toggle-completed="toggleCompleted(task)" />
			<!-- Info: summary, progress & tags -->
			<div class="task-body__info"
				@dblclick="editSummary()">
				<div class="summary">
					<span v-linkify="{text: task.summary, linkify: true}" />
				</div>
				<div v-if="task.tags.length > 0" class="tags-list">
					<span v-for="(tag, index) in task.tags"
						:key="index"
						class="tag no-nav"
						@click="addTagToFilter(tag)">
						<span :title="tag" class="tag-label">
							{{ tag }}
						</span>
					</span>
				</div>
			</div>
			<!-- Icons: sync-status, calendarname, date, note, subtask-show-completed, subtask-visibility, add-subtask, starred -->
			<div class="task-body__icons">
				<TaskStatusDisplay :status="task.syncStatus"
					class="reactive no-nav"
					@status-clicked="updateTask"
					@reset-status="resetStatus({ task })" />
				<div v-if="collectionId=='week'" class="calendar">
					<span :style="{'background-color': task.calendar.color}" class="calendar__indicator" />
					<span class="calendar__name">{{ task.calendar.displayName }}</span>
				</div>
				<SortVariant v-if="hasHiddenSubtasks" :size="20" :title="t('tasks', 'Task has hidden subtasks')" />
				<CalendarClock v-if="!overdue(task.startMoment) && task.start" :size="20" :title="startDateString(task)" />
				<Pin v-if="task.pinned" :size="20" :title="t('tasks', 'Task is pinned')" />
				<TextBoxOutline v-if="task.note!=''"
					:size="20"
					:title="t('tasks', 'Task has a note')"
					@click="openAppSidebarTab($event, 'app-sidebar-tab-notes')"
					@dblclick.stop="openAppSidebarTab($event, 'app-sidebar-tab-notes', true)" />
				<div v-if="task.due || task.completed" :class="{'date--overdue': overdue(task.dueMoment) && !task.completed}" class="date">
					<span class="date__short" :class="{ 'date__short--completed': task.completed }">{{ dueDateShort }}</span>
					<span class="date__long" :class="{ 'date__long--date-only': task.allDay && !task.completed, 'date__long--completed': task.completed }">{{ dueDateLong }}</span>
				</div>
				<NcProgressBar v-if="task.complete > 0"
					type="circular"
					:value="task.complete"
					:aria-label="t('tasks', '{complete} % completed', {complete: task.complete})"
					:title="t('tasks', '{complete} % completed', {complete: task.complete})"
					:color="task.calendar.color" />
				<NcActions v-if="task.deleteCountdown === null" class="reactive no-nav" menu-align="right">
					<NcActionButton v-if="!task.calendar.readOnly"
						:close-after-click="true"
						class="reactive no-nav open-input"
						@click="openSubtaskInput">
						<template #icon>
							<Plus :size="20" />
						</template>
						{{ t('tasks', 'Add subtask') }}
					</NcActionButton>
					<NcActionButton v-if="Object.values(task.subTasks).length"
						class="reactive no-nav"
						@click="toggleSubtasksVisibility(task)">
						<template #icon>
							<SortVariant :size="20" />
						</template>
						{{ task.hideSubtasks ? t('tasks', 'Show subtasks') : t('tasks', 'Hide subtasks') }}
					</NcActionButton>
					<NcActionButton v-if="hasCompletedSubtasks"
						class="reactive no-nav"
						@click="toggleCompletedSubtasksVisibility(task)">
						<template #icon>
							<Eye :size="20" />
						</template>
						{{ task.hideCompletedSubtasks ? t('tasks', 'Show closed subtasks') : t('tasks', 'Hide closed subtasks') }}
					</NcActionButton>
					<NcActionButton v-if="!readOnly"
						class="reactive no-nav"
						@click="scheduleTaskDeletion(task)">
						<template #icon>
							<Delete :size="20" />
						</template>
						{{ t('tasks', 'Delete task') }}
					</NcActionButton>
				</NcActions>
				<NcActions v-if="task.deleteCountdown !== null">
					<NcActionButton class="reactive no-nav"
						@click.prevent.stop="clearTaskDeletion(task)">
						<template #icon>
							<Undo :size="20" />
						</template>
						{{ n('tasks', 'Deleting the task in {countdown} second', 'Deleting the task in {countdown} seconds', task.deleteCountdown, { countdown: task.deleteCountdown }) }}
					</NcActionButton>
				</NcActions>
				<NcActions :disabled="readOnly" :class="[{ priority: task.priority }, priorityClass]" class="reactive no-nav">
					<NcActionButton :disabled="readOnly"
						@click="toggleStarred(task)">
						<template #icon>
							<Star :size="20" />
						</template>
						{{ t('tasks', 'Toggle starred') }}
					</NcActionButton>
				</NcActions>
			</div>
		</div>
		<div class="task-item__subtasks">
			<div v-if="showSubtaskInput"
				v-click-outside="closeSubtaskInput"
				class="task-item task-item__input">
				<NcTextField ref="input"
					v-model="newTaskName"
					:placeholder="subtasksCreationPlaceholder"
					:label-outside="true"
					:disabled="isAddingTask"
					autocomplete="off"
					class="reactive"
					trailing-button-icon="arrowRight"
					:show-trailing-button="newTaskName !== ''"
					:trailing-button-label="subtasksCreationPlaceholder"
					@trailing-button-click="addTask"
					@keyup.esc="showSubtaskInput = false"
					@keyup.enter="addTask"
					@paste.stop="addMultipleTasks">
					<template #icon>
						<Plus :size="20" />
					</template>
				</NcTextField>
			</div>
			<TaskDragContainer :tasks="filteredSubtasksShown"
				:disabled="task.calendar.readOnly"
				:collection-string="collectionString"
				:task-id="task.uri"
				:calendar-id="task.calendar.uri" />
		</div>
		<CreateMultipleTasksDialog v-if="showCreateMultipleTasksModal"
			:root-task="task"
			:calendar="task.calendar"
			:tasks-to-create="multipleTasks"
			:tasks-additional-properties="additionalTaskProperties"
			@cancel="createMultipleTasksCancelled"
			@close="createMultipleTasksSuccessful" />
	</li>
</template>

<script>
import { overdue, sort, searchSubTasks, isTaskInList } from '../store/storeHelper.js'
import TaskCheckbox from './TaskCheckbox.vue'
import TaskStatusDisplay from './TaskStatusDisplay.vue'
import TaskDragContainer from './TaskDragContainer.vue'
import Task from '../models/task.js'
import openNewTask from '../mixins/openNewTask.js'
import { startDateString } from '../utils/dateStrings.js'

import { emit } from '@nextcloud/event-bus'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcProgressBar from '@nextcloud/vue/dist/Components/NcProgressBar.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import Linkify from '@nextcloud/vue/dist/Directives/Linkify.js'

import Delete from 'vue-material-design-icons/Delete.vue'
import Eye from 'vue-material-design-icons/Eye.vue'
import Pin from 'vue-material-design-icons/Pin.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import TextBoxOutline from 'vue-material-design-icons/TextBoxOutline.vue'
import SortVariant from 'vue-material-design-icons/SortVariant.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import Star from 'vue-material-design-icons/Star.vue'
import Undo from 'vue-material-design-icons/Undo.vue'

import { vOnClickOutside as ClickOutside } from '@vueuse/components'
import { mapGetters, mapActions, mapMutations } from 'vuex'

import { textToTask } from '../utils/textToTask.js'
import CreateMultipleTasksDialog from './CreateMultipleTasksDialog.vue'

export default {
	name: 'TaskBody',
	directives: {
		ClickOutside,
		Linkify,
	},
	components: {
		CreateMultipleTasksDialog,
		TaskCheckbox,
		TaskStatusDisplay,
		TaskDragContainer,
		NcActions,
		NcActionButton,
		NcProgressBar,
		NcTextField,
		Delete,
		Eye,
		Pin,
		Plus,
		TextBoxOutline,
		SortVariant,
		CalendarClock,
		Star,
		Undo,
	},
	mixins: [openNewTask],
	props: {
		task: {
			type: Object,
			required: true,
		},
		collectionString: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			showSubtaskInput: false,
			newTaskName: '',
			isAddingTask: false,
			showCreateMultipleTasksModal: false,
			multipleTasks: { numberOfTasks: 0, tasks: {} },
			additionalTaskProperties: {},
		}
	},
	computed: {
		...mapGetters({
			searchQuery: 'searchQuery',
			filter: 'filter',
		}),

		dueDateShort() {
			if (!this.task.completed) {
				return this.task.dueMoment.isValid()
					? this.task.dueMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastDay: t('tasks', '[Yesterday]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: t('tasks', '[Today]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: t('tasks', '[Tomorrow]'),
						lastWeek: 'L',
						nextWeek: 'L',
						sameElse: 'L',
					})
					: ''
			} else {
				return this.task.completedDateMoment.isValid()
					? this.task.completedDateMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastDay: t('tasks', '[Completed yesterday]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: t('tasks', '[Completed today]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: t('tasks', '[Completed tomorrow]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastWeek: '[Completed] L',
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextWeek: '[Completed] L',
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameElse: '[Completed] L',
					})
					: ''
			}
		},

		dueDateLong() {
			if (this.task.allDay) {
				return this.dueDateShort
			}
			if (!this.task.completed) {
				return this.task.dueMoment.isValid()
					? this.task.dueMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastDay: t('tasks', '[Yesterday at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: t('tasks', '[Today at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: t('tasks', '[Tomorrow at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastWeek: t('tasks', 'L [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextWeek: t('tasks', 'L [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameElse: t('tasks', 'L [at] LT'),
					})
					: ''
			} else {
				return this.task.completedDateMoment.isValid()
					? this.task.completedDateMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastDay: t('tasks', '[Completed yesterday at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: t('tasks', '[Completed today at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: t('tasks', '[Completed tomorrow at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastWeek: t('tasks', '[Completed] L [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextWeek: t('tasks', '[Completed] L [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameElse: t('tasks', '[Completed] L [at] LT'),
					})
					: ''
			}
		},

		collectionId() {
			if (this.collectionString) {
				return this.collectionString.split('-')[0]
			} else {
				return null
			}
		},

		collectionParam() {
			try {
				return this.collectionString.split('-')[1]
			} catch {
				return undefined
			}
		},

		priorityClass() {
			if (+this.task.priority > 5) {
				return 'priority--low'
			}
			if (+this.task.priority === 5) {
				return 'priority--medium'
			}
			if (+this.task.priority > 0) {
				return 'priority--high'
			}
			return null
		},

		hasCompletedSubtasks() {
			return Object.values(this.task.subTasks).some(subTask => {
				return subTask.closed
			})
		},

		hasHiddenSubtasks() {
			return (this.hasCompletedSubtasks && this.task.hideCompletedSubtasks) || (this.filteredSubtasks.length && this.task.hideSubtasks)
		},

		/**
		 * Returns the placeholder string shown in the subtasks input field
		 *
		 * @return {string} the placeholder string to show
		 */
		subtasksCreationPlaceholder() {
			return t('tasks', 'Add a subtask to "{task}"…', { task: this.task.summary }, undefined, { sanitize: false, escape: false })
		},

		/**
		 * Returns the subtasks filtered by completed state if necessary and
		 * filtered by collections (for week, today, important and current) when
		 * the task is not opened in details view.
		 *
		 * @return {Array} the array with the filtered subtasks
		 */
		filteredSubtasks() {
			let subTasks = Object.values(this.task.subTasks)
			if (this.task.hideCompletedSubtasks) {
				subTasks = subTasks.filter(task => {
					return !task.closed
				})
			}
			if (['today', 'week', 'starred', 'current'].indexOf(this.collectionId) > -1
				&& !this.isTaskOpen()) {
				subTasks = subTasks.filter(task => {
					return isTaskInList(task, this.collectionString) || this.isTaskOpen(task) || this.isDescendantOpen(task)
				})
			}
			return subTasks
		},

		/**
		 * Returns the filtered subtasks or an empty array if the subtasks should be hidden.
		 *
		 * @return {Array} the array with the subtasks to show
		 */
		filteredSubtasksShown() {
			 if (this.showSubtasks) {
				return this.filteredSubtasks
			 }
			 return []
		},

		/**
		 * Indicates whether we show the task because it matches the search.
		 *
		 * @return {boolean} If the task matches
		 */
		showTask() {
			// If the task directly matches the search, we show it.
			if (this.task.matches(this.searchQuery, this.filter)) {
				return true
			}
			// We also have to show tasks for which one sub(sub...)task matches.
			return this.searchSubTasks(this.task, this.searchQuery, this.filter)
		},

		/**
		 * Checks whether we show the subtasks
		 *
		 * @return {boolean} If we show the subtasks
		 */
		showSubtasks() {
			if (!this.task.hideSubtasks || this.searchQuery || this.isTaskOpen() || this.isDescendantOpen()) {
				return true
			} else {
				return false
			}
		},

		/**
		 * Whether we treat the task as read-only.
		 * We also treat tasks in shared calendars with an access class other than 'PUBLIC'
		 * as read-only.
		 *
		 * @return {boolean} Is the task read-only
		 */
		readOnly() {
			return this.task.calendar.readOnly || (this.task.calendar.isSharedWithMe && this.task.class !== 'PUBLIC')
		},
	},

	created() {
		if (!this.task.loadedCompleted && this.$route.params.taskId === this.task.uri) {
			this.getTasksFromCalendar({ calendar: this.task.calendar, completed: true, related: this.task.uid })
		}
	},

	methods: {
		t,
		n,
		startDateString,

		...mapActions([
			'toggleCompleted',
			'toggleStarred',
			'createTask',
			'getTasksFromCalendar',
			'toggleSubtasksVisibility',
			'toggleCompletedSubtasksVisibility',
			'scheduleTaskDeletion',
			'clearTaskDeletion',
			'fetchFullTask',
		]),
		...mapMutations(['resetStatus', 'setFilter']),
		sort,
		/**
		 * Checks if a date is overdue
		 */
		overdue,

		updateTask() {
			if (this.task.syncStatus?.status === 'conflict') {
				this.fetchFullTask({ task: this.task })
			}
		},

		addTagToFilter(tag) {
			const filter = this.filter
			if (!this.filter?.tags.includes(tag)) {
				filter.tags.push(tag)
				this.setFilter(filter)
			}
		},

		/**
		 * Set task uri in the data transfer object
		 * so we can get it when dropped on an
		 * app-navigation-item
		 *
		 * @param {object} e The drag event
		 */
		dragStart(e) {
			// Only set the uri if it's the closest task to the drag event
			// so we don't get the uri of the root task (the event bubbles up).
			if (e.target.closest('.task-item') !== this.$refs.taskItem) {
				return
			}
			e.dataTransfer.setData('text/plain', this.task.uri)
		},

		/**
		 * Checks if one of the tasks sub(sub-...)tasks matches the search query
		 *
		 * @param {Task} task The task to search in
		 * @param {string} searchQuery The string to find
		 * @return {boolean} If the task matches
		 */
		searchSubTasks,

		/**
		 * Checks whether the task is currently open in the details view
		 *
		 * @param {Task} task The task to check
		 * @return {boolean} If it is open
		 */
		isTaskOpen(task = this.task) {
			return (task.uri === this.$route.params.taskId) && (this.collectionParam === this.$route.params.collectionParam)
		},

		/**
		 * Checks whether one of the tasks descendants is currently open in the details view
		 *
		 * @param {Task} task The task to check
		 * @return {boolean} If a descendeant is open
		 */
		isDescendantOpen(task = this.task) {
			if (this.collectionParam !== this.$route.params.collectionParam) {
				return false
			}
			const taskId = this.$route.params.taskId
			const checkSubtasksOpen = function subtasksOpen(tasks) {
				for (const key in tasks) {
					const task = tasks[key]
					if (task.uri === taskId) {
						return true
					}
					if (subtasksOpen(task.subTasks)) {
						return true
					}
				}
				return false
			}
			return checkSubtasksOpen(task.subTasks)
		},

		/**
		 * Navigates to a different route, but checks if navigation is desired
		 *
		 * @param {object} $event the event that triggered navigation
		 */
		async navigate($event) {
			if (!$event.target.closest('.no-nav')
				&& (this.$route.params.taskId !== this.task.uri || this.$route.params.collectionParam !== this.collectionParam)) {
				if (!this.task.loadedCompleted) {
					this.getTasksFromCalendar({ calendar: this.task.calendar, completed: true, related: this.task.uid })
				}
				if (this.$route.params.calendarId) {
					await this.$router.push({
						name: 'calendarsTask',
						params: {
							calendarId: this.$route.params.calendarId,
							taskId: this.task.uri,
						},
					})
				} else if (this.collectionId) {
					if (this.collectionParam) {
						await this.$router.push({
							name: 'collectionsParamTask',
							params: {
								collectionId: this.collectionId,
								collectionParam: this.collectionParam,
								taskId: this.task.uri,
							},
						})
					} else {
						await this.$router.push({
							name: 'collectionsTask',
							params: {
								collectionId: this.collectionId,
								taskId: this.task.uri,
							},
						})
					}
				}
			}
		},

		async openAppSidebarTab($event, tab, edit = false) {
			// Open the AppSidebar and wait for it to be mounted
			await this.navigate($event)
			// Emit event to show the tab
			emit('tasks:open-appsidebar-tab', tab)
			if (edit) {
				emit('tasks:edit-appsidebar-notes', $event)
			}
		},

		editSummary() {
			// emit an event to edit the task summary
			emit('tasks:edit-appsidebar-summary', true)
		},

		async openSubtaskInput() {
			this.showSubtaskInput = true
			await this.$nextTick()
			this.$refs.input.$refs.inputField.$refs.input.focus()
		},

		closeSubtaskInput() {
			this.showSubtaskInput = false
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

		createMultipleTasksCancelled() {
			this.showCreateMultipleTasksModal = false
			this.multipleTasks = { numberOfTasks: 0, tasks: {} }
			this.additionalTaskProperties = {}
			this.openSubtaskInput()
		},

		createMultipleTasksSuccessful() {
			this.showCreateMultipleTasksModal = false
			this.multipleTasks = { numberOfTasks: 0, tasks: {} }
			this.additionalTaskProperties = {}
			this.newTaskName = ''
			this.openSubtaskInput()
		},

		async addTask($event) {
			$event?.stopPropagation()

			const task = await this.createTask({
				summary: this.newTaskName,
				calendar: this.task.calendar,
				related: this.task.uid,
				...this.getAdditionalTaskProperties(),
			})
			this.openNewTask(task)
			this.newTaskName = ''
			// Focus the input field again, in case we clicked on the trailing-icon-button
			this.$refs.input.$refs.inputField.$refs.input.focus()
		},

		getAdditionalTaskProperties() {
			const taskProperties = {}
			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.collectionId === 'starred') {
				taskProperties.priority = '1'
			}
			if (this.collectionId === 'today') {
				taskProperties.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
			}
			if (this.collectionId === 'current') {
				taskProperties.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}
			return taskProperties
		},
	},
}
</script>

<style lang="scss" scoped>
$red_overdue: #b3312d; // overdue dates and high importance
$yellow: #fd0; // medium importance
$blue_due: #4271a6; // due dates and low importance

// mobile breakpoint
$breakpoint-mobile: 1024px;

// Show round corners for first root task
.grouped-tasks > ol > .task-item {
	&:first-child > .task-item__body {
		border-top-left-radius: var(--border-radius-large);
		border-top-right-radius: var(--border-radius-large);
		border-top: none;
	}

	& > .task-item__body {
		@media only screen and (max-width: $breakpoint-mobile) {
			border-radius: 0 !important;
		}
	}
}

.task-item {
	position: relative;
	cursor: default;
	list-style: none outside none;

	&--closed .task-item__body .task-body__info {
		opacity: .6;
		.summary {
			text-decoration: line-through;
		}
	}

	&--deleted .task-body__info {
		opacity: .6;
	}

	&--non-started {
		.summary {
			color: var(--color-text-maxcontrast);
		}

		.task-checkbox {
			opacity: .2;
		}
	}

	&.sortable-ghost {
		filter: drop-shadow(0 0 3px var(--color-primary-element));
		z-index: 5;
	}

	&__input {
		border-top: 1px solid var(--color-border);
		overflow: hidden;
		border-radius: 0;

		:deep() .input-field {
			margin-block-start: 0 !important;

			&__main-wrapper,
			&__input {
				height: 44px !important;
			}

			&__input {
				border: none;
				border-radius: 0;
			}

			&__icon--leading {
				inset-inline-start: 0 !important;
			}

			&__input--leading-icon {
				padding-left: 44px;
			}
		}
	}

	// Show round corners if a task is the last in the (sub-)list
	&:last-child .task-item__body {
		border-bottom-left-radius: var(--border-radius-large);
		border-bottom-right-radius: var(--border-radius-large);
	}

	&:not(.task-item--subtasks-visible) .task-item__input {
		border-bottom-left-radius: var(--border-radius-large);
		border-bottom-right-radius: var(--border-radius-large);
	}

	// Don't show round corners if any of the ancestors is not the last in the (sub-)list
	&:not(:last-child) {
		.task-item__input {
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
		.task-item__body {
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
	}

	// If the subtasks container is visible, show a round corner for the task itself and
	// the next task in the list
	&.task-item--input-visible {
		& > .task-item__body {
			border-bottom-left-radius: var(--border-radius-large);
			border-bottom-right-radius: 0;
		}

		& + .task-item > .task-item__body {
			border-top-left-radius: var(--border-radius-large);
		}
	}

	&__body {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		height: 44px;
		position: relative;
		background-color: var(--color-main-background);
		border-top: 1px solid var(--color-border);

		&:hover {
			background-color: var(--color-background-hover);
		}

		&--active {
			background-color: var(--color-primary-element-light) !important;

			.tag {
				background-color: var(--color-main-background) !important;
			}
		}

		.task-body {
			&__info {
				display: flex;
				flex-grow: 1;
				cursor: pointer;
				color: var(--color-main-text);
				line-height: 16px;
				margin: 0;
				overflow: hidden;
				position: relative;
				white-space: nowrap;

				.summary {
					cursor: text;
					display: inline-flex;
					padding: 10px 10px 10px 0;
					overflow: hidden;

					span {
						line-height: 24px;
						overflow: hidden;
						text-overflow: ellipsis;

						// We need deep as it comes from a directive
						:deep(a) {
							cursor: pointer;
							text-decoration: underline;
						}
					}
				}

				.tags-list {
					display: flex;
					align-items: center;
					max-width: 50%;

					.tag {
						height: 32px;
						overflow: hidden;
						display: flex;
						padding: 0 12px;
						background-color: var(--color-primary-element-light);
						border: none;
						border-radius: 18px !important;
						margin: 4px 2px;
						align-items: center;
						cursor: pointer;

						.tag-label {
							text-overflow: ellipsis;
							overflow: hidden;
							white-space: nowrap;
							width: 100%;
							text-align: center;
							cursor: pointer;
						}
					}
				}

			}
			&__icons {
				display: flex;
				margin-left: auto;

				& > div:not(.action-item) {
					height: 44px;
					padding: 14px 7px;
					display: flex;
					flex-direction: row;
					align-items: center;
					flex-wrap: nowrap;
				}

				& > .material-design-icon {
					opacity: .5;

					&.text-box-outline-icon {
						cursor: pointer;
					}
				}

				& > div.task-status-container {
					padding: 14px 0;

					.status-display {
						margin-left: 7px;
					}
				}

				.action-item.priority {
					opacity: 1;

					&--high {
						color: $red_overdue;
					}

					&--medium {
						color: $yellow;
					}

					&--low {
						color: $blue_due;
					}
				}

				.date {
					color: $blue_due;
					font-size: 11px;
					line-height: 14px;

					&--overdue {
						color: $red_overdue;
					}

					span {
						overflow: hidden;
						text-align: right;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					&__short {
						width: 60px;

						&--completed {
							width: 110px;
						}
					}

					&__long {
						width: 105px;
						display: none;

						&--date-only {
							width: 60px;
						}

						&--completed {
							width: 150px;
						}
					}

					@media only screen and (min-width: $breakpoint-mobile) {
						&__long {
							display: inline-block;
						}

						&__short {
							display: none;
						}
					}
				}

				.calendar {
					color: var(--color-text-lighter);
					font-size: 11px;
					line-height: 14px;
					white-space: nowrap;

					&__indicator {
						position: relative;
						display: inline-block;
						margin-right: 3px;
						width: 8px;
						height: 8px;
						border: none;
						border-radius: 50%;
						cursor: pointer
					}
					&__name {
						max-width: 200px;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}
		}
	}

	&__subtasks {
		margin-left: 44px;

		@media only screen and (max-width: $breakpoint-mobile) {
			margin-left: 14px;
		}
	}
}
</style>
