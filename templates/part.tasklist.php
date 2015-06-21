<!-- <div ng-switch-default> -->
<div ng-if="route.listID != 'week' && route.listID != 'starred' && route.listID != 'completed' && route.listID != 'all' && route.listID != 'today' && route.listID != 'current'">
    <div class="grouped-tasks" ng-class="{'completed-hidden':!settingsmodel.getById('various').showHidden}">
        <ol class="tasks" rel="uncompleted" oc-drop-task>
            <li ng-repeat="(id, task) in tasks | filter:filterTasks(task,route.listID) | filter:{'completed':'false'} | filter:filterTasksByString(task) | orderBy:sortDue | orderBy:'priority':true"
            class="task-item ui-draggable handler" rel="{{ task.id }}" ng-click="openDetails(task.id,$event)" ng-class="{done: task.completed}" oc-drag-task>
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <h2 class="heading-hiddentasks" ng-show="getCount(route.listID,'completed')">
            <span class="icon toggle-completed-tasks handler" ng-click="toggleHidden()"></span>
            <text class="handler" ng-click="toggleHidden()">{{ getCountString(route.listID,'completed') }}</text>
        </h2>
        <ol class="completed-tasks" rel="completed" oc-drop-task>
            <li ng-repeat="task in tasks | filter:filterTasks(task,route.listID) | filter:{'completed':'true'} | filter:filterTasksByString(task) | orderBy:'completed_date':true"
            class="task-item handler" rel="{{ task.id }}" ng-click="openDetails(task.id,$event)"
            ng-class="{done: task.completed}" oc-drag-task>
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
        <div class="loadmore handler" ng-hide="loadedAll(route.listID)">
            <span ng-click="getCompletedTasks(route.listID)"> <?php p($l->t('Load remaining completed tasks.')); ?> </span>
        </div>
    </div>
</div>
