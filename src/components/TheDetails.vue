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
		<div v-if="task!=undefined"
			:class="{'disabled': task.calendar.readOnly}"
			class="flex-container"
		>
			<div :class="{'editing': edit=='summary'}" class="title">
				<a :aria-checked="task.completed"
					:aria-label="t('tasks', 'Task is completed')"
					class="checkbox reactive"
					role="checkbox"
					@click="toggleCompleted(task)"
				>
					<span :class="{'icon-checkmark': task.completed, 'disabled': task.calendar.readOnly}" class="icon icon-bw detail-checkbox" />
				</a>
				<a class="star reactive" @click="toggleStarred(task)">
					<span :class="[{'disabled': task.calendar.readOnly}, iconStar]"
						class="icon"
					/>
				</a>
				<div v-click-outside="() => finishEditing('summary')">
					<div v-linkify="task.summary"
						:class="{'strike-through': task.completed}"
						class="title-text"
						@click="editProperty('summary', $event)"
					/>
					<div class="expandable-container">
						<div class="expandingArea active">
							<pre><span>{{ tmpTask.summary }}</span><br></pre>
							<textarea id="summaryInput"
								v-model="tmpTask.summary"
								maxlength="200"
								@keyup.27="cancelEditing('summary')"
								@keydown.enter.prevent="finishEditing('summary')"
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="body">
				<ul class="sections">
					<li :class="{'date': valid(task.start), 'editing': edit=='start', 'high': overdue(task.start)}"
						class="section detail-start"
					>
						<div v-click-outside="() => finishEditing('start')"
							@click="editProperty('start', $event)"
						>
							<span :class="[dateIcon(task.start)]"
								class="icon"
							/>
							<span class="section-title">
								{{ task.start | formatStartDate }}
							</span>
							<div v-if="edit=='start'" class="section-edit">
								<DatetimePicker :value="tmpTask.start" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="t('tasks', 'Set start date')"
									class="date" @change="setStartDate"
								/>
								<DatetimePicker v-if="!task.allDay" :value="tmpTask.start" :lang="lang"
									:format="timeFormat" :clearable="false" :time-picker-options="timePickerOptions"
									:type="'time'" :placeholder="t('tasks', 'Set start time')"
									class="time" @change="setStartTime"
								/>
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon icon-color detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="setStart({ task: task, start: null })">
								<span class="icon icon-bw icon-trash reactive" />
							</a>
						</div>
					</li>
					<li :class="{'date': valid(task.due), 'editing': edit=='due', 'high': overdue(task.due)}"
						class="section detail-date"
					>
						<div v-click-outside="() => finishEditing('due')"
							@click="editProperty('due', $event)"
						>
							<span :class="[dateIcon(task.due)]"
								class="icon"
							/>
							<span class="section-title">
								{{ task.due | formatDueDate }}
							</span>
							<div v-if="edit=='due'" class="section-edit">
								<DatetimePicker :value="tmpTask.due" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="t('tasks', 'Set due date')"
									class="date" @change="setDueDate"
								/>
								<DatetimePicker v-if="!task.allDay" :value="tmpTask.due" :lang="lang"
									:format="timeFormat" :clearable="false" :time-picker-options="timePickerOptions"
									:type="'time'" :placeholder="t('tasks', 'Set due time')"
									class="time" @change="setDueTime"
								/>
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon icon-color detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="setDue({ task: task, due: null })">
								<span class="icon icon-bw icon-trash reactive" />
							</a>
						</div>
					</li>
					<li v-show="isAllDayPossible"
						:aria-checked="task.allDay"
						class="section detail-all-day reactive"
						role="checkbox"
						@click="toggleAllDay(task)"
					>
						<div>
							<span :class="{'icon-checkmark': task.allDay, 'disabled': task.calendar.readOnly}" class="icon icon-bw detail-checkbox" />
							<span class="section-title">
								{{ t('tasks', 'All day') }}
							</span>
						</div>
					</li>
					<li class="section detail-calendar reactive">
						<div v-click-outside="() => finishEditing('calendar')"
							@click="editProperty('calendar')"
						>
							<span :style="{'background-color': task.calendar.color}" class="calendar-indicator" />
							<div class="detail-calendar-container">
								<Multiselect
									:value="task.calendar"
									:multiple="false"
									:allow-empty="false"
									track-by="id"
									:placeholder="t('tasks', 'Select a calendar')"
									label="displayName"
									:options="writableCalendars"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeCalendar"
									@tag="changeCalendar"
								/>
							</div>
						</div>
					</li>
					<li :class="[{'editing': edit=='priority', 'date': task.priority>0}, priorityString]"
						class="section detail-priority"
					>
						<div v-click-outside="() => finishEditing('priority')"
							@click="editProperty('priority')"
						>
							<span :class="[iconStar]"
								class="icon"
							/>
							<span class="section-title">
								{{ task.priority | priority }}
							</span>
							<div class="section-edit">
								<input v-model="tmpTask.priority"
									class="priority-input"
									type="number"
									min="0"
									max="9"
									@keyup.27="cancelEditing('priority')"
									@keydown.enter.prevent="finishEditing('priority')"
								>
								<input v-model="tmpTask.priority"
									type="range"
									min="0"
									max="9"
									step="1"
								>
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon icon-color detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="setProperty('priority', 0)">
								<span class="icon icon-bw icon-trash reactive" />
							</a>
						</div>
					</li>
					<li :class="{'editing': edit=='complete', 'date': task.complete>0}"
						class="section detail-complete"
					>
						<div v-click-outside="() => finishEditing('complete')"
							@click="editProperty('complete')"
						>
							<span :class="[iconPercent]" class="icon" />
							<span class="section-title">
								{{ task.complete | complete }}
							</span>
							<div class="section-edit">
								<input v-model="tmpTask.complete"
									class="percent-input"
									type="number"
									min="0"
									max="100"
									@keyup.27="cancelEditing('complete')"
									@keydown.enter.prevent="finishEditing('complete')"
								>
								<input v-model="tmpTask.complete"
									type="range"
									min="0"
									max="100"
									step="1"
								>
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon icon-color detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="setProperty('complete', 0)">
								<span class="icon icon-bw icon-trash reactive" />
							</a>
						</div>
					</li>
					<li :class="{'active': task.categories.length>0}" class="section detail-categories">
						<div>
							<span :class="[iconCategories]" class="icon detail-categories" />
							<div class="detail-categories-container">
								<Multiselect v-if="task.categories"
									v-model="task.categories"
									:multiple="true"
									:searchable="true"
									:options="task.categories"
									:placeholder="t('tasks', 'Select categories')"
									:taggable="true"
									:tag-placeholder="t('tasks', 'Add this as a new category')"
									:close-on-select="false"
									class="multiselect-vue"
									@input="updateCategories"
									@tag="updateCategory"
								/>
							</div>
						</div>
					</li>
					<li class="section detail-note">
						<div class="note">
							<div v-click-outside="() => finishEditing('note')"
								class="note-body selectable"
								@click="editProperty('note', $event)"
							>
								<div :class="{'editing': edit=='note'}" class="content-fakeable">
									<markdown id="markdown"
										:source="task.note"
										class="display-view"
									/>
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
				<a v-show="!task.calendar.readOnly"
					class="close-all reactive"
					@click="removeTask"
				>
					<span class="icon icon-bw icon-trash" />
				</a>
				<a v-tooltip="{
						content: taskInfo,
						html: true,
					}"
					class="info"
				>
					<span class="icon icon-info" />
				</a>
				<a class="close-all reactive" @click="closeDetails">
					<span class="icon icon-bw icon-hide" />
				</a>
			</div>
		</div>
		<div v-else class="notice">
			<span>{{ t('tasks', 'Task not found!') }}</span>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { valid, overdue } from '../store/storeHelper'
import { DatetimePicker, Multiselect } from 'nextcloud-vue'
import Markdown from './Markdown'

import ClickOutside from 'vue-click-outside'
import { linkify } from '../directives/linkify.js'

export default {
	components: {
		DatetimePicker,
		Multiselect,
		Markdown,
	},
	directives: {
		ClickOutside,
		linkify
	},
	filters: {
		formatStartDate: function(date) {
			if (valid(date)) {
				if (date.isDate) {
					return moment(date, 'YYYYMMDDTHHmmss').calendar(null, {
						sameDay: t('tasks', '[Starts today]'),
						nextDay: t('tasks', '[Starts tomorrow]'),
						nextWeek: t('tasks', '[Starts on] LL'),
						lastDay: t('tasks', '[Started yesterday]'),
						lastWeek: t('tasks', '[Started on] LL'),
						sameElse: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Started on] LL')
							} else {
								return t('tasks', '[Starts on] LL')
							}
						}
					})
				} else {
					return moment(date, 'YYYYMMDDTHHmmss').calendar(null, {
						sameDay: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Started today at] LT')
							} else {
								return t('tasks', '[Starts today at] LT')
							}
						},
						nextDay: t('tasks', '[Starts tomorrow at] LT'),
						nextWeek: t('tasks', '[Starts on] LL [at] LT'),
						lastDay: t('tasks', '[Started yesterday at] LT'),
						lastWeek: t('tasks', '[Started on] LL [at] LT'),
						sameElse: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Started on] LL [at] LT')
							} else {
								return t('tasks', '[Starts on] LL [at] LT')
							}
						}
					})
				}
			} else {
				return t('tasks', 'Set start date')
			}
		},
		formatDueDate: function(date) {
			if (valid(date)) {
				if (date.isDate) {
					return moment(date, 'YYYYMMDDTHHmmss').calendar(null, {
						sameDay: t('tasks', '[Due today]'),
						nextDay: t('tasks', '[Due tomorrow]'),
						nextWeek: t('tasks', '[Due on] LL'),
						lastDay: t('tasks', '[Was due yesterday]'),
						lastWeek: t('tasks', '[Was due on] LL'),
						sameElse: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Was due on] LL')
							} else {
								return t('tasks', '[Due on] LL')
							}
						}
					})
				} else {
					return moment(date, 'YYYYMMDDTHHmmss').calendar(null, {
						sameDay: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Was due today at] LT')
							} else {
								return t('tasks', '[Due today at] LT')
							}
						},
						nextDay: t('tasks', '[Due tomorrow at] LT'),
						nextWeek: t('tasks', '[Due on] LL [at] LT'),
						lastDay: t('tasks', '[Was due yesterday at] LT'),
						lastWeek: t('tasks', '[Was due on] LL [at] LT'),
						sameElse: function(now) {
							if (this.isBefore(now)) {
								return t('tasks', '[Was due on] LL [at] LT')
							} else {
								return t('tasks', '[Due on] LL [at] LT')
							}
						}
					})
				}
			} else {
				return t('tasks', 'Set due date')
			}
		},
		priority: function(priority) {
			if (+priority === 0) {
				return t('tasks', 'No priority assigned')
			} else if (+priority > 0 && +priority < 5) {
				return t('tasks', 'Priority %s: high').replace('%s', priority)
			} else if (+priority === 5) {
				return t('tasks', 'Priority %s: medium').replace('%s', priority)
			} else if (+priority > 5 && +priority < 10) {
				return t('tasks', 'Priority %s: low').replace('%s', priority)
			}
		},
		complete: function(complete) {
			return t('tasks', '%s %% completed').replace('%s', complete).replace('%%', '%')
		}
	},
	data: function() {
		return {
			edit: '',
			tmpTask: {
				summary: '',
				start: '',
				due: '',
				priority: '',
				complete: '',
				note: ''
			},
			firstDay: window.firstDay,		// provided by nextcloud
			lang: {
				days: window.dayNamesShort,		// provided by nextcloud
				months: window.monthNamesShort	// provided by nextcloud
			},
			dateFormat: moment.localeData().longDateFormat('L'),
			timeFormat: moment.localeData().longDateFormat('LT'),
			timePickerOptions: {
				start: '00:00',
				step: '00:30',
				end: '23:30'
			},
			categories: []
		}
	},
	computed: {
		taskInfo: function() {
			return t('tasks', 'Last modified %s').replace('%s', moment(this.task.modified, 'YYYY-MM-DDTHH:mm:ss').calendar())
				+ '<br />' + t('tasks', 'Created %s').replace('%s', moment(this.task.created, 'YYYY-MM-DDTHH:mm:ss').calendar())
		},
		isAllDayPossible: function() {
			return !this.task.calendar.readOnly && (this.task.due || this.task.start)
		},
		priorityString: function() {
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
		iconStar: function() {
			if (+this.task.priority) {
				return 'icon-color icon-task-star-' + this.priorityString
			} else {
				return 'icon-bw icon-task-star'
			}
		},
		iconPercent: function() {
			if (this.task.complete > 0) {
				return 'icon-color icon-percent-active'
			} else {
				return 'icon-bw icon-percent'
			}
		},
		iconCategories: function() {
			if (this.task.categories.length > 0) {
				return 'icon-color icon-tag-active'
			} else {
				return 'icon-bw icon-tag'
			}
		},
		...mapGetters({
			writableCalendars: 'getSortedWritableCalendars',
			task: 'getTaskByRoute'
		}),
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
			'setCategories',
			'addCategory',
			'setDue',
			'setStart',
			'toggleAllDay',
			'moveTaskToCalendar',
		]),

		removeTask: function() {
			this.deleteTask({ task: this.task, dav: true })
			this.closeDetails()
		},

		closeDetails: function() {
			if (this.$route.params.calendarId) {
				this.$router.push({ path: `/calendars/${this.$route.params.calendarId}` })
			} else {
				this.$router.push({ path: `/collections/${this.$route.params.collectionId}` })
			}
		},

		dateIcon: function(date) {
			if (valid(date)) {
				var c = 'icon-color icon-calendar-due'
				if (overdue(date)) {
					c += ' icon-calendar-overdue'
				}
				return c
			} else {
				return 'icon-bw icon-calendar'
			}
		},

		/**
		 * Checks if a date is overdue
		 */
		overdue: overdue,

		/**
		 * Checks if a date is valid
		 */
		valid: valid,

		editProperty: function(type, event) {
			// don't start to edit the property again
			// if the confirm button of the datepicker was clicked
			// don't start to edit if a linkified link was clicked
			if (event && (event.target.classList.contains('mx-datepicker-btn-confirm') || event.target.tagName === 'A')) {
				return
			}
			if (!this.task.calendar.readOnly && this.edit !== type) {
				this.edit = type
				this.tmpTask[type] = this.task[type]
				// If we edit the due or the start date, inintialize it.
				if (type === 'due') {
					this.tmpTask.due = this.initDueDate()
					this.tmpTask.start = moment(this.task.start, 'YYYY-MM-DDTHH:mm:ss')
				}
				if (type === 'start') {
					this.tmpTask.start = this.initStartDate()
					this.tmpTask.due = moment(this.task.due, 'YYYY-MM-DDTHH:mm:ss')
				}
			}
			if (type === 'summary' || type === 'note') {
				this.$nextTick(
					() => document.getElementById(type + 'Input').focus()
				)
			}
		},

		finishEditing: function(type) {
			if (this.edit === type) {
				this.setProperty(type, this.tmpTask[type])
				this.edit = ''
			}
		},

		cancelEditing: function(type) {
			this.edit = ''
			this.tmpTask[type] = this.task[type]
		},

		setProperty: function(type, value) {
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
				this.setStart({ task: this.task, start: value })
				break
			case 'due':
				this.setDue({ task: this.task, due: value })
				break
			}
			this.edit = ''
		},

		/**
		 * Initializes the start date of a task
		 *
		 * @returns {Moment} The start date moment
		 */
		initStartDate: function() {
			var start = moment(this.task.start, 'YYYY-MM-DDTHH:mm:ss')
			if (!start.isValid()) {
				var due = moment(this.task.due, 'YYYY-MM-DDTHH:mm:ss')
				var reference = moment().add(1, 'h')
				if (due.isBefore(reference)) {
					reference = due.subtract(1, 'm')
				}
				reference.startOf(this.task.allDay ? 'day' : 'hour')
				return reference
			}
			return start
		},

		/**
		 * Initializes the due date of a task
		 *
		 * @returns {Moment} The due date moment
		 */
		initDueDate: function() {
			var due = moment(this.task.due, 'YYYY-MM-DDTHH:mm:ss')
			if (!due.isValid()) {
				var start = moment(this.task.start, 'YYYY-MM-DDTHH:mm:ss')
				var reference = start.isAfter() ? start : moment()
				if (this.task.allDay) {
					reference.startOf('day').add(1, 'd')
				} else {
					reference.startOf('hour').add(1, 'h')
				}
				return reference
			}
			return due
		},

		setStartDate: function(date) {
			this.setStartDateTime(date, 'day')
		},

		setStartTime: function(time) {
			this.setStartDateTime(time, 'time')
		},

		setStartDateTime: function(datetime, type = null) {
			this.tmpTask.start = this.setDatePartial(this.tmpTask.start.clone(), moment(datetime), type)
		},

		setDueDate: function(date) {
			this.setDueDateTime(date, 'day')
		},

		setDueTime: function(time) {
			this.setDueDateTime(time, 'time')
		},

		setDueDateTime: function(datetime, type = 'day') {
			this.tmpTask.due = this.setDatePartial(this.tmpTask.due.clone(), moment(datetime), type)
		},

		/**
		 * Sets partial values of a moment to the values of an other moment.
		 *
		 * @param {Moment} date The moment to alter
		 * @param {Moment} part The moment to take the new values from
		 * @param {String} type Value indicating what values to set
		 * @returns {Moment} The altered moment
		 */
		setDatePartial: function(date, part, type = null) {
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
		 * Sets the categories of a task
		 *
		 * @param {Array} categories The new categories
		 */
		updateCategories: function(categories) {
			this.setCategories({ task: this.task, categories: categories })
		},

		/**
		 * Adds a category to the list of categories
		 *
		 * @param {String} category The name of the category to add
		 */
		updateCategory: function(category) {
			this.addCategory({ task: this.task, category: category })
		},

		async changeCalendar(calendar) {
			const task = await this.moveTaskToCalendar({ task: this.task, calendar: calendar })
			// If we are in a calendar view, we have to navigate to the new calendar.
			if (this.$route.params.calendarId) {
				this.$router.push('/calendars/' + task.calendar.id + '/tasks/' + task.uri)
			}
		},
	}
}
</script>
