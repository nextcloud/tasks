<div ng-switch-when="week">
    <div ng-repeat="day in days | filter:dayHasEntry(day)" class="grouped-tasks ui-droppable" rel="{{ list.id }}">
        <h2 class="heading">
            <text>{{ day | day  }}</text>
        </h2>
        <ol class="tasks">
            <li ng-animate="'animate'" ng-repeat="task in tasks | taskAtDay:day | filter:{'completed':'false'} | orderBy:sortDue | orderBy:'starred':true"
            class="task-item ui-draggable" rel="{{ task.id }}" ng-click="openDetails(task.id)" ng-class="{done: task.completed}" oc-drag-task stop-event="click">
                <div class="task-body">
                    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{task.calendarcolor}};"></div>
                    <a class="task-checkbox" name="toggleCompleted" ng-click="toggleCompleted(task.id)" stop-event="click">
                        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
                    </a>
                    <a class="icon task-separator"></a>
                    <a class="task-star" ng-click="toggleStarred(task.id)" stop-event="click">
                        <span class="icon task-star faded" ng-class="{'task-starred': task.starred}"></span>
                    </a>
                    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
                    <div class="title-wrapper"  ng-class="{attachment: task.note!=''}">
                        <span class="title">{{ task.name }}</span>
                        <span class="icon task-attachment"></span>
                    </div>
                </div>
            </li>
        </ol>
    </div>
</div>