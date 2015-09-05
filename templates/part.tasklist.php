<!-- <div ng-switch-default> -->
<div ng-if="route.listID != 'week' && route.listID != 'starred' && route.listID != 'completed' && route.listID != 'all' && route.listID != 'today' && route.listID != 'current'">
    <div class="grouped-tasks"
         ng-class="{'completed-hidden':!settingsmodel.getById('various').showHidden}">
        <ol class="tasks"
            listID="{{route.listID}}"
            collectionID="uncompleted"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropCallback(event, item, index)"
            dnd-dragover="dragover(event, item, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{ task.id }}"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.listID) | filter:{'completed':'false'} | orderBy:'1*id':true | orderBy:sortDue | orderBy:'priority':true"
                ng-click="openDetails(task.id,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-effect-allowed="move">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <h2 class="heading-hiddentasks icon-triangle-s handler" ng-show="getCount(route.listID,'completed')" ng-click="toggleHidden()">
            {{ getCountString(route.listID,'completed') }}
        </h2>
        <ol class="completed-tasks"
            listID="{{route.listID}}"
            collectionID="completed"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropCallback(event, item, index)"
            dnd-dragover="dragover(event, item, index)">
            <li class="task-item handler"
                taskID="{{ task.id }}"
                ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.listID) | filter:{'completed':'true'} | orderBy:'completed_date':true"
                ng-click="openDetails(task.id,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-effect-allowed="move">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedAll(route.listID)">
            <span ng-click="getCompletedTasks(route.listID)"><?php p($l->t('Load remaining completed tasks.')); ?></span>
        </div>
    </div>
</div>
