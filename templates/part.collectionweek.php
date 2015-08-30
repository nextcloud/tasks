<div ng-if="route.listID=='week'">
    <div ng-repeat="day in days | filter:dayHasEntry(day)" class="grouped-tasks ui-droppable">
        <h2 class="heading">
            <text>{{ day | day  }}</text>
        </h2>
        <ol class="tasks"
            listID=""
            collectionID="{{route.listID}}"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropCallback(event, item, index)"
            dnd-dragover="dragover(event, item, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{task.id}}"
                ng-animate="'animate'"
                ng-repeat="task in filtered = filteredTasks() | filter:taskAtDay(task,day) | filter:hasNoParent(task) | filter:{'completed':'false'} | orderBy:sortDue | orderBy:'priority':true"
                ng-click="openDetails(task.id,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-effect-allowed="move">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
    </div>
</div>
