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
			:class="{'disabled': task.calendar.readOnly}"
			class="flex-container"
		>
			<div :class="{'editing': edit=='summary'}" class="title">
				<span class="detail-checkbox">
					<input :id="'detailsToggleCompleted_' + task.uid"
						type="checkbox"
						class="checkbox"
						name="detailsToggleCompleted"
						:class="{'disabled': task.calendar.readOnly}"
						:checked="task.completed"
						:aria-checked="task.completed"
						:disabled="task.calendar.readOnly"
						:aria-label="$t('tasks', 'Task is completed')"
						@click="toggleCompleted(task)"
					>
					<label :for="'detailsToggleCompleted_' + task.uid" />
				</span>
				<div v-click-outside="() => finishEditing('summary')" class="title-wrapper">
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
				<TaskStatusDisplay :task="task" />
				<span class="action reactive" @click="togglePinned(task)">
					<span :class="[{'disabled': task.calendar.readOnly}, iconPinned]" class="icon" />
				</span>
				<span class="action reactive" @click="toggleStarred(task)">
					<span :class="[{'disabled': task.calendar.readOnly}, iconStar]"
						class="icon"
					/>
				</span>
			</div>
			<div class="body">
				<ul class="sections">
					<li v-show="!task.calendar.readOnly || task.start" :class="{'date': task.startMoment.isValid(), 'editing': edit=='start', 'high': overdue(task.startMoment)}"
						class="section detail-start"
					>
						<div v-click-outside="() => finishEditing('start')"
							@click="editProperty('start', $event)"
						>
							<span :class="[dateIcon(task.startMoment)]"
								class="icon"
							/>
							<span class="section-title">
								{{ startDateString }}
							</span>
							<div v-if="edit=='start'" class="section-edit">
								<DatetimePicker :value="tmpTask.start" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="$t('tasks', 'Set start date')"
									class="date" @change="setStartDate"
								/>
								<DatetimePicker v-if="!task.allDay" :value="tmpTask.start" :lang="lang"
									:format="timeFormat" :clearable="false" :time-picker-options="timePickerOptions"
									:type="'time'" :placeholder="$t('tasks', 'Set start time')"
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
					<li v-show="!task.calendar.readOnly || task.due" :class="{'date': task.dueMoment.isValid(), 'editing': edit=='due', 'high': overdue(task.dueMoment)}"
						class="section detail-date"
					>
						<div v-click-outside="() => finishEditing('due')"
							@click="editProperty('due', $event)"
						>
							<span :class="[dateIcon(task.dueMoment)]"
								class="icon"
							/>
							<span class="section-title">
								{{ dueDateString }}
							</span>
							<div v-if="edit=='due'" class="section-edit">
								<DatetimePicker :value="tmpTask.due" :lang="lang"
									:format="dateFormat" :clearable="false" :first-day-of-week="firstDay"
									:type="'date'" :placeholder="$t('tasks', 'Set due date')"
									class="date" @change="setDueDate"
								/>
								<DatetimePicker v-if="!task.allDay" :value="tmpTask.due" :lang="lang"
									:format="timeFormat" :clearable="false" :time-picker-options="timePickerOptions"
									:type="'time'" :placeholder="$t('tasks', 'Set due time')"
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
						class="section detail-all-day reactive"
					>
						<div>
							<input id="isAllDayPossible"
								type="checkbox"
								class="checkbox"
								name="isAllDayPossible"
								:class="{'disabled': task.calendar.readOnly}"
								:aria-checked="task.allDay"
								:checked="task.allDay"
								:disabled="task.calendar.readOnly"
								@click="toggleAllDay(task)"
							>
							<label for="isAllDayPossible">
								<span>{{ $t('tasks', 'All day') }}</span>
							</label>
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
									:disabled="task.calendar.readOnly"
									track-by="id"
									:placeholder="$t('tasks', 'Select a calendar')"
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
					<li class="section detail-class reactive">
						<div v-click-outside="() => finishEditing('class')"
							@click="editProperty('class')"
						>
							<span class="icon icon-color icon-privacy" />
							<div class="detail-calendar-container">
								<Multiselect
									:value="classSelect.find( _ => _.type === task.class )"
									:multiple="false"
									:allow-empty="false"
									:disabled="task.calendar.readOnly"
									track-by="type"
									:placeholder="$t('tasks', 'Select a classification')"
									label="displayName"
									:options="classSelect"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeClass"
									@tag="changeClass"
								/>
							</div>
						</div>
					</li>
					<li class="section detail-class reactive">
						<div v-click-outside="() => finishEditing('status')"
							@click="editProperty('status')"
						>
							<span :class="[iconStatus]" class="icon" />
							<div class="detail-calendar-container">
								<Multiselect
									:value="statusSelect.find( _ => _.type === task.status )"
									:multiple="false"
									:allow-empty="false"
									:disabled="task.calendar.readOnly"
									track-by="type"
									:placeholder="$t('tasks', 'Select a status')"
									label="displayName"
									:options="statusSelect"
									:close-on-select="true"
									class="multiselect-vue"
									@input="changeStatus"
									@tag="changeStatus"
								/>
							</div>
						</div>
					</li>
					<li v-show="!task.calendar.readOnly || task.priority" :class="[{'editing': edit=='priority', 'date': task.priority>0}, priorityClass]"
						class="section detail-priority"
					>
						<div v-click-outside="() => finishEditing('priority')"
							@click="editProperty('priority')"
						>
							<span :class="[iconStar]"
								class="icon"
							/>
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
					<li v-show="!task.calendar.readOnly || task.complete" :class="{'editing': edit=='complete', 'date': task.complete>0}"
						class="section detail-complete"
					>
						<div v-click-outside="() => finishEditing('complete')"
							@click="editProperty('complete')"
						>
							<span :class="[iconPercent]" class="icon" />
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
					<li v-show="!task.calendar.readOnly || task.categories.length>0" :class="{'active': task.categories.length>0}" class="section detail-categories">
						<div>
							<span :class="[iconCategories]" class="icon detail-categories" />
							<div class="detail-categories-container">
								<Multiselect v-if="task.categories"
									v-model="task.categories"
									:multiple="true"
									:searchable="true"
									:disabled="task.calendar.readOnly"
									:options="task.categories"
									:placeholder="$t('tasks', 'Select categories')"
									:taggable="true"
									:tag-placeholder="$t('tasks', 'Add this as a new category')"
									:close-on-select="false"
									class="multiselect-vue"
									@input="updateCategories"
									@tag="updateCategory"
								/>
							</div>
						</div>
					</li>
					<li v-show="!task.calendar.readOnly || task.note" class="section detail-note">
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
				<a :style="{visibility: task.calendar.readOnly ? 'hidden' : 'visible'}"
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
			<span v-if="loading">{{ $t('tasks', 'Loading task from server.') }}</span>
			<span v-else>{{ $t('tasks', 'Task not found!') }}</span>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { overdue } from '../store/storeHelper'
import { DatetimePicker, Multiselect } from 'nextcloud-vue'
import Markdown from './Markdown'
import TaskStatusDisplay from './TaskStatusDisplay'

import ClickOutside from 'vue-click-outside'
import { linkify } from '../directives/linkify.js'

export default {
	components: {
		DatetimePicker,
		Multiselect,
		Markdown,
		TaskStatusDisplay,
	},
	directives: {
		ClickOutside,
		linkify,
	},
	filters: {
	},
	data: function() {
		return {
			loading: false,
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
			categories: [],
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
		startDateString: function() {
			const $t = this.$t
			if (this.task.startMoment.isValid()) {
				if (this.task.allDay) {
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
						sameElse: function(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
								return $t('tasks', '[Started on] LL')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
								return $t('tasks', '[Starts on] LL')
							}
						}
					})
				} else {
					return this.task.startMoment.calendar(null, {
						sameDay: function(now) {
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
						sameElse: function(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Started on] LL [at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Starts on] LL [at] LT')
							}
						}
					})
				}
			} else {
				return this.$t('tasks', 'Set start date')
			}
		},
		dueDateString: function() {
			const $t = this.$t
			if (this.task.dueMoment.isValid()) {
				if (this.task.allDay) {
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
						sameElse: function(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
								return $t('tasks', '[Was due on] LL')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
								return $t('tasks', '[Due on] LL')
							}
						}
					})
				} else {
					return this.task.dueMoment.calendar(null, {
						sameDay: function(now) {
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
						sameElse: function(now) {
							if (this.isBefore(now)) {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Was due on] LL [at] LT')
							} else {
								// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
								return $t('tasks', '[Due on] LL [at] LT')
							}
						}
					})
				}
			} else {
				return this.$t('tasks', 'Set due date')
			}
		},
		taskInfo: function() {
			return this.$t('tasks', 'Last modified {date}', { date: this.task.modifiedMoment.calendar() })
				+ '<br />' + this.$t('tasks', 'Created {date}', { date: this.task.createdMoment.calendar() })
				+ (this.task.completed ? ('<br />' + this.$t('tasks', 'Completed {date}', { date: this.task.completedDateMoment.calendar() })) : '')
		},
		isAllDayPossible: function() {
			return !this.task.calendar.readOnly && (this.task.due || this.task.start)
		},
		priorityClass: function() {
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
		priorityString: function() {
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
		completeString: function() {
			return this.$t('tasks', '{percent} % completed', { percent: this.task.complete })
		},
		iconStar: function() {
			if (+this.task.priority) {
				return 'icon-color icon-task-star-' + this.priorityClass
			} else {
				return 'icon-bw icon-task-star'
			}
		},
		iconPinned: function() {
			if (this.task.pinned) {
				return 'icon-bw icon-pinned'
			} else {
				return 'icon-bw icon-pinned-off'
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
		iconStatus: function() {
			if (this.task.status) {
				return 'icon-color icon-status'
			} else {
				return 'icon-bw icon-current'
			}
		},
		...mapGetters({
			writableCalendars: 'getSortedWritableCalendars',
			task: 'getTaskByRoute',
			calendar: 'getCalendarByRoute',
			calendars: 'getSortedCalendars',
		}),
	},

	watch: {
		$route: 'loadTask',
		calendars: 'loadTask',
	},

	created() {
		this.loadTask()
	},

	/**
	 * Before we close the details view, we save possible edits.
	 *
	 * @param {Route} to The target Route Object being navigated to.
	 * @param {Route} from The current route being navigated away from.
	 * @param {Function} next This function must be called to resolve the hook.
	 */
	beforeRouteLeave: function(to, from, next) {
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
	beforeRouteUpdate: function(to, from, next) {
		this.finishEditing(this.edit)
		next()
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

		removeTask: function() {
			this.deleteTask({ task: this.task, dav: true })
			this.closeDetails()
		},

		closeDetails: function() {
			if (this.$route.params.calendarId) {
				this.$router.push({ name: 'calendars', params: { calendarId: this.$route.params.calendarId } })
			} else {
				this.$router.push({ name: 'collections', params: { collectionId: this.$route.params.collectionId } })
			}
		},

		dateIcon: function(date) {
			if (date.isValid()) {
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

		editProperty: function(type, event) {
			// don't start to edit the property again
			// if the confirm button of the datepicker was clicked
			// don't start to edit if a linkified link was clicked
			if (event && (event.target.classList.contains('mx-datepicker-btn-confirm') || event.target.tagName === 'A')) {
				return
			}
			// Save possible edits before starting to edit another property.
			if (this.edit !== type) {
				this.finishEditing(this.edit)
			}
			if (!this.task.calendar.readOnly && this.edit !== type) {
				this.edit = type
				this.tmpTask[type] = this.task[type]
				// If we edit the due or the start date, inintialize it.
				if (type === 'due') {
					this.tmpTask.due = this.initDueDate()
					this.tmpTask.start = this.task.startMoment
				}
				if (type === 'start') {
					this.tmpTask.start = this.initStartDate()
					this.tmpTask.due = this.task.dueMoment
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
			var start = this.task.startMoment
			if (!start.isValid()) {
				var due = this.task.dueMoment
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
			var due = this.task.dueMoment
			if (!due.isValid()) {
				var start = this.task.startMoment
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

		changeClass: function(classification) {
			this.setClassification({ task: this.task, classification: classification.type })
		},

		changeStatus: function(status) {
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
			const task = await this.moveTask({ task: this.task, calendar: calendar })
			// If we are in a calendar view, we have to navigate to the new calendar.
			if (this.$route.params.calendarId) {
				this.$router.push({ name: 'calendarsTask', params: { calendarId: task.calendar.id, taskId: task.uri } })
			}
		},
	}
}
</script>
