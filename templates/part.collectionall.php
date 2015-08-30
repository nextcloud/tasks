<!-- <div ng-switch-when="starred || completed || all || today || current"> -->
<div ng-if="route.listID == 'starred' || route.listID == 'completed' || route.listID == 'all' || route.listID == 'today' || route.listID == 'current'">
    <div ng-repeat="list in lists | filter:filterLists()" class="grouped-tasks ui-droppable" rel="{{ list.id }}">
        <h2 class="heading">
            <text>{{ list.displayname }}</text>
        </h2>
        <ol class="tasks"
            listID="{{list.id}}"
            collectionID="{{route.listID}}"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropCallback(event, item, index)"
            dnd-dragover="dragover(event, item, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{task.id}}"
                ng-animate="'animate'"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,list.id) | filter:filterTasks(task,route.listID) | orderBy:sortDue | orderBy:'priority':true | orderBy:'completed_date':true"
                ng-click="openDetails(task.id,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-effect-allowed="move">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedAll(list.id) || route.listID != 'completed'">
            <span ng-click="getCompletedTasks(list.id)"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
