<div ng-controller="DetailsController" ng-click="endEdit()" stop-event="click">
    <div ng-show="TaskState()=='found'">
        <a class="detail-checkbox" ng-click="toggleCompleted(task.id)">
        	<span class="icon detail-checkbox" ng-class="{'detail-checked':task.completed}"></span>
        </a>
        <a class="detail-star" ng-click="toggleStarred(task.id)">
        	<span class="icon detail-star" ng-class="{'detail-starred':task.starred}"></span>
        </a>
    	<div class="title" ng-class="{'editing':route.parameter=='name'}">
        	<span class="title-text" ng-class="{'strike-through':task.completed}" ng-click="editName()" stop-event="click"
            oc-click-focus="{selector: '#editName', timeout: 0}">{{ task.name }}</span>
            <div class="expandable-container" stop-event="click">
            	<div class="expandingArea active">
                    <pre><span>{{ task.name }}</span><br /></pre>
                    <textarea id="editName" maxlength="200" ng-model="task.name" ng-keydown="endName($event)"></textarea>
            	</div>
            </div>
        </div>
        <div class="body" watch-top ng-style="{top:divTop}">
            <div class="section detail-start" ng-class="{'date':isDue(task.start), 'editing':route.parameter=='startdate'}" ng-click="editStart()" stop-event="click">
            <!-- oc-click-focus="{selector: 'div.detail-start input.datepicker-input', timeout: 0}" -->
                <span class="icon detail-start" ng-class="{'overdue':isOverDue(task.start)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.start)}">
                    <text>{{ task.start | startDetails }}</text>
                </div>
                <a class="detail-delete" ng-click="deleteStartDate()" stop-event="click">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit">
                    <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.start | dateTaskList }}" datepicker="start">
                    <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.start | timeTaskList }}" timepicker="start" stop-event="click">
                </div>
            </div>
            <div class="section detail-date" ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate'}" ng-click="editDueDate()" stop-event="click">
            <!-- oc-click-focus="{selector: 'div.detail-date input.datepicker-input', timeout: 0}" -->
            	<span class="icon detail-date" ng-class="{'overdue':isOverDue(task.due)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.due)}">
                    <text>{{ task.due | dateDetails }}</text>
                </div>
                <a class="detail-delete" ng-click="deleteDueDate()" stop-event="click">
                	<span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit">
    				<input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.due | dateTaskList }}" datepicker="due">
                    <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.due | timeTaskList }}" timepicker="due" stop-event="click">
                </div>
            </div>
            <div class="section detail-reminder" ng-class="{'date':isDue(task.reminder.date), 'editing':route.parameter=='reminder'}" ng-click="editReminder()" stop-event="click">
            <!-- oc-click-focus="{selector: 'div.detail-reminder input.datepicker-input', timeout: 0}" -->
            	<span class="icon detail-reminder" ng-class="{'overdue':isOverDue(task.reminder.date)}"></span>
                <span class="icon detail-remindertype" ng-click="changeReminderType(task)" ng-show="task.due || task.start"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.reminder.date)}">
    				<text rel="">{{ task.reminder | reminderDetails:this }}</text>
    			</div>
                <!-- <div class="section-description" ng-hide="route.parameter=='reminder'">{{ task.reminder.date | dateDetailsShort }}</div> -->
                <a class="detail-delete" ng-click="deleteReminder()" stop-event="click">
    				<span class="icon detail-delete"></span>
    			</a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-switch='reminderType(task)'>
                    <div ng-switch-when="DATE-TIME">
                        <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.reminder.date | dateTaskList }}" datepicker="reminder">
                        <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.reminder.date | timeTaskList }}" timepicker="reminder" stop-event="click">
                    </div>
                    <div ng-switch-when="DURATION">
                        <input ng-change="setReminderDuration(task.id)" class="duration-input medium focus" type="number" key-value="" placeholder="" ng-model="task.reminder.duration[task.reminder.duration.token]">
                        <select ng-model="task.reminder.duration.token" ng-options="duration.id as duration.names for duration in durations"></select>
                        <select ng-change="setReminderDuration(task.id)" ng-model="task.reminder.duration.params" ng-options="param as param.name for param in filterParams(params) track by param.id"></select>
                    </div>
                </div>
            </div>
            <div class="section detail-complete" ng-class="{'editing':route.parameter=='percent', 'date':task.complete>0}"  ng-click="editPercent()" stop-event="click">
                <span class="icon detail-percent"></span>
                <div class="section-title">
                    <text rel="">{{ task.complete | percentDetails}}</text>
                </div>
                <a class="detail-delete" ng-click="deletePercent()" stop-event="click">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit">
                    <input class="percent-input" type="text" ng-model="task.complete">
                    <input type="range" ng-model="task.complete" min="0" max="100" step ="1">
                </div>
            </div>
            <!-- <ul class="subtasks buffer"></ul> -->
            <div class="section detail-categories" ng-class="{'active':task.categories.length>0}">
                <span class="icon detail-categories"></span>
            <!-- Edit line 1080 to show placeholder -->
                <ui-select multiple tagging tagging-label="<?php p($l->t('(New category)')); ?> " ng-model="task.categories" theme="select2" ng-disabled="disabled" style="width: 100%;"
                 on-remove="removeCategory($item, $model)" on-select="addCategory($item, $model)">
                    <ui-select-match placeholder="<?php p($l->t('Select categories...')); ?>">{{$item}}</ui-select-match>
                    <ui-select-choices repeat="category in settingsmodel.getById('various').categories">
                      {{category}}
                    </ui-select-choices>
                </ui-select>
            </div>
            <div class="section detail-note">
                <div class="note">
                	<div class="note-body selectable" ng-click="editNote()" stop-event="click" oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
                        <!--
                        <a class="open-fullscreen-note">
                        	<span class="icon note-fullscreen"></span>
                        </a>
                        -->
                        <div class="content-fakeable" ng-class="{'editing':route.parameter=='note'}">
                        	<div class="display-view" clickableurl="task.note"></div>
                            <div class="edit-view">
                                <div class="expandingArea active">
                                	<pre><span>{{ task.note }}</span><br /><br /></pre>
                                	<textarea ng-model="task.note"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="section detail-comments">
                <ul>
                    <li ng-repeat="comment in task.comments" class="comment-item" rel=" {{ comment.id }} ">
                        <div class="avatar" avatar userID="{{ comment.userID }}" size="32"></div>
                        <a class="detail-delete" ng-click="deleteComment(comment.id)" stop-event="click" ng-show="settingsmodel.getById('various').userID == comment.userID">
                            <span class="icon detail-delete"></span>
                        </a>
                        <span class="username">{{ comment.name }}</span>
                        <div class="comment">{{ comment.comment }}</div>
                        <span class="time"> {{ comment.time | dateFromNow }} </span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <div class="detail-addcomment">
                <input type="text" placeholder="{{ commentStrings().input }}" ng-model="CommentContent" ng-keydown="sendComment($event)">
                <input type="button" ng-click="addComment()" name="addComment" value="{{ commentStrings().button }}" ng-class="{'active':CommentContent}">
            </div>
        	<a class="detail-trash" ng-click="deleteTask(task.id)" stop-event="click">
            	<span class="icon detail-trash"></span>
            </a>
            <a class="detail-close" ng-click="closeDetails()" stop-event="click">
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