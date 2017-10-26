<div ng-controller="DetailsController"
    ng-click="endEdit($event)"
    class="content-wrapper handler">
    <div class="flex-container"
        ng-show="TaskState()=='found'"
        ng-class="{'disabled': !task.calendar.writable}">
    	<div class="title" ng-class="{'editing':route.parameter=='name'}">
            <a class="checkbox reactive"
                ng-click="toggleCompleted(task)"
                role="checkbox"
                aria-checked="{{task.completed}}"
                aria-label="<?php p($l->t('Task is completed')); ?>">
            	<span class="icon detail-checkbox" ng-class="{'icon-checkmark':task.completed, 'disabled': !task.calendar.writable}"></span>
            </a>
            <a class="star reactive" ng-click="toggleStarred(task)">
            	<span class="icon icon-task-star"
                    ng-class="{'icon-task-star-high':task.priority>5,'icon-task-star-medium':task.priority==5,'icon-task-star-low':task.priority > 0 && task.priority < 5, 'disabled': !task.calendar.writable}"></span>
            </a>
        	<div class="title-text handler"
                ng-class="{'strike-through':task.completed}"
                ng-click="editName($event, task)"
                oc-click-focus="{selector: '#editName', timeout: 0}"
                ng-bind-html="task.summary | linky:'_blank':{rel: 'nofollow'}">
            </div>
            <div class="expandable-container handler">
            	<div class="expandingArea active">
                    <pre><span>{{ task.summary }}</span><br /></pre>
                    <textarea id="editName"
                        maxlength="200"
                        ng-model="task.summary"
                        ng-keydown="endName($event)"
                        ng-change="triggerUpdate(task)">
                    </textarea>
            	</div>
            </div>
        </div>
        <div class="body">
            <ul class="sections">
                <li class="section detail-start handler"
                    ng-class="{'date':isDue(task.start), 'editing':route.parameter=='startdate', 'high':isOverDue(task.start)}"
                    ng-click="editStart($event, task)">
                    <div>
                        <span class="icon icon-calendar" ng-class="{'icon-calendar-due':isDue(task.start),
                         'icon-calendar-overdue':isOverDue(task.start)}"></span>
                        <span class="section-title">
                            <text>{{ task.start | startDetails }}</text>
                        </span>
                        <div class="section-edit">
                            <input class="datepicker-input medium"
                                type="text"
                                key-value=""
                                placeholder="dd.mm.yyyy"
                                value="{{ task.start | dateTaskList }}"
                                datepicker="start">
                            <input class="timepicker-input medium handler"
                                ng-hide="task.allDay"
                                type="text"
                                key-value=""
                                placeholder="hh:mm"
                                value="{{ task.start | timeTaskList }}"
                                timepicker="start">
                        </div>
                   </div>
                   <div class="utils">
                        <a>
                            <span class="icon detail-save icon-checkmark-color handler end-edit reactive"></span>
                        </a>
                        <a class="handler end-edit" ng-click="deleteStartDate(task)">
                            <span class="icon icon-trash reactive"></span>
                        </a>
                    </div>
                </li>
                <li class="section detail-date handler"
                    ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate', 'high':isOverDue(task.due)}"
                    ng-click="editDueDate($event, task)">
                    <div>
                    	<span class="icon icon-calendar" ng-class="{'icon-calendar-due':isDue(task.due), 'icon-calendar-overdue':isOverDue(task.due)}"></span>
                        <span class="section-title">
                            <text>{{ task.due | dateDetails }}</text>
                        </span>
                        <div class="section-edit">
                            <input class="datepicker-input medium"
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
                                timepicker="due">
                        </div>
                    </div>
                    <div class="utils">
                        <a>
                            <span class="icon detail-save icon-checkmark-color handler end-edit reactive"></span>
                        </a>
                        <a class="handler end-edit" ng-click="deleteDueDate(task)">
                            <span class="icon icon-trash reactive"></span>
                        </a>
                    </div>
                </li>
                <li class="section detail-all-day handler reactive"
                    ng-click="toggleAllDay(task)"
                    ng-if="isAllDayPossible(task)"
                    role="checkbox"
                    aria-checked="{{task.allDay}}">
                    <div>
                        <span class="icon detail-checkbox" ng-class="{'icon-checkmark': task.allDay, 'disabled': !task.calendar.writable}"></span>
                        <span class="section-title">
                            <text><?php p($l->t('All day')); ?></text>
                        </span>
                    </div>
                </li>
                <li class="section detail-priority handler"
                    ng-class="{'editing':route.parameter=='priority','high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5, 'date':task.priority>0}"
                    ng-click="editPriority($event, task)">
                    <div>
                        <span class="icon icon-task-star"
                            ng-class="{'icon-task-star-high':task.priority>5,'icon-task-star-medium':task.priority==5,'icon-task-star-low':task.priority > 0 && task.priority < 5}"></span>
                        <span class="section-title">
                            <text>{{ task.priority | priorityDetails}}</text>
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
                            <span class="icon detail-save icon-checkmark-color handler end-edit reactive"></span>
                        </a>
                        <a class="handler end-edit" ng-click="deletePriority(task)">
                            <span class="icon icon-trash reactive"></span>
                        </a>
                </li>
                <li class="section detail-complete handler"
                    ng-class="{'editing':route.parameter=='percent', 'date':task.complete>0}"
                    ng-click="editPercent($event, task)">
                    <div>
                        <span class="icon icon-percent" ng-class="{'icon-percent-active':task.complete>0}"></span>
                        <span class="section-title">
                            <text>{{ task.complete | percentDetails}}</text>
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
                            <span class="icon detail-save icon-checkmark-color handler end-edit reactive"></span>
                        </a>
                        <a class="handler end-edit" ng-click="deletePercent(task)">
                            <span class="icon icon-trash reactive"></span>
                        </a>
                    </div>
                </li>
                <li class="section detail-categories" ng-class="{'active':task.cats.length>0}">
                    <div>
                        <span class="icon icon-tag detail-categories" ng-class="{'icon-tag-active':task.cats.length>0}"></span>
                    <!-- Edit line 1080 to show placeholder -->
                        <div class="detail-categories-container">
                            <ui-select
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
                            </ui-select>
                        </div>
                    </div>
                </li>
                <li class="section detail-note">
                    <div class="note">
                    	<div class="note-body selectable handler"
                            ng-click="editNote($event, task)"
                            oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
                            <div class="content-fakeable" ng-class="{'editing':route.parameter=='note'}">
                            	<div class="display-view" ng-bind-html="task.note | linky:'_blank':{rel: 'nofollow'}"></div>
                                <div class="edit-view">
                                    <div class="expandingArea active">
                                    	<pre><span>{{ task.note }}</span><br /><br /></pre>
                                    	<textarea ng-model="task.note" ng-change="triggerUpdate(task)"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="footer">
        	<a class="handler left close-all reactive"
                ng-click="deleteTask(task)"
                ng-show="task.calendar.writable">
            	<span class="icon icon-trash"></span>
            </a>
            <a class="handler right close-all reactive">
            	<span class="icon icon-hide"></span>
            </a>
        </div>
    </div>
    <div ng-show="TaskState()=='loading'" class="notice">
        <?php p($l->t('Loading the task...')); ?>
        <div class="loading" style="height: 50px;"></div>
    </div>
    <div ng-show="TaskState()==null" class="notice">
        <?php p($l->t('Task not found!')); ?>
    </div>
</div>
