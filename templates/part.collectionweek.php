<div ng-if="route.listID=='week'">
    <div ng-repeat="day in days | filter:dayHasEntry(day)" class="grouped-tasks ui-droppable" rel="{{ list.id }}">
        <h2 class="heading">
            <text>{{ day | day  }}</text>
        </h2>
        <ol class="tasks">
            <li ng-animate="'animate'" ng-repeat="task in getTasksAtDay(tasks, day) | filter:filterTasksByString(task) | filter:{'completed':'false'} | orderBy:sortDue | orderBy:'priority':true"
            class="task-item ui-draggable handler" rel="{{ task.id }}" ng-click="openDetails(task.id,$event)" ng-class="{done: task.completed}" oc-drag-task>
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
    </div>
</div>