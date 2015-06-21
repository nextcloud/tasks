<!-- <div ng-switch-when="starred || completed || all || today || current"> -->
<div ng-if="route.listID == 'starred' || route.listID == 'completed' || route.listID == 'all' || route.listID == 'today' || route.listID == 'current'">
    <div ng-repeat="list in lists | filter:filterLists()" class="grouped-tasks ui-droppable" rel="{{ list.id }}" oc-drop-task>
        <h2 class="heading">
            <text>{{ list.displayname }}</text>
        </h2>
        <ol class="tasks">
            <li ng-animate="'animate'" ng-repeat="task in tasks | filter:filterTasks(task,list.id) | filter:filterTasks(task,route.listID) | filter:filterTasksByString(task) | orderBy:sortDue | orderBy:'priority':true | orderBy:'completed_date':true"
            class="task-item ui-draggable handler" rel="{{ task.id }}" ng-click="openDetails(task.id,$event)" ng-class="{done: task.completed}" oc-drag-task>
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedAll(list.id) || route.listID != 'completed'">
            <span ng-click="getCompletedTasks(list.id)"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
