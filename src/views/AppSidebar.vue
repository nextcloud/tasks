<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<NcAppSidebar v-model:active="activeTab"
		:name="summary"
		:name-editable="editingSummary"
		:linkify-name="true"
		:subname="subsummary"
		:name-tooltip="summary"
		:subname-tooltip="subsummaryTooltip"
		:empty="!task"
		@start-editing="newSummary = task.summary"
		@update:name-editable="editSummary"
		@update:name="updateSummary"
		@submit-name="saveSummary()"
		@close="closeAppSidebar()">
		<template v-if="task" #description>
			<DateTimePickerItem v-show="!readOnly || task.start"
				:date="task.startMoment"
				:value="newStartDate"
				:all-day="allDay"
				:property-string="startDateString"
				:read-only="readOnly"
				:task="task"
				@editing="(editing) => editingStart = editing"
				@set-value="setStartDate">
				<template #icon>
					<CalendarStart :size="20" />
				</template>
			</DateTimePickerItem>
			<DateTimePickerItem v-show="!readOnly || task.due"
				:date="task.dueMoment"
				:value="newDueDate"
				:all-day="allDay"
				:property-string="dueDateString"
				:read-only="readOnly"
				:task="task"
				@editing="(editing) => editingDue = editing"
				@set-value="setDueDate">
				<template #icon>
					<CalendarEnd :size="20" />
				</template>
			</DateTimePickerItem>
			<CheckboxItem v-show="showAllDayToggle"
				id="allDayToggle"
				:checked="allDay"
				:read-only="readOnly"
				:property-string="t('tasks', 'All day')"
				@set-checked="toggleAllDay(task)" />
			<CalendarPickerItem :disabled="readOnly"
				:calendar="task.calendar"
				:calendars="targetCalendars"
				@change-calendar="changeCalendar" />
		</template>

		<template v-if="!task || (task && task.deleteCountdown === null)" #secondary-actions>
			<NcActionButton v-if="!readOnly"
				@click="togglePinned(task)">
				<template v-if="task.pinned" #icon>
					<PinOff :size="20" />
				</template>
				<template v-else #icon>
					<Pin :size="20" />
				</template>
				{{ task.pinned ? t('tasks', 'Unpin') : t('tasks', 'Pin') }}
			</NcActionButton>
			<NcActionLink v-if="showInCalendar"
				:href="calendarLink"
				:close-after-click="true"
				target="_blank">
				<template #icon>
					<Calendar :size="20" />
				</template>
				{{ t('tasks', 'Show in Calendar') }}
			</NcActionLink>
			<NcActionLink v-if="deckLink"
				:href="deckLink"
				:close-after-click="true"
				target="_blank">
				<template #icon>
					<span class="material-design-icon icon-deck" />
				</template>
				{{ t('tasks', 'Show in Deck') }}
			</NcActionLink>
			<NcActionButton v-if="!readOnly"
				:close-after-click="true"
				@click="editSummary(true)">
				<template #icon>
					<Pencil :size="20" />
				</template>
				{{ t('tasks', 'Edit summary') }}
			</NcActionButton>
			<NcActionLink :href="downloadURL"
				:close-after-click="true">
				<template #icon>
					<Download :size="20" />
				</template>
				{{ t('tasks', 'Export') }}
			</NcActionLink>
			<NcActionButton v-if="!readOnly"
				@click="scheduleTaskDeletion(task)">
				<template #icon>
					<Delete :size="20" />
				</template>
				{{ t('tasks', 'Delete') }}
			</NcActionButton>
		</template>
		<template v-else #secondary-actions>
			<NcActionButton class="reactive no-nav"
				@click.prevent.stop="clearTaskDeletion(task)">
				<template #icon>
					<Undo :size="20" />
				</template>
				{{ n('tasks', 'Deleting the task in {countdown} second', 'Deleting the task in {countdown} seconds', task.deleteCountdown, { countdown: task.deleteCountdown }) }}
			</NcActionButton>
		</template>

		<template #tertiary-actions>
			<TaskCheckbox :completed="task.completed"
				:cancelled="task.status === 'CANCELLED'"
				:read-only="readOnly"
				:recurring="recurring"
				:priority-class="priorityClass"
				@toggle-completed="toggleCompleted(task)" />
		</template>

		<NcAppSidebarTab v-if="task"
			id="app-sidebar-tab-details"
			class="app-sidebar-tab"
			:name="t('tasks', 'Details')"
			:order="0">
			<template #icon>
				<InformationOutline :size="20" />
			</template>
			<div>
				<MultiselectItem v-show="!readOnly || task.class !== 'PUBLIC'"
					:value="classSelect.find( _ => _.type === task.class )"
					:options="classSelect"
					:disabled="readOnly || task.calendar.isSharedWithMe"
					:title="task.calendar.isSharedWithMe ? t('tasks', 'Selecting a classification is forbidden, because the task was shared with you.') : null"
					:placeholder="t('tasks', 'Select a classification')"
					icon="IconEye"
					@change-value="changeClass" />
				<MultiselectItem v-show="!readOnly || task.status"
					:value="statusOptions.find( _ => _.type === task.status )"
					:options="statusOptions"
					:disabled="readOnly"
					:placeholder="t('tasks', 'Select a status')"
					icon="IconPulse"
					@change-value="changeStatus" />
				<SliderItem v-show="!readOnly || task.priority"
					:value="task.priority"
					:property-string="priorityString"
					:read-only="readOnly"
					:min-value="0"
					:max-value="9"
					:color="priorityColor"
					:task="task"
					@set-value="({task, value}) => setPriority({ task, priority: value })">
					<template #icon>
						<Star :size="20" />
					</template>
				</SliderItem>
				<SliderItem v-show="!readOnly || task.complete"
					:value="task.complete"
					:property-string="completeString"
					:read-only="readOnly"
					:min-value="0"
					:max-value="100"
					:color="task.complete > 0 ? '#4271a6' : null"
					:task="task"
					@set-value="({task, value}) => setPercentComplete({ task, complete: value })">
					<template #icon>
						<Percent :size="20" />
					</template>
				</SliderItem>
				<TextItem v-show="!readOnly || task.location"
					:value="task.location"
					:property-string="task.location || t('tasks', 'Set a location')"
					:read-only="readOnly"
					:color="task.location ? '#4271a6' : null"
					:task="task"
					@set-value="({task, value}) => setLocation({ task, location: value })">
					<template #icon>
						<MapMarker :size="20" />
					</template>
				</TextItem>
				<TextItem v-show="!readOnly || task.customUrl"
					:value="task.customUrl"
					:property-string="task.customUrl || t('tasks', 'Set a URL')"
					:read-only="readOnly"
					:color="task.customUrl ? '#4271a6' : null"
					:task="task"
					@set-value="({task, value}) => setUrl({ task, url: value })">
					<template #icon>
						<Web :size="20" />
					</template>
				</TextItem>
				<TagsItem v-show="!readOnly || task.tags.length > 0"
					:options="tags"
					:tags="task.tags"
					:disabled="readOnly"
					:placeholder="t('tasks', 'Select tags')"
					icon="TagMultiple"
					@add-tag="updateTag"
					@set-tags="updateTags" />
			</div>
		</NcAppSidebarTab>
		<NcEmptyContent v-else :description="taskStatusLabel">
			<template #icon>
				<NcLoadingIcon v-if="loading" />
				<Magnify v-else />
			</template>
		</NcEmptyContent>
		<NcAppSidebarTab v-if="task && (!readOnly || task.note)"
			id="app-sidebar-tab-notes"
			class="app-sidebar-tab"
			:name="t('tasks', 'Notes')"
			:order="1">
			<template #icon>
				<TextBoxOutline :size="20" />
			</template>
			<NotesItem v-show="!readOnly || task.note"
				:value="task.note"
				:read-only="readOnly"
				:task="task"
				@set-value="({task, value}) => setNote({ task, note: value })" />
		</NcAppSidebarTab>
		<!-- <NcAppSidebarTab v-if="task"
			id="app-sidebar-tab-reminder"
			class="app-sidebar-tab"
			icon="icon-reminder"
			:name="t('tasks', 'Reminders')"
			:order="2">
			Reminders
		</NcAppSidebarTab> -->
		<NcAppSidebarTab v-if="task && (!readOnly || task.recurring)"
			id="app-sidebar-tab-repeat"
			class="app-sidebar-tab"
			:name="t('tasks', 'Repeat')"
			:order="3">
			<template #icon>
				<Repeat :size="20" />
			</template>
			<RepeatItem :value="task.recurrenceRuleObject"
				:disabled="readOnly"
				:read-only="readOnly"
				:placeholder="t('tasks', 'No recurrence')"
				:task="task"
				icon="IconRepeat"
				@set-value="({task, value}) => setRecurrence({ task, rruleObject: value })" />
		</NcAppSidebarTab>
	</NcAppSidebar>
</template>

<script>
import CheckboxItem from '../components/AppSidebar/CheckboxItem.vue'
import DateTimePickerItem from '../components/AppSidebar/DateTimePickerItem.vue'
import CalendarPickerItem from '../components/AppSidebar/CalendarPickerItem.vue'
import MultiselectItem from '../components/AppSidebar/MultiselectItem.vue'
import SliderItem from '../components/AppSidebar/SliderItem.vue'
import TagsItem from '../components/AppSidebar/TagsItem.vue'
import TextItem from '../components/AppSidebar/TextItem.vue'
import RepeatItem from '../components/AppSidebar/RepeatItem.vue'
import NotesItem from '../components/AppSidebar/NotesItem.vue'
import TaskCheckbox from '../components/TaskCheckbox.vue'
// import TaskStatusDisplay from '../components/TaskStatusDisplay'
import Task from '../models/task.js'
import { startDateString, dueDateString } from '../utils/dateStrings.js'

import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcActionLink from '@nextcloud/vue/dist/Components/NcActionLink.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcAppSidebar from '@nextcloud/vue/dist/Components/NcAppSidebar.js'
import NcAppSidebarTab from '@nextcloud/vue/dist/Components/NcAppSidebarTab.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import { generateUrl } from '@nextcloud/router'

import Calendar from 'vue-material-design-icons/Calendar.vue'
import CalendarEnd from 'vue-material-design-icons/CalendarEnd.vue'
import CalendarStart from 'vue-material-design-icons/CalendarStart.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Percent from 'vue-material-design-icons/Percent.vue'
import Pin from 'vue-material-design-icons/Pin.vue'
import PinOff from 'vue-material-design-icons/PinOff.vue'
import Repeat from 'vue-material-design-icons/Repeat.vue'
import Star from 'vue-material-design-icons/Star.vue'
import TextBoxOutline from 'vue-material-design-icons/TextBoxOutline.vue'
import Undo from 'vue-material-design-icons/Undo.vue'
import Web from 'vue-material-design-icons/Web.vue'

import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		NcAppSidebar,
		NcAppSidebarTab,
		NcActionButton,
		NcActionLink,
		NcLoadingIcon,
		CheckboxItem,
		DateTimePickerItem,
		Calendar,
		CalendarEnd,
		CalendarStart,
		Delete,
		Download,
		InformationOutline,
		Magnify,
		MapMarker,
		Pencil,
		Percent,
		Pin,
		PinOff,
		Repeat,
		Star,
		TextBoxOutline,
		Undo,
		Web,
		NcEmptyContent,
		MultiselectItem,
		SliderItem,
		TagsItem,
		TextItem,
		RepeatItem,
		CalendarPickerItem,
		NotesItem,
		TaskCheckbox,
		// TaskStatusDisplay,
	},
	/**
	 * Before we navigate to a new task, we save possible edits to the task summary.
	 *
	 * @param {object} to The target Route Object being navigated to.
	 * @param {object} from The current route being navigated away from.
	 * @param {Function} next This function must be called to resolve the hook.
	 */
	beforeRouteUpdate(to, from, next) {
		this.saveSummary()
		next()
	},
	props: {
		active: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			editingSummary: false,
			editingStart: false,
			editingDue: false,
			loading: false,
			classSelect: [
				{
					displayName: t('tasks', 'When shared show full event'),
					type: 'PUBLIC',
					icon: 'IconEye',
				},
				{
					displayName: t('tasks', 'When shared show only busy'),
					type: 'CONFIDENTIAL',
					icon: 'IconCalendarRemove',
					optionClass: 'active',
				},
				{
					displayName: t('tasks', 'When shared hide this event'),
					type: 'PRIVATE',
					icon: 'IconEyeOff',
					optionClass: 'active',
				},
			],
			newSummary: '',
			summarySaved: true,
			activeTab: this.active,
		}
	},
	computed: {
		calendar() {
			return this.getCalendarByRoute(this.$route)
		},
		task() {
			return this.getTaskByRoute(this.$route)
		},
		summary() {
			return this.task ? this.task.summary : ''
		},
		subsummary() {
			if (this.completedString) {
				return this.completedString
			}
			if (this.modifiedString) {
				return this.modifiedString
			}
			if (this.createdString) {
				return this.createdString
			}
			return ''
		},
		subsummaryTooltip() {
			const tooltip = []
			if (this.completedString) {
				tooltip.push(this.completedString)
			}
			if (this.modifiedString) {
				tooltip.push(this.modifiedString)
			}
			if (this.createdString) {
				tooltip.push(this.createdString)
			}
			return tooltip.join('\n')
		},
		completedString() {
			if (this.task?.completed && this.task.completedDateMoment.isValid()) {
				return this.task.completedDateMoment.calendar(null, {
					lastDay: t('tasks', '[Completed yesterday at] LT'),
					sameDay: t('tasks', '[Completed today at] LT'),
					nextDay: t('tasks', '[Completed] L'),
					lastWeek: t('tasks', '[Completed last] dddd [at] LT'),
					nextWeek: t('tasks', '[Completed] dddd [at] LT'),
					sameElse: t('tasks', '[Completed] L'),
				})
			}
			return ''
		},
		modifiedString() {
			if (this.task?.modifiedMoment.isValid()) {
				return this.task.modifiedMoment.calendar(null, {
					lastDay: t('tasks', '[Last modified yesterday at] LT'),
					sameDay: t('tasks', '[Last modified today at] LT'),
					nextDay: t('tasks', '[Last modified] L'),
					lastWeek: t('tasks', '[Last modified last] dddd [at] LT'),
					nextWeek: t('tasks', '[Last modified] dddd [at] LT'),
					sameElse: t('tasks', '[Last modified] L'),
				})
			}
			return ''
		},
		createdString() {
			if (this.task?.createdMoment.isValid()) {
				return this.task.createdMoment.calendar(null, {
					lastDay: t('tasks', '[Created yesterday at] LT'),
					sameDay: t('tasks', '[Created today at] LT'),
					nextDay: t('tasks', '[Created] L'),
					lastWeek: t('tasks', '[Created last] dddd [at] LT'),
					nextWeek: t('tasks', '[Created] dddd [at] LT'),
					sameElse: t('tasks', '[Created] L'),
				})
			}
			return ''
		},
		statusOptions() {
			const statusOptions = [
				{
					displayName: t('tasks', 'Needs action'),
					type: 'NEEDS-ACTION',
					icon: 'IconAlertBoxOutline',
					optionClass: 'active',
				},
				{
					displayName: t('tasks', 'Completed'),
					type: 'COMPLETED',
					icon: 'IconCheck',
					optionClass: 'active',
				},
				{
					displayName: t('tasks', 'In process'),
					type: 'IN-PROCESS',
					icon: 'IconTrendingUp',
					optionClass: 'active',
				},
				{
					displayName: t('tasks', 'Canceled'),
					type: 'CANCELLED',
					icon: 'IconCancel',
					optionClass: 'active',
				},
			]
			if (this.task.status) {
				return statusOptions.concat([{
					displayName: t('tasks', 'Clear status'),
					type: null,
					icon: 'IconDelete',
					optionClass: 'center',
				}])
			}
			return statusOptions
		},
		/**
		 * Returns the download url as a string or null if event is loading or does not exist on the server (yet)
		 *
		 * @return {string|null}
		 */
		downloadURL() {
			if (!this.task) {
				return null
			}
			return this.task?.url + '?export'
		},
		/**
		 * Initializes the start date of a task
		 *
		 * @return {Date} The start date moment
		 */
		newStartDate() {
			const start = this.task.startMoment
			if (start.isValid()) {
				return start.toDate()
			}
			const due = this.task.dueMoment
			let reference = moment().add(1, 'h')
			if (due.isBefore(reference)) {
				reference = due.subtract(1, 'm')
			}
			reference.startOf(this.allDay ? 'day' : 'hour')
			return reference.toDate()
		},

		/**
		 * Initializes the due date of a task
		 *
		 * @return {Date} The due date moment
		 */
		newDueDate() {
			const due = this.task.dueMoment
			if (due.isValid()) {
				return due.toDate()
			}
			const start = this.task.startMoment
			const reference = start.isAfter() ? start : moment()
			if (this.allDay) {
				reference.startOf('day').add(1, 'd')
			} else {
				reference.startOf('hour').add(1, 'h')
			}
			return reference.toDate()
		},
		taskStatusLabel() {
			return this.loading ? t('tasks', 'Loading task from server.') : t('tasks', 'Task not found!')
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
		/**
		 * Whether this is a recurring task.
		 *
		 * @return {boolean} Is the task recurring
		 */
		recurring() {
			return this.task.recurring
		},
		/**
		 * Whether the dates of a task are all-day
		 * When no dates are set, we consider the last used value.
		 *
		 * @return {boolean} Are the dates all-day
		 */
		allDay() {
			if (this.task.startMoment.isValid() || this.task.dueMoment.isValid()) {
				return !!this.task.allDay
			} else {
				return !!this.$store.state.settings.settings.allDay
			}
		},
		showInCalendar() {
			// Only tasks with a due date show up in the calendar
			return !!this.showTaskInCalendar && this.task.dueMoment.isValid()
		},
		calendarLink() {
			return generateUrl(`apps/calendar/${this.calendarView}/${this.task.dueMoment.format('YYYY-MM-DD')}`)
		},
		deckLink() {
			const deckAppPrefix = 'app-generated--deck--board-'
			if (this.task.calendar.id.startsWith(deckAppPrefix)) {
				const board = this.task.calendar.id.slice(deckAppPrefix.length)
				if (this.task.uri.startsWith('card')) {
					const card = this.task.uri.slice('card-'.length).replace('.ics', '')
					return generateUrl(`apps/deck/#/board/${board}/card/${card}`)
				} else {
					return generateUrl(`apps/deck/#/board/${board}`)
				}
			}
			return null
		},
		startDateString() {
			if (this.task.startMoment.isValid()) {
				return startDateString(this.task)
			} else {
				return t('tasks', 'Set start date')
			}
		},
		dueDateString() {
			if (this.task.dueMoment.isValid()) {
				return dueDateString(this.task)
			} else {
				return t('tasks', 'Set due date')
			}
		},
		showAllDayToggle() {
			return !this.readOnly && (this.task.due || this.task.start || this.editingStart || this.editingDue)
		},
		priorityColor() {
			if (+this.task.priority > 5) {
				return '#4271a6'
			}
			if (+this.task.priority === 5) {
				return '#fd0'
			}
			if (+this.task.priority > 0) {
				return '#b3312d'
			}
			return null
		},
		priorityString() {
			if (+this.task.priority > 5) {
				return t('tasks', 'Priority {priority}: low', { priority: this.task.priority })
			}
			if (+this.task.priority === 5) {
				return t('tasks', 'Priority {priority}: medium', { priority: this.task.priority })
			}
			if (+this.task.priority > 0) {
				return t('tasks', 'Priority {priority}: high', { priority: this.task.priority })
			}
			return t('tasks', 'No priority assigned')
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
		completeString() {
			return t('tasks', '{percent} % completed', { percent: this.task.complete })
		},
		targetCalendars() {
			let calendars = this.writableCalendars
			// Tasks with an access class other than PUBLIC cannot be moved
			// into calendars shared with me
			if (this.task.class !== 'PUBLIC') {
				calendars = calendars.filter(calendar => !calendar.isSharedWithMe)
			}
			return calendars
		},
		...mapGetters({
			writableCalendars: 'getSortedWritableCalendars',
			getTaskByRoute: 'getTaskByRoute',
			getCalendarByRoute: 'getCalendarByRoute',
			calendars: 'getSortedCalendars',
			tags: 'tags',
			recurrence: 'recurrence',
			showTaskInCalendar: 'showTaskInCalendar',
			calendarView: 'calendarView',
		}),
	},

	watch: {
		$route: 'loadTask',
		calendars: 'loadTask',
	},
	mounted() {
		subscribe('tasks:close-appsidebar', this.closeAppSidebar)
		subscribe('tasks:task:deleted', this.handleTaskDeletion)
		subscribe('tasks:open-appsidebar-tab', this.openAppSidebarTab)
		subscribe('tasks:edit-appsidebar-summary', this.editSummary)
	},
	beforeUnmount() {
		unsubscribe('tasks:close-appsidebar', this.closeAppSidebar)
		unsubscribe('tasks:task:deleted', this.handleTaskDeletion)
		unsubscribe('tasks:open-appsidebar-tab', this.openAppSidebarTab)
		unsubscribe('tasks:edit-appsidebar-summary', this.editSummary)
	},
	created() {
		this.loadTask()
	},
	methods: {
		t,
		n,

		...mapActions([
			'scheduleTaskDeletion',
			'clearTaskDeletion',
			'toggleCompleted',
			'toggleStarred',
			'setSummary',
			'setNote',
			'setPriority',
			'setLocation',
			'setRecurrence',
			'setUrl',
			'setPercentComplete',
			'setTags',
			'addTag',
			'setDue',
			'setStart',
			'toggleAllDay',
			'moveTask',
			'setClassification',
			'setStatus',
			'getTaskByUri',
			'togglePinned',
		]),

		async loadTask() {
			if (this.task === undefined || this.task === null) {
				// If the taskUri is undefined, we cannot search
				const taskUri = this.$route.params.taskId
				if (!taskUri) return
				const calendars = this.calendar ? [this.calendar] : this.calendars
				for (const calendar of calendars) {
					this.loading = true
					try {
						const task = await this.getTaskByUri({ calendar, taskUri })
						// If we found the task, we don't need to query the other calendars.
						if (task) {
							break
						}
					} catch {
						console.debug('Task ' + taskUri + ' not found in calendar ' + calendar.displayName + '.')
					}
				}
				this.loading = false
			}
		},

		handleTaskDeletion({ taskId }) {
			// Close the sidebar if the taskId matches
			if (taskId === this.$route.params.taskId) {
				this.closeAppSidebar()
			}
		},

		closeAppSidebar() {
			this.saveSummary()
			if (this.$route.params.calendarId) {
				this.$router.push({ name: 'calendars', params: { calendarId: this.$route.params.calendarId } })
			} else {
				this.$router.push({ name: 'collections', params: { collectionId: this.$route.params.collectionId } })
			}
		},

		openAppSidebarTab(tab) {
			this.activeTab = tab
		},

		editSummary(editing) {
			if (this.readOnly) {
				return
			}
			if (!this.editingSummary && editing) {
				this.newSummary = this.task.summary
			}
			this.editingSummary = editing
		},

		updateSummary(summary) {
			this.newSummary = summary
			this.summarySaved = false
		},

		saveSummary(task = this.task) {
			if (!this.summarySaved && this.newSummary !== task.summary) {
				this.setSummary({ task, summary: this.newSummary })
			}
			this.summarySaved = true
		},

		/**
		 * Sets the start date to the given Date
		 * or to null
		 *
		 * @param {object} context The data object
		 * @param {Task} context.task The task for which to set the date
		 * @param {Date} context.value The new start date
		 */
		setStartDate({ task, value: start }) {
			if (start) {
				start = moment(start)
			}
			if (this.task.startMoment.isSame(start)) {
				return
			}
			this.setStart({ task, start, allDay: this.allDay })
		},

		/**
		 * Sets the due date to the given Date
		 * or to null
		 *
		 * @param {object} context The data object
		 * @param {Task} context.task The task for which to set the date
		 * @param {Date} context.value The new due date
		 */
		setDueDate({ task, value: due }) {
			if (due) {
				due = moment(due)
			}
			if (this.task.dueMoment.isSame(due)) {
				return
			}
			this.setDue({ task, due, allDay: this.allDay })
		},

		changeClass(classification) {
			this.setClassification({ task: this.task, classification: classification.type })
		},

		changeStatus(status) {
			this.setStatus({ task: this.task, status: status.type })
		},

		/**
		 * Sets the tags of a task
		 *
		 * @param {Array} tags The new tags
		 */
		updateTags(tags) {
			this.setTags({ task: this.task, tags })
		},

		/**
		 * Adds a tag to the list of tags
		 *
		 * @param {string} tag The name of the tag to add
		 */
		updateTag(tag) {
			this.addTag({ task: this.task, tag })
		},

		async changeCalendar(calendar) {
			const task = await this.moveTask({ task: this.task, calendar })
			// If we are in a calendar view, we have to navigate to the new calendar.
			if (this.$route.params.calendarId) {
				this.$router.push({ name: 'calendarsTask', params: { calendarId: task.calendar.id, taskId: task.uri } })
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.app-sidebar {
	:deep() {
		.app-sidebar {
			&__tab {
				padding: 0 !important;
				width: 100%;
			}

			&-header__description {
				flex-wrap: wrap;
				margin: 0 !important;
			}

			&-tabs {
				min-height: 160px !important;

				&__content {
					display: flex;
				}
			}
		}
	}
}
</style>
