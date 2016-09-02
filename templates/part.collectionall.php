<!-- <div ng-switch-when="starred || completed || all || today || current"> -->
<div ng-if="route.collectionID == 'starred' || route.collectionID == 'completed' || route.collectionID == 'all' || route.collectionID == 'today' || route.collectionID == 'current'">
    <div ng-repeat="calendar in calendars | filter:filterLists()" class="grouped-tasks ui-droppable" rel="{{ calendar.uri }}">
        <h2 class="heading">
            <text>{{ calendar.displayname }}</text>
        </h2>
        <ol class="tasks"
            calendarID="{{calendar.uri}}"
            collectionID="{{route.collectionID}}"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropAsRootTask(event, item, index)"
            dnd-dragover="dragover(event, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{task.uri}}"
                ng-animate="'animate'"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,calendar.uri) | filter:filterTasks(task,route.collectionID) | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"
                ng-click="openDetails(task.uri,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-dragstart="dragStart(event)"
                dnd-dragend="dragEnd(event)"
                dnd-effect-allowed="{{ allow(task) }}">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedCompleted(calendar.uri) || route.collectionID != 'completed'">
            <span ng-click="getCompletedTasks(calendar.uri)"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
