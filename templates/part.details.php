<div ng-controller="DetailsController" ng-click="endEdit($event)" class="handler">
    <div ng-show="TaskState()=='found'" ng-class="{'disabled': !task.calendar.writable}">
        <a class="detail-checkbox" ng-click="toggleCompleted(task)" role="checkbox" aria-checked="{{task.completed}}" aria-label="<?php p($l->t('Task is completed')); ?>">
        	<span class="icon detail-checkbox" ng-class="{'detail-checked':task.completed, 'disabled': !task.calendar.writable}"></span>
        </a>
        <a class="detail-star" ng-click="toggleStarred(task)">
        	<span class="icon detail-star" ng-class="{'high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5, 'disabled': !task.calendar.writable}"></span>
        </a>
    	<div class="title" ng-class="{'editing':route.parameter=='name'}">
        	<span class="title-text handler" ng-class="{'strike-through':task.completed}" ng-click="editName($event, task)"
            oc-click-focus="{selector: '#editName', timeout: 0}" ng-bind-html="task.summary | linky:'_blank':{rel: 'nofollow'}"></span>
            <div class="expandable-container handler">
            	<div class="expandingArea active">
                    <pre><span>{{ task.summary }}</span><br /></pre>
                    <textarea id="editName" maxlength="200" ng-model="task.summary" ng-keydown="endName($event)" ng-change="triggerUpdate(task)"></textarea>
            	</div>
            </div>
        </div>
        <div class="body" watch-top ng-style="{top:divTop}">
            <div class="section detail-start handler" ng-class="{'date':isDue(task.start), 'editing':route.parameter=='startdate'}" ng-click="editStart($event, task)">
            <!-- oc-click-focus="{selector: 'div.detail-start input.datepicker-input', timeout: 0}" -->
                <span class="icon detail-start" ng-class="{'overdue':isOverDue(task.start)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.start)}">
                    <text>{{ task.start | startDetails }}</text>
                </div>
                <a class="detail-delete handler end-edit" ng-click="deleteStartDate(task)">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save handler end-edit"></span>
                <div class="section-edit">
                    <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.start | dateTaskList }}" datepicker="start">
                    <input class="timepicker-input medium focus handler" ng-hide="task.allDay" type="text" key-value="" placeholder="hh:mm" value="{{ task.start | timeTaskList }}" timepicker="start">
                </div>
            </div>
            <div class="section detail-date handler" ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate'}" ng-click="editDueDate($event, task)">
            <!-- oc-click-focus="{selector: 'div.detail-date input.datepicker-input', timeout: 0}" -->
            	<span class="icon detail-date" ng-class="{'overdue':isOverDue(task.due)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.due)}">
                    <text>{{ task.due | dateDetails }}</text>
                </div>
                <a class="detail-delete handler end-edit" ng-click="deleteDueDate(task)">
                	<span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save handler end-edit"></span>
                <div class="section-edit">
    				<input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.due | dateTaskList }}" datepicker="due">
                    <input class="timepicker-input medium focus" ng-hide="task.allDay" type="text" key-value="" placeholder="hh:mm" value="{{ task.due | timeTaskList }}" timepicker="due">
                </div>
            </div>
            <div class="section detail-all-day handler" ng-click="toggleAllDay(task)" ng-if="isAllDayPossible(task)" role="checkbox" aria-checked="{{task.allDay}}">
                    <span class="icon detail-checkbox disabled" ng-class="{'detail-checked': task.allDay, 'disabled': !task.calendar.writable}"></span>
                    <div class="section-title">
                        <text><?php p($l->t('All day')); ?></text>
                    </div>
            </div>

<!--             <div class="section detail-reminder handler" ng-class="{'date':isDue(task.reminder.date), 'editing':route.parameter=='reminder'}" ng-click="editReminder($event, task)">
            	<span class="icon detail-reminder" ng-class="{'overdue':isOverDue(task.reminder.date)}"></span>
                <span class="icon detail-remindertype" ng-click="changeReminderType(task)" ng-show="task.due || task.start"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.reminder.date)}">
    				<text rel="">{{ task.reminder | reminderDetails:this }}</text>
    			</div>
                <a class="detail-delete handler end-edit" ng-click="deleteReminder()">
    				<span class="icon detail-delete"></span>
    			</a>
                <span class="icon detail-save handler end-edit"></span>
                <div class="section-edit" ng-switch='reminderType(task)'>
                    <div ng-switch-when="DATE-TIME">
                        <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.reminder.date | dateTaskList }}" datepicker="reminder">
                        <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.reminder.date | timeTaskList }}" timepicker="reminder">
                    </div>
                    <div ng-switch-when="DURATION">
                        <input ng-change="setReminderDuration(task)" class="duration-input medium focus" type="number" key-value="" placeholder="" ng-model="task.reminder.duration[task.reminder.duration.token]">
                        <select ng-model="task.reminder.duration.token" ng-options="duration.id as duration.names for duration in durations"></select>
                        <select ng-change="setReminderDuration(task)" ng-model="task.reminder.duration.params" ng-options="param as param.name for param in filterParams(params) track by param.id"></select>
                    </div>
                </div>
            </div> -->
            <div class="section detail-priority handler" ng-class="{'editing':route.parameter=='priority','high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5, 'date':task.priority>0}"  ng-click="editPriority($event, task)">
                <span class="icon detail-priority"></span>
                <div class="section-title">
                    <text>{{ task.priority | priorityDetails}}</text>
                </div>
                <a class="detail-delete handler end-edit" ng-click="deletePriority(task)">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save handler end-edit"></span>
                <div class="section-edit">
                    <input class="priority-input" type="text" ng-model="task.priority" ng-change="triggerUpdate(task)">
                    <input type="range" ng-model="task.priority" min="0" max="9" step ="1" ng-change="triggerUpdate(task)">
                </div>
            </div>
            <div class="section detail-complete handler" ng-class="{'editing':route.parameter=='percent', 'date':task.complete>0}"  ng-click="editPercent($event, task)">
                <span class="icon detail-percent"></span>
                <div class="section-title">
                    <text>{{ task.complete | percentDetails}}</text>
                </div>
                <a class="detail-delete handler end-edit" ng-click="deletePercent(task)">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save handler end-edit"></span>
                <div class="section-edit">
                    <input class="percent-input" type="text" ng-model="task.complete" ng-change="setPercentComplete(task, task.complete)">
                    <input type="range" ng-model="task.complete" min="0" max="100" step ="1" ng-change="setPercentComplete(task, task.complete)">
                </div>
            </div>
            <!-- <ul class="subtasks buffer"></ul> -->
            <div class="section detail-categories" ng-class="{'active':task.cats.length>0}">
                <span class="icon detail-categories"></span>
            <!-- Edit line 1080 to show placeholder -->
                <ui-select multiple tagging tagging-label="<?php p($l->t('(New category)')); ?> " ng-model="task.cats" theme="select2" ng-disabled="!task.calendar.writable" style="width: 100%;"
                 on-remove="removeCategory($item, $model)" on-select="addCategory($item, $model)">
                    <ui-select-match placeholder="<?php p($l->t('Select categories...')); ?>">{{$item}}</ui-select-match>
                    <ui-select-choices repeat="category in settingsmodel.getById('various').categories | filter:$select.search">
                      {{category}}
                    </ui-select-choices>
                </ui-select>
            </div>
            <div class="section detail-note">
                <div class="note">
                	<div class="note-body selectable handler" ng-click="editNote($event, task)" oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
                        <!--
                        <a class="open-fullscreen-note">
                        	<span class="icon note-fullscreen"></span>
                        </a>
                        -->
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
            </div>
<!--             <div class="section detail-comments">
                <ul>
                    <li ng-repeat="comment in task.comments" class="comment-item" rel=" {{ comment.id }} ">
                        <div class="avatar" avatar userID="{{ comment.userID }}" size="32"></div>
                        <a class="detail-delete end-edit" ng-click="deleteComment(comment.id)" ng-show="settingsmodel.getById('various').userID == comment.userID">
                            <span class="icon detail-delete"></span>
                        </a>
                        <span class="username">{{ comment.name }}</span>
                        <div class="comment" ng-bind-html="comment.comment | linky:'_blank':{rel: 'nofollow'}"></div>
                        <span class="time"> {{ comment.time | dateFromNow }} </span>
                    </li>
                </ul>
            </div> -->
        </div>
        <div class="footer">
<!--             <div class="detail-addcomment">
                <input type="text" placeholder="{{ commentStrings().input }}" ng-model="CommentContent" ng-keydown="sendComment($event)">
                <input type="button" ng-click="addComment()" name="addComment" value="{{ commentStrings().button }}" ng-class="{'active':CommentContent}">
            </div> -->
        	<a class="detail-trash handler close-all" ng-click="deleteTask(task)" ng-show="task.calendar.writable">
            	<span class="icon detail-trash"></span>
            </a>
            <a class="detail-close handler close-all">
            	<span class="icon detail-close"></span>
            </a>
        </div>
    </div>
    <div  ng-show="TaskState()=='loading'" class="notice">
        <?php p($l->t('Loading the task...')); ?>
        <div class="loading" style="height: 50px;"></div>
    </div>
    <div  ng-show="TaskState()==null" class="notice">
        <?php p($l->t('Task not found!')); ?>
    </div>
</div>
