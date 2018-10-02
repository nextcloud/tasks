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
	<div ng-click="endEdit($event)"
		class="content-wrapper">
		<div v-if="task!=undefined"
			:class="{'disabled': !task.calendar.writable}"
			class="flex-container">
			<div class="title" ng-class="{'editing': route.parameter=='name'}">
				<a :aria-checked="task.completed"
					:aria-label="t('tasks', 'Task is completed')"
					class="checkbox reactive"
					role="checkbox"
					@click="toggleCompleted">
					<span :class="{'icon-checkmark': task.completed, 'disabled': !task.calendar.writable}" class="icon detail-checkbox" />
				</a>
				<a class="star reactive" @click="toggleStarred">
					<span :class="{'icon-task-star-high': task.priority>5, 'icon-task-star-medium':task.priority==5, 'icon-task-star-low':task.priority > 0 && task.priority < 5, 'disabled': !task.calendar.writable}"
						class="icon icon-task-star" />
				</a>
				<div :class="{'strike-through': task.completed}"
					class="title-text"
					ng-click="editName($event, task)"
					oc-click-focus="{selector: '#editName', timeout: 0}">
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
			<div class="body">
				<ul class="sections">
					<li class="section detail-start"
						ng-class="{'date':isDue(task.start), 'editing':route.parameter=='startdate', 'high':isOverDue(task.start)}"
						ng-click="editStart($event, task)">
						<div>
							<span class="icon icon-calendar" ng-class="{'icon-calendar-due':isDue(task.start),
							'icon-calendar-overdue':isOverDue(task.start)}" />
							<span class="section-title">
								<!-- <text>{{ task.start | startDetails }}</text> -->
							</span>
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
							<a class="end-edit" @click="deleteStartDate">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li class="section detail-date"
						ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate', 'high':isOverDue(task.due)}"
						ng-click="editDueDate($event, task)">
						<div>
							<span class="icon icon-calendar" ng-class="{'icon-calendar-due':isDue(task.due), 'icon-calendar-overdue':isOverDue(task.due)}" />
							<span class="section-title">
								<!-- <text>{{ task.due | dateDetails }}</text> -->
							</span>
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
							<a class="end-edit" @click="deleteDueDate">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li :aria-checked="task.allDay"
						class="section detail-all-day reactive"
						ng-if="isAllDayPossible(task)"
						role="checkbox"
						@click="toggleAllDay">
						<div>
							<span class="icon detail-checkbox" ng-class="{'icon-checkmark': task.allDay, 'disabled': !task.calendar.writable}" />
							<span class="section-title">
								<text>{{ t('tasks', 'All day') }}</text>
							</span>
						</div>
					</li>
					<li class="section detail-priority"
						ng-class="{'editing':route.parameter=='priority','high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5, 'date':task.priority>0}"
						ng-click="editPriority($event, task)">
						<div>
							<span :class="{'icon-task-star-high':task.priority>5,'icon-task-star-medium':task.priority==5,'icon-task-star-low':task.priority > 0 && task.priority < 5}"
								class="icon icon-task-star" />
							<span class="section-title">
								<!-- <text>{{ task.priority | priorityDetails}}</text> -->
							</span>
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
							<a class="end-edit" ng-click="deletePriority(task)">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li class="section detail-complete"
						ng-class="{'editing':route.parameter=='percent', 'date':task.complete>0}"
						ng-click="editPercent($event, task)">
						<div>
							<span class="icon icon-percent" ng-class="{'icon-percent-active':task.complete>0}" />
							<span class="section-title">
								<!-- <text>{{ task.complete | percentDetails}}</text> -->
							</span>
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
							<a class="end-edit" ng-click="deletePercent(task)">
								<span class="icon icon-trash reactive" />
							</a>
						</div>
					</li>
					<li class="section detail-categories" ng-class="{'active':task.cats.length>0}">
						<div>
							<span class="icon icon-tag detail-categories" ng-class="{'icon-tag-active':task.cats.length>0}" />
							<!-- Edit line 1080 to show placeholder -->
							<div class="detail-categories-container">
								<!-- <ui-select
									multiple
									tagging
									tagging-label="<?php p($l->t('(New category)')); ?>"
									ng-model="task.cats"
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
							<div class="note-body selectable"
								ng-click="editNote($event, task)"
								oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
								<div class="content-fakeable" ng-class="{'editing':route.parameter=='note'}">
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
					@click="deleteTask">
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
import { mapState, mapGetters } from 'vuex'

export default {
	components: {
	},
	data: function() {
		return {}
	},
	computed: Object.assign(
		mapState({
		}),
		mapGetters({
			task: 'getTaskByRoute'
		})
	),
	methods: {
		closeDetails: function() {
			if (this.$route.params.calendarId) {
				this.$router.push({ path: `/calendars/${this.$route.params.calendarId}` })
			} else {
				this.$router.push({ path: `/collections/${this.$route.params.collectionId}` })
			}
		},

		deleteTask: function() {
			this.$store.dispatch('deleteTask', this.task.uri)
		},

		toggleCompleted: function() {
			this.$store.dispatch('toggleCompleted', this.task.uri)
		},

		toggleStarred: function() {
			this.$store.dispatch('toggleStarred', this.task.uri)
		},

		deleteDueDate: function() {
			this.$store.dispatch('deleteDueDate', this.task.uri)
		},

		deleteStartDate: function() {
			this.$store.dispatch('deleteStartDate', this.task.uri)
		},

		toggleAllDay: function() {
			this.$store.dispatch('toggleAllDay', this.task.uri)
		}
	}
}
</script>
