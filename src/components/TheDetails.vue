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
			:class="{'disabled': !task.calendar.writable}"
			class="flex-container">
			<div :class="{'editing': edit=='name'}" class="title">
				<a :aria-checked="task.completed"
					:aria-label="t('tasks', 'Task is completed')"
					class="checkbox reactive"
					role="checkbox"
					@click="toggleCompleted(task.uri)">
					<span :class="{'icon-checkmark': task.completed, 'disabled': !task.calendar.writable}" class="icon detail-checkbox" />
				</a>
				<a class="star reactive" @click="toggleStarred(task.uri)">
					<span :class="{'icon-task-star-low': task.priority>5, 'icon-task-star-medium': task.priority==5,
						'icon-task-star-high': task.priority > 0 && task.priority < 5, 'disabled': !task.calendar.writable}"
						class="icon icon-task-star" />
				</a>
				<div v-click-outside="() => endEditing('name')">
					<div :class="{'strike-through': task.completed}"
						class="title-text"
						oc-click-focus="{selector: '#editName', timeout: 0}"
						@click="editProperty('name')">
						{{ task.summary }}
					</div>
					<div class="expandable-container">
						<div class="expandingArea active">
							<pre><span>{{ task.summary }}</span><br></pre>
							<textarea id="editName"
								maxlength="200"
								ng-model="task.summary"
								ng-keydown="endName($event)"
								ng-change="triggerUpdate(task)" />
						</div>
					</div>
				</div>
			</div>
			<div class="body">
				<ul class="sections">
					<li v-click-outside="() => endEditing('start')"
						:class="{'date': valid(task.start), 'editing': edit=='start', 'high': overdue(task.start)}"
						class="section detail-start"
						@click="editProperty('start')">
						<div>
							<span :class="{'icon-calendar-due': valid(task.start), 'icon-calendar-overdue': overdue(task.start)}"
								class="icon icon-calendar" />
							<span class="section-title">{{ task.start | startDate }}</span>
							<div class="section-edit">
								<!-- <input class="datepicker-input medium"
									type="text"
									key-value=""
									placeholder="dd.mm.yyyy"
									value="{{ task.start | dateTaskList }}"
									datepicker="start">
								<input class="timepicker-input medium"
									ng-hide="task.allDay"
									type="text"
									key-value=""
									placeholder="hh:mm"
									value="{{ task.start | timeTaskList }}"
									timepicker="start"> -->
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="deleteStartDate(task.uri)">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li v-click-outside="() => endEditing('due')"
						:class="{'date': valid(task.due), 'editing': edit=='due', 'high': overdue(task.due)}"
						class="section detail-date"
						@click="editProperty('due')">
						<div>
							<span :class="{'icon-calendar-due': valid(task.due), 'icon-calendar-overdue': overdue(task.due)}"
								class="icon icon-calendar" />
							<span class="section-title">{{ task.due | dueDate }}</span>
							<div class="section-edit">
								<!-- <input class="datepicker-input medium"
									type="text"
									key-value=""
									placeholder="dd.mm.yyyy"
									value="{{ task.due | dateTaskList }}"
									datepicker="due">
								<input class="timepicker-input medium"
									ng-hide="task.allDay"
									type="text"
									key-value=""
									placeholder="hh:mm"
									value="{{ task.due | timeTaskList }}"
									timepicker="due"> -->
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="deleteDueDate(task.uri)">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li v-show="isAllDayPossible"
						:aria-checked="task.allDay"
						class="section detail-all-day reactive"
						role="checkbox"
						@click="toggleAllDay(task.uri)">
						<div>
							<span :class="{'icon-checkmark': task.allDay, 'disabled': !task.calendar.writable}" class="icon detail-checkbox" />
							<span class="section-title">{{ t('tasks', 'All day') }}</span>
						</div>
					</li>
					<li v-click-outside="() => endEditing('priority')"
						:class="{'editing': edit=='priority',
						'low': task.priority>5, 'medium': task.priority==5, 'high': task.priority > 0 && task.priority < 5,
						'date': task.priority>0}"
						class="section detail-priority"
						@click="editProperty('priority')">
						<div>
							<span :class="{'icon-task-star-low': task.priority>5, 'icon-task-star-medium': task.priority==5,
								'icon-task-star-high': task.priority > 0 && task.priority < 5}"
								class="icon icon-task-star" />
							<span class="section-title">{{ task.priority | priority}}</span>
							<div class="section-edit">
								<input class="priority-input"
									type="text"
									ng-model="task.priority"
									ng-change="triggerUpdate(task)">
								<input type="range"
									ng-model="task.priority"
									min="0"
									max="9"
									step="1"
									ng-change="triggerUpdate(task)">
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="deletePriority()">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li v-click-outside="() => endEditing('percent')"
						:class="{'editing': edit=='percent', 'date': task.complete>0}"
						class="section detail-complete"
						@click="editProperty('percent')">
						<div>
							<span :class="{'icon-percent-active': task.complete>0}" class="icon icon-percent" />
							<span class="section-title">{{ task.complete | percent}}</span>
							<div class="section-edit">
								<input class="percent-input"
									type="text"
									ng-model="task.complete"
									ng-change="setPercentComplete(task, task.complete)">
								<input type="range"
									ng-model="task.complete"
									min="0"
									max="100"
									step="1"
									ng-change="setPercentComplete(task, task.complete)">
							</div>
						</div>
						<div class="utils">
							<a>
								<span class="icon detail-save icon-checkmark-color end-edit reactive" />
							</a>
							<a class="end-edit" @click="deletePercent()">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li :class="{'active': task.categories.length>0}" class="section detail-categories">
						<div>
							<span :class="{'icon-tag-active': task.categories.length>0}" class="icon icon-tag detail-categories" />
							<!-- Edit line 1080 to show placeholder -->
							<div class="detail-categories-container">
								<!-- <ui-select
									multiple
									tagging
									tagging-label="<?php p($l->t('(New category)')); ?>"
									ng-model="task.categories"
									theme="select2"
									ng-disabled="!task.calendar.writable"
									style="width: 100%;"
									on-remove="removeCategory($item, $model)"
									on-select="addCategory($item, $model)">
									<ui-select-match placeholder="<?php p($l->t('Select categories...')); ?>">{{$item}}</ui-select-match>
									<ui-select-choices repeat="category in settingsmodel.getById('various').categories | filter:$select.search">
									{{category}}
									</ui-select-choices>
								</ui-select> -->
							</div>
						</div>
					</li>
					<li class="section detail-note">
						<div class="note">
							<div v-click-outside="() => endEditing('note')"
								class="note-body selectable"
								oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}"
								@click="editProperty('note')">
								<div :class="{'editing': edit=='note'}" class="content-fakeable">
									<div class="display-view" ng-bind-html="task.note | linky:'_blank':{rel: 'nofollow'}" />
									<div class="edit-view">
										<div class="expandingArea active">
											<pre><span>{{ task.note }}</span><br><br></pre>
											<textarea ng-model="task.note" ng-change="triggerUpdate(task)" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</li>
				</ul>
			</div>
			<div class="footer">
				<a v-show="task.calendar.writable"
					class="left close-all reactive"
					@click="deleteTask(task.uri)">
					<span class="icon icon-trash" />
				</a>
				<a class="right close-all reactive" @click="closeDetails">
					<span class="icon icon-hide" />
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

import clickOutside from 'vue-click-outside'

export default {
	components: {
		clickOutside
	},
	directives: {
		clickOutside
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
		percent: function(percent) {
			return t('tasks', '%s %% completed').replace('%s', percent).replace('%%', '%')
		}
	},
	data: function() {
		return {
			edit: ''
		}
	},
	computed: Object.assign({
		isAllDayPossible: function() {
			return this.task.calendar.writable && (this.task.due || this.task.start)
		}
	},
	mapState({
	}),
	mapGetters({
		task: 'getTaskByRoute'
	})
	),
	methods: Object.assign(
		mapActions([
			'deleteTask',
			'toggleCompleted',
			'toggleStarred',
			'deleteDueDate',
			'deleteStartDate',
			'toggleAllDay'
		]),
		{
			closeDetails: function() {
				if (this.$route.params.calendarId) {
					this.$router.push({ path: `/calendars/${this.$route.params.calendarId}` })
				} else {
					this.$router.push({ path: `/collections/${this.$route.params.collectionId}` })
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

			editProperty: function(type) {
				if (this.task.calendar.writable) {
					this.edit = type
				}
			},

			endEditing: function(type) {
				if (this.edit == type) {
					this.edit = ''
				}
			},

			deletePriority: function() {
			},

			deletePercent: function() {
			}
		}
	)
}
</script>
