<!-- <div ng-switch-default> -->
<div ng-if="route.collectionID != 'week' && route.collectionID != 'starred' && route.collectionID != 'completed' && route.collectionID != 'all' && route.collectionID != 'today' && route.collectionID != 'current'">
    <div class="grouped-tasks"
         ng-class="{'completed-hidden':!settingsmodel.getById('various').showHidden}">
        <ol class="tasks"
            calendarID="{{route.calendarID}}"
            collectionID="uncompleted"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropAsRootTask(event, item, index)"
            dnd-dragover="dragover(event, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{ task.uri }}"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"
                ng-click="openDetails(task.uri,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-dragstart="dragStart(event)"
                dnd-dragend="dragEnd(event)"
                dnd-effect-allowed="{{ allow(task) }}">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <h2 class="heading-hiddentasks icon-triangle-s handler" ng-show="getCount(route.calendarID,'completed')" ng-click="toggleHidden()">
            {{ getCountString(route.calendarID,'completed') }}
        </h2>
        <ol class="completed-tasks"
            calendarID="{{route.calendarID}}"
            collectionID="completed"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropAsRootTask(event, item, index)"
            dnd-dragover="dragover(event, index)">
            <li class="task-item handler"
                taskID="{{ task.uri }}"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':true} | orderBy:'completed_date':true"
                ng-click="openDetails(task.uri,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-dragstart="dragStart(event)"
                dnd-dragend="dragEnd(event)"
                dnd-effect-allowed="{{ allow(task) }}">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedCompleted(route.calendarID)">
            <span ng-click="getCompletedTasks(route.calendarID)"><?php p($l->t('Load remaining completed tasks.')); ?></span>
        </div>
    </div>
</div>
