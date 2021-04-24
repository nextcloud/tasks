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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div class="content-wrapper">
		<div v-if="task"
			:class="{'disabled': readOnly}"
			class="flex-container">
			<div :class="{'editing': edit=='summary'}" class="title">
				<span class="detail-checkbox">
					<input :id="'detailsToggleCompleted_' + task.uid"
						type="checkbox"
						class="checkbox"
						name="detailsToggleCompleted"
						:class="{'disabled': readOnly}"
						:checked="task.completed"
						:aria-checked="task.completed"
						:disabled="readOnly"
						:aria-label="$t('tasks', 'Task is completed')"
						@click="toggleCompleted(task)">
					<label :class="[checkboxColor]" :for="'detailsToggleCompleted_' + task.uid" />
				</span>
				<div v-click-outside="() => finishEditing('summary')" class="title-wrapper">
					<div v-linkify="task.summary"
						:class="{'strike-through': task.completed}"
						class="title-text"
						@click="editProperty('summary', $event)" />
					<div class="expandable-container">
						<div class="expandingArea active">
							<pre><span>{{ tmpTask.summary }}</span><br></pre>
							<textarea id="summaryInput"
								v-model="tmpTask.summary"
								maxlength="200"
								@keyup.27="cancelEditing('summary')"
								@keydown.enter.prevent="finishEditing('summary')" />
						</div>
					</div>
				</div>
				<TaskStatusDisplay :task="task" />
				<button class="reactive inline" @click="togglePinned(task)">
					<span :class="[{'disabled': readOnly}, iconPinned]" class="icon" />
				</button>
				<button class="reactive inline" @click="toggleStarred(task)">
					<span :class="[{'disabled': readOnly}, iconStar]"
						class="icon" />
				</button>
			</div>
			<div class="body">
				<ul class="sections">
					<li v-show="!readOnly || task.start"
						:class="{'date': task.startMoment.isValid(), 'editing': edit=='start', 'high': overdue(task.startMoment)}"
						class="section detail-start">
						<div v-click-outside="($event) => finishEditing('start', $event)"
							class="section-content"
							@click="editProperty('start', $event)">
							<span class="section-icon">
								<span :class="[startDateIcon(task.startMoment)]"
									class="icon" />
							</span>
							<span class="section-title">
								{{ startDateString }}
							</span>
							<div v-if="edit=='start'" class="section-edit">
								<DatetimePicker :value="tmpTask.start.toDate()"
									:lang="lang"
									:format="dateFormat"
									:clearable="false"
									type="date"
									:placeholder="$t('tasks', 'Set start date')"
									class="date"
									@change="setStartDate" />
								<DatetimePicker v-if="!allDay"
									:value="tmpTask.start.toDate()"
									:lang="lang"
									:format="timeFormat"
									:clearable="false"
									:time-picker-options="timePickerOptions"
									type="time"
									:placeholder="$t('tasks', 'Set start time')"
									class="time"
									@change="setStartTime" />
							</div>
						</div>
						<div class="section-utils">
							<button class="inline reactive">
								<span class="icon sprt-color sprt-checkmark-color" />
							</button>
							<button class="delete inline reactive" @click="setProperty('start', null)">
								<span class="icon icon-sprt-bw sprt-trash" />
							</button>
						</div>
					</li>
					<li v-show="!readOnly || task.due"
						:class="{'date': task.dueMoment.isValid(), 'editing': edit=='due', 'high': overdue(task.dueMoment)}"
						class="section detail-date">
						<div v-click-outside="($event) => finishEditing('due', $event)"
							class="section-content"
							@click="editProperty('due', $event)">
							<span class="section-icon">
								<span :class="[dueDateIcon(task.dueMoment)]"
									class="icon" />
							</span>
							<span class="section-title">
								{{ dueDateString }}
							</span>
							<div v-if="edit=='due'" class="section-edit">
								<DatetimePicker :value="tmpTask.due.toDate()"
									:lang="lang"
									:format="dateFormat"
									:clearable="false"
									type="date"
									:placeholder="$t('tasks', 'Set due date')"
									class="date"
									@change="setDueDate" />
								<DatetimePicker v-if="!allDay"
									:value="tmpTask.due.toDate()"
									:lang="lang"
									:format="timeFormat"
									:clearable="false"
									:time-picker-options="timePickerOptions"
									type="time"
									:placeholder="$t('tasks', 'Set due time')"
									class="time"
									@change="setDueTime" />
							</div>
						</div>
						<div class="section-utils">
							<button class="inline reactive">
								<span class="icon sprt-color sprt-checkmark-color" />
							</button>
							<button class="delete inline reactive" @click="setProperty('due', null)">
								<span class="icon icon-sprt-bw sprt-trash" />
							</button>
						</div>
					</li>
					<li v-show="isAllDayPossible"
						class="section detail-all-day reactive">
						<div class="section-content">
							<input id="isAllDayPossible"
								type="checkbox"
								class="checkbox"
								name="isAllDayPossible"
								:class="{'disabled': readOnly}"
								:aria-checked="allDay"
								:checked="allDay"
								:disabled="readOnly"
								@click="toggleAllDay(task)">
							<label for="isAllDayPossible">
								<span>{{ $t('tasks', 'All day') }}</span>
							</label>
						</div>
					</li>
					<li class="section detail-calendar reactive">
						<div v-click-outside="() => finishEditing('calendar')"
							class="section-content"
							@click="editProperty('calendar')">
							<span class="section-icon">
								<span :style="{'background-color': task.calendar.color}" class="calendar-indicator" />
							</span>
							<div class="detail-multiselect-container blue">
								<Multiselect
									:value="task.calendar"
									:multiple="false"
									:allow-empty="false"
									:disabled="readOnly"
									track-by="id"
									:placeholder="$t('tasks', 'Select a calendar')"
									label="displayName"
									:options="targetCalendars"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeCalendar"
									@tag="changeCalendar" />
							</div>
						</div>
					</li>
					<li class="section detail-class reactive">
						<div v-click-outside="() => finishEditing('class')"
							class="section-content"
							@click="editProperty('class')">
							<span class="section-icon">
								<span class="icon sprt-color sprt-privacy" />
							</span>
							<div class="detail-multiselect-container blue">
								<Multiselect
									:value="classSelect.find( _ => _.type === task.class )"
									:multiple="false"
									:allow-empty="false"
									:disabled="readOnly || task.calendar.isSharedWithMe"
									track-by="type"
									:placeholder="$t('tasks', 'Select a classification')"
									label="displayName"
									:options="classSelect"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeClass"
									@tag="changeClass" />
							</div>
						</div>
					</li>
					<li v-show="!readOnly || task.status"
						class="section detail-class reactive">
						<div v-click-outside="() => finishEditing('status')"
							class="section-content"
							@click="editProperty('status')">
							<span class="section-icon">
								<span :class="[iconStatus]" class="icon" />
							</span>
							<div class="detail-multiselect-container blue">
								<Multiselect
									:value="statusSelect.find( _ => _.type === task.status )"
									:multiple="false"
									:allow-empty="false"
									:disabled="readOnly"
									track-by="type"
									:placeholder="$t('tasks', 'Select a status')"
									label="displayName"
									:options="statusSelect"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeStatus"
									@tag="changeStatus" />
							</div>
						</div>
					</li>
					<li v-show="!readOnly || task.priority"
						:class="[{'editing': edit=='priority', 'date': task.priority>0}, priorityClass]"
						class="section detail-priority">
						<div v-click-outside="() => finishEditing('priority')"
							class="section-content"
							@click="editProperty('priority')">
							<span class="section-icon">
								<span :class="[iconStar]" class="icon" />
							</span>
							<span class="section-title">
								{{ priorityString }}
							</span>
							<div class="section-edit">
								<input v-model="tmpTask.priority"
									class="priority-input"
									type="number"
									min="0"
									max="9"
									@keyup.27="cancelEditing('priority')"
									@keydown.enter.prevent="finishEditing('priority')">
								<input v-model="tmpTask.priority"
									type="range"
									min="0"
									max="9"
									step="1">
							</div>
						</div>
						<div class="section-utils">
							<button class="inline reactive">
								<span class="icon sprt-color sprt-checkmark-color" />
							</button>
							<button class="delete inline reactive" @click="setProperty('priority', 0)">
								<span class="icon icon-sprt-bw sprt-trash" />
							</button>
						</div>
					</li>
					<li v-show="!readOnly || task.complete"
						:class="{'editing': edit=='complete', 'date': task.complete>0}"
						class="section detail-complete">
						<div v-click-outside="() => finishEditing('complete')"
							class="section-content"
							@click="editProperty('complete')">
							<span class="section-icon">
								<span :class="[iconPercent]" class="icon" />
							</span>
							<span class="section-title">
								{{ completeString }}
							</span>
							<div class="section-edit">
								<input v-model="tmpTask.complete"
									class="percent-input"
									type="number"
									min="0"
									max="100"
									@keyup.27="cancelEditing('complete')"
									@keydown.enter.prevent="finishEditing('complete')">
								<input v-model="tmpTask.complete"
									type="range"
									min="0"
									max="100"
									step="1">
							</div>
						</div>
						<div class="section-utils">
							<button class="inline reactive">
								<span class="icon sprt-color sprt-checkmark-color" />
							</button>
							<button class="delete inline reactive" @click="setProperty('complete', 0)">
								<span class="icon icon-sprt-bw sprt-trash" />
							</button>
						</div>
					</li>
					<li v-show="!readOnly || task.tags.length>0" :class="{'active': task.tags.length>0}" class="section">
						<div class="section-content">
							<span class="section-icon">
								<span :class="[iconTags]" class="icon" />
							</span>
							<div class="detail-multiselect-container">
								<Multiselect v-if="task.tags"
									v-model="task.tags"
									:multiple="true"
									:searchable="true"
									:disabled="readOnly"
									:options="tags"
									:placeholder="$t('tasks', 'Select tags')"
									:taggable="true"
									:tag-placeholder="$t('tasks', 'Add this as a new tag')"
									:close-on-select="false"
									class="multiselect-vue"
									@input="updateTags"
									@tag="updateTag" />
							</div>
						</div>
					</li>
					<li v-show="!readOnly || task.note" class="section detail-note">
						<div class="section-content note">
							<div v-click-outside="() => finishEditing('note')"
								class="note-body selectable"
								@click="editProperty('note', $event)">
								<div :class="{'editing': edit=='note'}" class="content-fakeable">
									<Markdown id="markdown"
										:source="task.note"
										class="display-view" />
									<div class="edit-view">
										<div class="expandingArea active">
											<pre><span>{{ tmpTask.note }}</span><br><br></pre>
											<textarea id="noteInput" v-model="tmpTask.note" @change="setProperty('note', tmpTask.note)" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</li>
				</ul>
			</div>
			<div class="footer">
				<button :style="{visibility: readOnly ? 'hidden' : 'visible'}"
					class="close-all reactive inline"
					@click="removeTask">
					<span class="icon icon-sprt-bw sprt-trash" />
				</button>
				<span v-tooltip="{
						content: taskInfo,
						html: true,
					}"
					class="info">
					<span class="icon icon-info" />
				</span>
				<button class="close-all reactive inline" @click="closeDetails">
					<span class="icon icon-sprt-bw sprt-hide" />
				</button>
			</div>
		</div>
		<div v-else class="notice">
			<span v-if="loading">{{ $t('tasks', 'Loading task from server.') }}</span>
			<span v-else>{{ $t('tasks', 'Task not found!') }}</span>
		</div>
	</div>
</template>

<script>
import { overdue } from '../store/storeHelper.js'
import Markdown from '../components/Markdown.vue'
import TaskStatusDisplay from '../components/TaskStatusDisplay.vue'
import { linkify } from '../directives/linkify.js'

import moment from '@nextcloud/moment'
import DatetimePicker from '@nextcloud/vue/dist/Components/DatetimePicker'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'

import ClickOutside from 'v-click-outside'
import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		DatetimePicker,
		Multiselect,
		Markdown,
		TaskStatusDisplay,
	},
	directives: {
		clickOutside: ClickOutside.directive,
		linkify,
	},
	filters: {
	},

	/**
	 * Before we close the details view, we save possible edits.
	 *
	 * @param {Route} to The target Route Object being navigated to.
	 * @param {Route} from The current route being navigated away from.
	 * @param {Function} next This function must be called to resolve the hook.
	 */
	beforeRouteLeave(to, from, next) {
		this.finishEditing(this.edit)
		next()
	},

	/**
	 * Before we navigate to a new task, we save possible edits.
	 *
	 * @param {Route} to The target Route Object being navigated to.
	 * @param {Route} from The current route being navigated away from.
	 * @param {Function} next This function must be called to resolve the hook.
	 */
	beforeRouteUpdate(to, from, next) {
		this.finishEditing(this.edit)
		next()
	},
	data() {
		return {
			loading: false,
			edit: '',
			tmpTask: {
				summary: '',
				start: '',
				due: '',
				priority: '',
				complete: '',
				note: '',
			},
			lang: {
				formatLocale: {
					firstDayOfWeek: window.firstDay,
				},
				days: window.dayNamesShort, // provided by nextcloud
				months: window.monthNamesShort, // provided by nextcloud
			},
			dateFormat: moment.localeData().longDateFormat('L'),
			timeFormat: moment.localeData().longDateFormat('LT'),
			timePickerOptions: {
				start: '00:00',
				step: '00:30',
				end: '23:30',
			},
			classSelect: [
				{ displayName: this.$t('tasks', 'When shared show full event'), type: 'PUBLIC' },
				{ displayName: this.$t('tasks', 'When shared show only busy'), type: 'CONFIDENTIAL' },
				{ displayName: this.$t('tasks', 'When shared hide this event'), type: 'PRIVATE' },
			],
			statusSelect: [
				{ displayName: this.$t('tasks', 'Needs action'), type: 'NEEDS-ACTION' },
				{ displayName: this.$t('tasks', 'Completed'), type: 'COMPLETED' },
				{ displayName: this.$t('tasks', 'In process'), type: 'IN-PROCESS' },
				{ displayName: this.$t('tasks', 'Canceled'), type: 'CANCELLED' },
			],
		}
	},
	computed: {
		/**
		 * Whether we treat the task as read-only.
		 * We also treat tasks in shared calendars with an access class other than 'PUBLIC'
		 * as read-only.
		 *
		 * @returns {Boolean} Is the task read-only
		 */
		readOnly() {
			return this.task.calendar.readOnly || (this.task.calendar.isSharedWithMe && this.task.class !== 'PUBLIC')
		},
		/**
		 * Whether the dates of a task are all-day
		 * When no dates are set, we consider the last used value.
		 *
		 * @returns {Boolean} Are the dates all-day
		 */
		allDay() {
			if (this.task.startMoment.isValid() || this.task.dueMoment.isValid()) {
				return this.task.allDay
			} else {
				return this.$store.state.settings.settings.allDay
			}
		},
		startDateString() {
			const $t = this.$t
			if (this.task.startMoment.isValid()) {
				if (this.allDay) {
					return this.task.startMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: this.$t('tasks', '[Starts today]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: this.$t('tasks', '[Starts tomorrow]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
						nextWeek: this.$t('tasks', '[Starts on] LL'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						lastDay: this.$t('tasks', '[Started yesterday]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
						lastWeek: this.$t('tasks', '[Started on] LL'),
						sameElse(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
								return $t('tasks', '[Started on] LL')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
								return $t('tasks', '[Starts on] LL')
							}
						},
					})
				} else {
					return this.task.startMoment.calendar(null, {
						sameDay(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
								return $t('tasks', '[Started today at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
								return $t('tasks', '[Starts today at] LT')
							}
						},
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
						nextDay: this.$t('tasks', '[Starts tomorrow at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
						nextWeek: this.$t('tasks', '[Starts on] LL [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
						lastDay: this.$t('tasks', '[Started yesterday at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
						lastWeek: this.$t('tasks', '[Started on] LL [at] LT'),
						sameElse(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Started on] LL [at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Starts on] LL [at] LT')
							}
						},
					})
				}
			} else {
				return this.$t('tasks', 'Set start date')
			}
		},
		dueDateString() {
			const $t = this.$t
			if (this.task.dueMoment.isValid()) {
				if (this.allDay) {
					return this.task.dueMoment.calendar(null, {
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						sameDay: this.$t('tasks', '[Due today]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
						nextDay: this.$t('tasks', '[Due tomorrow]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string and keep the brackets and the "LL".
						nextWeek: this.$t('tasks', '[Due on] LL'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets.
						lastDay: this.$t('tasks', '[Was due yesterday]'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, but keep the brackets and the "LL".
						lastWeek: this.$t('tasks', '[Was due on] LL'),
						sameElse(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
								return $t('tasks', '[Was due on] LL')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
								return $t('tasks', '[Due on] LL')
							}
						},
					})
				} else {
					return this.task.dueMoment.calendar(null, {
						sameDay(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
								return $t('tasks', '[Was due today at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
								return $t('tasks', '[Due today at] LT')
							}
						},
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
						nextDay: this.$t('tasks', '[Due tomorrow at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
						nextWeek: this.$t('tasks', '[Due on] LL [at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
						lastDay: this.$t('tasks', '[Was due yesterday at] LT'),
						// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
						lastWeek: this.$t('tasks', '[Was due on] LL [at] LT'),
						sameElse(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Was due on] LL [at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Due on] LL [at] LT')
							}
						},
					})
				}
			} else {
				return this.$t('tasks', 'Set due date')
			}
		},
		taskInfo() {
			return this.$t('tasks', 'Last modified {date}', { date: this.task.modifiedMoment.calendar() })
				+ '<br />' + this.$t('tasks', 'Created {date}', { date: this.task.createdMoment.calendar() })
				+ (this.task.completed ? ('<br />' + this.$t('tasks', 'Completed {date}', { date: this.task.completedDateMoment.calendar() })) : '')
		},
		isAllDayPossible() {
			return !this.readOnly && (this.task.due || this.task.start || ['start', 'due'].includes(this.edit))
		},
		priorityClass() {
			if (+this.task.priority > 5) {
				return 'low'
			} else if (+this.task.priority === 5) {
				return 'medium'
			} else if (+this.task.priority > 0 && +this.task.priority < 5) {
				return 'high'
			} else {
				return ''
			}
		},
		priorityString() {
			if (+this.task.priority === 0) {
				return this.$t('tasks', 'No priority assigned')
			} else if (+this.task.priority > 0 && +this.task.priority < 5) {
				return this.$t('tasks', 'Priority {priority}: high', { priority: this.task.priority })
			} else if (+this.task.priority === 5) {
				return this.$t('tasks', 'Priority {priority}: medium', { priority: this.task.priority })
			} else if (+this.task.priority > 5 && +this.task.priority < 10) {
				return this.$t('tasks', 'Priority {priority}: low', { priority: this.task.priority })
			}
			return ''
		},
		checkboxColor() {
			const priority = this.priorityClass
			return priority ? `priority-${priority}` : ''
		},
		completeString() {
			return this.$t('tasks', '{percent} % completed', { percent: this.task.complete })
		},
		iconStar() {
			if (+this.task.priority) {
				return 'sprt-color sprt-task-star-' + this.priorityClass
			} else {
				return 'icon-sprt-bw sprt-task-star'
			}
		},
		iconPinned() {
			if (this.task.pinned) {
				return 'icon-sprt-bw sprt-pinned'
			} else {
				return 'icon-sprt-bw sprt-pinned-off'
			}
		},
		iconPercent() {
			if (this.task.complete > 0) {
				return 'sprt-color sprt-percent-active'
			} else {
				return 'icon-sprt-bw sprt-percent'
			}
		},
		iconTags() {
			if (this.task.tags.length > 0) {
				return 'sprt-color sprt-tag-active'
			} else {
				return 'icon-sprt-bw sprt-tag'
			}
		},
		iconStatus() {
			if (this.task.status) {
				return 'sprt-color sprt-status'
			} else {
				return 'icon-sprt-bw sprt-current'
			}
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
			task: 'getTaskByRoute',
			calendar: 'getCalendarByRoute',
			calendars: 'getSortedCalendars',
			tags: 'tags',
		}),
	},

	watch: {
		$route: 'loadTask',
		calendars: 'loadTask',
	},

	created() {
		this.loadTask()
	},
	methods: {
		...mapActions([
			'deleteTask',
			'toggleCompleted',
			'toggleStarred',
			'setSummary',
			'setNote',
			'setPriority',
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
				const calendars = this.calendar ? [this.calendar] : this.calendars
				for (const calendar of calendars) {
					this.loading = true
					try {
						const task = await this.getTaskByUri({ calendar, taskUri: this.$route.params.taskId })
						// If we found the task, we don't need to query the other calendars.
						if (task) {
							break
						}
					} catch {
						console.debug('Task ' + this.$route.params.taskId + ' not found in calendar ' + calendar.displayName + '.')
					}
				}
				this.loading = false
			}
		},

		removeTask() {
			this.deleteTask({ task: this.task, dav: true })
			this.closeDetails()
		},

		closeDetails() {
			if (this.$route.params.calendarId) {
				this.$router.push({ name: 'calendars', params: { calendarId: this.$route.params.calendarId } })
			} else {
				this.$router.push({ name: 'collections', params: { collectionId: this.$route.params.collectionId } })
			}
		},

		startDateIcon(date) {
			if (date.isValid()) {
				return `sprt-color sprt-startdate-${overdue(date) ? 'overdue' : 'due'}`
			} else {
				return 'icon-sprt-bw sprt-startdate'
			}
		},

		dueDateIcon(date) {
			if (date.isValid()) {
				return `sprt-color sprt-duedate-${overdue(date) ? 'overdue' : 'due'}`
			} else {
				return 'icon-sprt-bw sprt-duedate'
			}
		},

		/**
		 * Checks if a date is overdue
		 */
		overdue,

		editProperty(type, event) {
			// don't start to edit the property again
			// if the confirm button of the datepicker was clicked
			// don't start to edit if a linkified link was clicked
			if (event && (event.target.classList.contains('mx-datepicker-btn-confirm') || event.target.tagName === 'A')) {
				return
			}
			// Don't allow to change the access class in calendars shared with me.
			if (this.task.calendar.isSharedWithMe && type === 'class') {
				return
			}
			// Save possible edits before starting to edit another property.
			if (this.edit !== type) {
				this.finishEditing(this.edit)
			}
			if (!this.readOnly && this.edit !== type) {
				this.edit = type
				this.tmpTask[type] = this.task[type]
				// If we edit the due or the start date, inintialize it.
				if (type === 'due') {
					this.tmpTask.due = this.initDueDate()
					this.tmpTask.start = this.task.startMoment.toDate()
				}
				if (type === 'start') {
					this.tmpTask.start = this.initStartDate()
					this.tmpTask.due = this.task.dueMoment.toDate()
				}
			}
			if (type === 'summary' || type === 'note') {
				this.$nextTick(
					() => document.getElementById(type + 'Input').focus()
				)
			}
		},

		finishEditing(type, $event) {
			// For some reason the click-outside handlers fire for the datepicker month and year buttons!?
			if ($event && $event.target.classList.contains('mx-btn')) {
				return
			}
			if (this.edit === type) {
				this.setProperty(type, this.tmpTask[type])
			}
		},

		cancelEditing(type) {
			this.edit = ''
			this.tmpTask[type] = this.task[type]
		},

		setProperty(type, value) {
			switch (type) {
			case 'summary':
				this.setSummary({ task: this.task, summary: value })
				break
			case 'note':
				this.setNote({ task: this.task, note: value })
				break
			case 'priority':
				this.setPriority({ task: this.task, priority: value })
				break
			case 'complete':
				this.setPercentComplete({ task: this.task, complete: value })
				break
			case 'start':
				this.setStart({ task: this.task, start: value, allDay: this.allDay })
				break
			case 'due':
				this.setDue({ task: this.task, due: value, allDay: this.allDay })
				break
			}
			this.edit = ''
		},

		/**
		 * Initializes the start date of a task
		 *
		 * @returns {Date} The start date moment
		 */
		initStartDate() {
			const start = this.task.startMoment
			if (!start.isValid()) {
				const due = this.task.dueMoment
				let reference = moment().add(1, 'h')
				if (due.isBefore(reference)) {
					reference = due.subtract(1, 'm')
				}
				reference.startOf(this.allDay ? 'day' : 'hour')
				return reference
			}
			return start
		},

		/**
		 * Initializes the due date of a task
		 *
		 * @returns {Date} The due date moment
		 */
		initDueDate() {
			const due = this.task.dueMoment
			if (!due.isValid()) {
				const start = this.task.startMoment
				const reference = start.isAfter() ? start : moment()
				if (this.allDay) {
					reference.startOf('day').add(1, 'd')
				} else {
					reference.startOf('hour').add(1, 'h')
				}
				return reference
			}
			return due
		},

		setStartDate(date) {
			this.setStartDateTime(moment(date), 'day')
		},

		setStartTime(time) {
			this.setStartDateTime(moment(time), 'time')
		},

		setStartDateTime(datetime, type = null) {
			this.tmpTask.start = this.setDatePartial(this.tmpTask.start.clone(), moment(datetime), type)
		},

		setDueDate(date) {
			this.setDueDateTime(moment(date), 'day')
		},

		setDueTime(time) {
			this.setDueDateTime(moment(time), 'time')
		},

		setDueDateTime(datetime, type = 'day') {
			this.tmpTask.due = this.setDatePartial(this.tmpTask.due.clone(), moment(datetime), type)
		},

		changeClass(classification) {
			this.setClassification({ task: this.task, classification: classification.type })
		},

		changeStatus(status) {
			this.setStatus({ task: this.task, status: status.type })
		},

		/**
		 * Sets partial values of a moment to the values of an other moment.
		 *
		 * @param {Moment} date The moment to alter
		 * @param {Moment} part The moment to take the new values from
		 * @param {String} type Value indicating what values to set
		 * @returns {Moment} The altered moment
		 */
		setDatePartial(date, part, type = null) {
			// Set only year, month and day
			if (type === 'day') {
				if (date.isValid()) {
					return date.year(part.year()).month(part.month()).date(part.date())
				} else {
					return part.add(12, 'h')
				}
			// Set only hour and minute
			} else if (type === 'time') {
				if (date.isValid()) {
					return date.hour(part.hour()).minute(part.minute())
				} else {
					return part
				}
			// Set all values
			} else {
				return part
			}
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
		 * @param {String} tag The name of the tag to add
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
