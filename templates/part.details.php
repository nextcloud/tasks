<div ng-controller="DetailsController" ng-click="endEdit()" stop-event="click">
        <a class="detail-checkbox" ng-click="toggleCompleted(task.id)">
        	<span class="icon detail-checkbox" ng-class="{'detail-checked':task.completed}"></span>
        </a>
        <a class="detail-star" ng-click="toggleStarred(task.id)">
        	<span class="icon detail-star" ng-class="{'detail-starred':task.starred}"></span>
        </a>
    	<div class="title">
        	<span class="title-text" ng-class="{'strike-through':task.completed}" ng-click="editName()" stop-event="click"
            ng-hide="route.parameter=='name'" oc-click-focus="{selector: '#editName', timeout: 0}">[[ task.name ]]</span>
            <div class="expandable-container" ng-show="route.parameter=='name'" stop-event="click">
            	<div class="expandingArea active">
                    <pre><span>[[ task.name ]]</span><br /></pre>
                    <textarea id="editName" maxlength="200" ng-model="task.name" ng-keydown="endName($event)"></textarea>
            	</div>
            </div>
        </div>
        <div class="body" watch-top ng-style="{top:divTop}">
            <div class="section detail-date" ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate'}" ng-click="editDueDate()" stop-event="click"
            oc-click-focus="{selector: 'div.detail-date input.datepicker-input', timeout: 0}">
            	<span class="icon detail-date" ng-class="{'overdue':isOverDue(task.due)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.due)}" ng-hide="route.parameter=='duedate'">
                    <text>[[ task.due | dateDetails ]]</text>
                </div>
                <a class="detail-delete" ng-click="deleteDueDate()" stop-event="click">
                	<span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-show="route.parameter=='duedate'">
    				<input class="datepicker-input medium focus" type="text" key-value="" value="[[ task.due | dateTaskList ]]" datepicker="due">
                </div>
            </div>
            <!--
            <div class="section detail-reminder" ng-class="{'date':isDue(task.reminder), 'editing':route.parameter=='reminder'}" ng-click="editReminder()" stop-event="click"
            oc-click-focus="{selector: 'div.detail-reminder input.datepicker-input', timeout: 0}">
            	<span class="icon detail-reminder" ng-class="{'overdue':isOverDue(task.reminder)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.reminder)}" ng-hide="route.parameter=='reminder'">
    				<text rel="">[[ task.reminder | timeDetails ]]</text>
    			</div>
                <div class="section-description">[[ task.reminder | dateDetailsShort ]]</div>
                <a class="detail-delete" ng-click="deleteReminder()" stop-event="click">
    				<span class="icon detail-delete"></span>
    			</a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-show="route.parameter=='reminder'">
                    <input class="datepicker-input medium focus" type="text" key-value="" value="[[ task.reminder | dateTaskList ]]" datepicker="reminder">
                </div>
            </div>
            <ul class="subtasks buffer">
            </ul>
            -->
            <div class="note">
            	<div class="note-body selectable" ng-click="editNote()" stop-event="click" oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
                    <!--
                    <a class="open-fullscreen-note">
                    	<span class="icon note-fullscreen"></span>
                    </a>
                    -->
                    <div class="content-fakeable">
                    	<div class="display-view" ng-hide="route.parameter=='note'">[[ task.note ]]</div>
                        <div class="edit-view" ng-show="route.parameter=='note'">
                            <div class="expandingArea active">
                            	<pre><span>[[ task.note ]]</span><br /><br /></pre>
                            	<textarea ng-model="task.note"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
        	<a class="detail-trash" ng-click="deleteTask(task.id)" stop-event="click">
            	<span class="icon detail-trash"></span>
            </a>
            <a class="detail-close" ng-click="closeDetails()" stop-event="click">
            	<span class="icon detail-close"></span>
            </a>
        </div>
</div>