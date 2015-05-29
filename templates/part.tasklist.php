<!-- <div ng-switch-default> -->
<div ng-if="route.listID != 'week' && route.listID != 'starred' && route.listID != 'completed' && route.listID != 'all' && route.listID != 'today' && route.listID != 'current'">
    <div class="grouped-tasks">
        <ol class="tasks" rel="uncompleted" oc-drop-task>
            <li ng-repeat="(id, task) in tasks | filter:filterTasks(task,route.listID) | filter:{'completed':'false'} | filter:filterTasksByString(task) | orderBy:sortDue | orderBy:'starred':true"
            class="task-item ui-draggable handler" rel="{{ task.id }}" ng-click="openDetails(task.id)" ng-class="{done: task.completed}" oc-drag-task>
                <div class="task-body">
                    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{ getTaskColor(task.calendarid) }};"></div>
                    <a class="task-checkbox" name="toggleCompleted" ng-click="toggleCompleted(task.id)">
                        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
                    </a>
                    <a class="icon task-separator"></a>
                    <a class="task-star" ng-click="toggleStarred(task.id)">
                        <span class="icon task-star faded" ng-class="{'task-starred': task.starred}"></span>
                    </a>
                    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
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
            </li>
        </ol>
        <h2 class="heading-hiddentasks" ng-show="getCount(route.listID,'completed')">
            <span class="icon toggle-completed-tasks handler" ng-click="toggleHidden()"></span>
            <text class="handler" ng-click="toggleHidden()">{{ getCountString(route.listID,'completed') }}</text>
        </h2>
        <ol class="completed-tasks" rel="completed" oc-drop-task>
            <li ng-repeat="task in tasks | filter:filterTasks(task,route.listID) | filter:{'completed':'true'} | filter:filterTasksByString(task) | orderBy:'completed_date':true"
            class="task-item handler" rel="{{ task.id }}" ng-click="openDetails(task.id)"
            ng-class="{done: task.completed}" oc-drag-task>
                <div class="task-body">
                    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{ getTaskColor(task.calendarid) }};"></div>
                    <a class="task-checkbox" name="toggleCompleted" ng-click="toggleCompleted(task.id)">
                        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
                    </a>
                    <a class="icon task-separator"></a>
                    <a class="task-star" ng-click="toggleStarred(task.id)">
                        <span class="icon task-star faded" ng-class="{'task-starred': task.starred}"></span>
                    </a>
                    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
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
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedAll(route.listID)">
            <span ng-click="getCompletedTasks(route.listID)"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
