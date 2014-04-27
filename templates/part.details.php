<div ng-controller="DetailsController" ng-click="endEdit()" stop-event="click">
        <a class="detail-checkbox" ng-click="toggleCompleted(task.id)">
        	<span class="icon detail-checkbox" ng-class="{'detail-checked':task.completed}"></span>
        </a>
        <a class="detail-star" ng-click="toggleStarred(task.id)">
        	<span class="icon detail-star" ng-class="{'detail-starred':task.starred}"></span>
        </a>
    	<div class="title">
        	<span class="title-text" ng-class="{'strike-through':task.completed}" ng-click="editName()" stop-event="click"
            ng-hide="route.parameter=='name'" oc-click-focus="{selector: '#editName', timeout: 0}">{{ task.name }}</span>
            <div class="expandable-container" ng-show="route.parameter=='name'" stop-event="click">
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
                <div class="section-title" ng-class="{'overdue':isOverDue(task.start)}" ng-hide="route.parameter=='startdate'">
                    <text>{{ task.start | startDetails }}</text>
                </div>
                <a class="detail-delete" ng-click="deleteStartDate()" stop-event="click">
                    <span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-show="route.parameter=='startdate'">
                    <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.start | dateTaskList }}" datepicker="start">
                    <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.start | timeTaskList }}" timepicker="start" stop-event="click">
                </div>
            </div>
            <div class="section detail-date" ng-class="{'date':isDue(task.due), 'editing':route.parameter=='duedate'}" ng-click="editDueDate()" stop-event="click">
            <!-- oc-click-focus="{selector: 'div.detail-date input.datepicker-input', timeout: 0}" -->
            	<span class="icon detail-date" ng-class="{'overdue':isOverDue(task.due)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.due)}" ng-hide="route.parameter=='duedate'">
                    <text>{{ task.due | dateDetails }}</text>
                </div>
                <a class="detail-delete" ng-click="deleteDueDate()" stop-event="click">
                	<span class="icon detail-delete"></span>
                </a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-show="route.parameter=='duedate'">
    				<input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.due | dateTaskList }}" datepicker="due">
                    <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.due | timeTaskList }}" timepicker="due" stop-event="click">
                </div>
            </div>
            <div class="section detail-reminder" ng-class="{'date':isDue(task.reminder.date), 'editing':route.parameter=='reminder'}" ng-click="editReminder()" stop-event="click">
            <!-- oc-click-focus="{selector: 'div.detail-reminder input.datepicker-input', timeout: 0}" -->
            	<span class="icon detail-reminder" ng-class="{'overdue':isOverDue(task.reminder.date)}"></span>
                <div class="section-title" ng-class="{'overdue':isOverDue(task.reminder.date)}" ng-hide="route.parameter=='reminder'">
    				<text rel="">{{ task.reminder | reminderDetails:this }}</text>
    			</div>
                <!-- <div class="section-description" ng-hide="route.parameter=='reminder'">{{ task.reminder.date | dateDetailsShort }}</div> -->
                <a class="detail-delete" ng-click="deleteReminder()" stop-event="click">
    				<span class="icon detail-delete"></span>
    			</a>
                <span class="icon detail-save" ng-click="endEdit()" stop-event="click"></span>
                <div class="section-edit" ng-show="route.parameter=='reminder'" ng-switch='reminderType(task)'>
                    <div ng-switch-when="DATE-TIME">
                        <input class="datepicker-input medium focus" type="text" key-value="" placeholder="dd.mm.yyyy" value="{{ task.reminder.date | dateTaskList }}" datepicker="reminder">
                        <input class="timepicker-input medium focus" type="text" key-value="" placeholder="hh:mm" value="{{ task.reminder.date | timeTaskList }}" timepicker="reminder" stop-event="click">
                    </div>
                    <div ng-switch-when="DURATION">
                        <input class="datepicker-input medium focus" type="text" key-value="" placeholder="" value="">
                        <select ng-model="duration" ng-options="duration.name for duration in durations"></select>
                    </div>
                </div>
            </div>
            <!-- <ul class="subtasks buffer"></ul> -->
            <div class="note">
            	<div class="note-body selectable" ng-click="editNote()" stop-event="click" oc-click-focus="{selector: '.expandingArea textarea', timeout: 0}">
                    <!--
                    <a class="open-fullscreen-note">
                    	<span class="icon note-fullscreen"></span>
                    </a>
                    -->
                    <div class="content-fakeable">
                    	<div class="display-view" ng-hide="route.parameter=='note'">{{ task.note }}</div>
                        <div class="edit-view" ng-show="route.parameter=='note'">
                            <div class="expandingArea active">
                            	<pre><span>{{ task.note }}</span><br /><br /></pre>
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