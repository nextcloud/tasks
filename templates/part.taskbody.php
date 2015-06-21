<div class="task-body">
    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{ getTaskColor(task.calendarid) }};"></div>
    <a class="task-checkbox handler" name="toggleCompleted" ng-click="toggleCompleted(task.id)">
        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
    </a>
    <a class="icon task-separator"></a>
    <a class="task-star handler" ng-click="toggleStarred(task.id)">
        <span class="icon task-star faded" ng-class="{'high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5}"></span>
    </a>
    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
    <a ng-show="route.listID=='week'" class="listname" >{{ getTaskList(task.calendarid) }}</a>
    <div class="title-wrapper"  ng-class="{attachment: task.note!=''}">
        <span class="title">{{ task.name }}</span>
        <span class="icon task-attachment"></span>
        <span class="categories-list">
            <ul>
            <li ng-repeat="category in task.categories"><span>{{ category }}</span></li>
            </ul>
        </span>
    </div>
</div>