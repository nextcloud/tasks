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
				<a class="star reactive" @click="toggleStarred(task.uri)">
					<span :class="[{'disabled': task.calendar.readOnly}, iconStar]"
						class="icon"
					/>
				</a>
				<div v-click-outside="() => finishEditing('summary')">
					<div :class="{'strike-through': task.completed}"
						class="title-text"
						@click="editProperty('summary')"
					>
						{{ task.summary }}
					</div>
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
								{{ task.start | startDate }}
							</span>
							<div v-if="edit=='start'" class="section-edit">
								<DatetimePicker :value="startDate" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="t('tasks', 'Set start date')"
									class="date" @change="setStartDate"
								/>
								<DatetimePicker :value="startDate" :lang="lang"
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
							<a class="end-edit" @click="setProperty('start', '')">
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
								{{ task.due | dueDate }}
							</span>
							<div v-if="edit=='due'" class="section-edit">
								<DatetimePicker :value="dueDate" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="t('tasks', 'Set due date')"
									class="date" @change="setDueDate"
								/>
								<DatetimePicker :value="dueDate" :lang="lang"
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
							<a class="end-edit" @click="setProperty('due', '')">
								<span class="icon icon-bw icon-trash reactive" />
							</a>
						</div>
					</li>
					<li v-show="isAllDayPossible"
						:aria-checked="task.allDay"
						class="section detail-all-day reactive"
						role="checkbox"
						@click="toggleAllDay(task.uri)"
					>
						<div>
							<span :class="{'icon-checkmark': task.allDay, 'disabled': task.calendar.readOnly}" class="icon icon-color detail-checkbox" />
							<span class="section-title">
								{{ t('tasks', 'All day') }}
							</span>
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
									@change="finishEditing('priority')"
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
									@keyup.exact="setPropertyTemporarily('complete', tmpTask.complete)"
								>
								<input v-model="tmpTask.complete"
									type="range"
									min="0"
									max="100"
									step="1"
									@change="setPropertyTemporarily('complete', tmpTask.complete)"
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
									@tag="addCategory"
								/>
							</div>
						</div>
					</li>
					<li class="section detail-note">
						<div class="note">
							<div v-click-outside="() => finishEditing('note')"
								class="note-body selectable"
								@click="editProperty('note')"
							>
								<div :class="{'editing': edit=='note'}" class="content-fakeable">
									<div class="display-view">
										{{ task.note }}
									</div>
									<div class="edit-view">
										<div class="expandingArea active">
											<pre><span>{{ tmpTask.note }}</span><br><br></pre>
											<textarea id="noteInput" v-model="tmpTask.note" @change="setPropertyTemporarily('note', tmpTask.note)" />
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
					class="left close-all reactive"
					@click="removeTask"
				>
					<span class="icon icon-bw icon-trash" />
				</a>
				<a class="right close-all reactive" @click="closeDetails">
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
import { mapState, mapGetters, mapActions } from 'vuex'
import { valid, overdue } from '../store/storeHelper'
import { DatetimePicker, Multiselect } from 'nextcloud-vue'

import ClickOutside from 'vue-click-outside'

export default {
	components: {
		DatetimePicker,
		Multiselect
	},
	directives: {
		ClickOutside
	},
	filters: {
		startDate: function(date) {
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
		dueDate: function(date) {
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
		isAllDayPossible: function() {
			return !this.task.calendar.readOnly && (this.task.due || this.task.start)
		},
		priorityString: function() {
			if (this.task.priority > 5) {
				return 'low'
			} else if (this.task.priority === 5) {
				return 'medium'
			} else if (this.task.priority > 0 && this.task.priority < 5) {
				return 'high'
			} else {
				return ''
			}
		},
		iconStar: function() {
			if (this.task.priority) {
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
		startDate: function() {
			return moment(this.task.start, 'YYYYMMDDTHHmmss').toDate()
		},
		dueDate: function() {
			return moment(this.task.due, 'YYYYMMDDTHHmmss').toDate()
		},
		...mapState({
		}),
		...mapGetters({
			task: 'getTaskByRoute'
		})
	},
	methods: {
		...mapActions([
			'deleteTask',
			'toggleCompleted',
			'toggleStarred',
			'deleteDueDate',
			'deleteStartDate',
			'toggleAllDay'
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
			if (event && event.target.classList.contains('mx-datepicker-btn-confirm')) {
				return
			}
			if (!this.task.calendar.readOnly && this.edit !== type) {
				this.edit = type
				this.tmpTask[type] = this.task[type]
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
			console.debug('Set property "' + type + '" to "' + value)
			this.edit = ''
		},

		setPropertyTemporarily: function(type, value) {
			console.debug('Set property "' + type + '" temporarily to "' + value)
		},

		setStartDate: function(date) {
			console.debug('Set start date to ' + date)
		},

		setStartTime: function(time) {
			console.debug('Set start time to ' + time)
		},

		setDueDate: function(date) {
			console.debug('Set due date to ' + date)
		},

		setDueTime: function(time) {
			console.debug('Set due time to ' + time)
		},

		updateCategories: function(category) {
			console.debug(category)
		},

		addCategory: function(category) {
			console.debug(category)
		}
	}
}
</script>
