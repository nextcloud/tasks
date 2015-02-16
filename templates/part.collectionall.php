<div ng-switch-when="starred || completed || all || today || current">
    <div ng-repeat="list in lists | filter:filterLists()" class="grouped-tasks ui-droppable" rel="{{ list.id }}" oc-drop-task>
        <h2 class="heading">
            <text>{{ list.displayname }}</text>
        </h2>
        <ol class="tasks">
            <li ng-animate="'animate'" ng-repeat="task in tasks | filter:filterTasks(task,list.id) | filter:filterTasks(task,route.listID) | filter:filterTasksByString(task) | orderBy:sortDue | orderBy:'starred':true | orderBy:'completed_date':true"
            class="task-item ui-draggable" rel="{{ task.id }}" ng-click="openDetails(task.id)" ng-class="{done: task.completed}" oc-drag-task stop-event="click">
                <div class="task-body">
                    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{list.calendarcolor}};"></div>
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
        <div class="loadmore" ng-hide="loadedAll(list.id) || route.listID != 'completed'">
            <span ng-click="getCompletedTasks(list.id)" stop-event="click"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
