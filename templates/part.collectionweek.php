<div ng-if="route.collectionID=='week'">
    <div ng-repeat="day in days | filter:dayHasEntry(day)" class="grouped-tasks ui-droppable">
        <h2 class="heading">
            <text>{{ day | day  }}</text>
        </h2>
        <ol class="tasks"
            listID=""
            collectionID="{{route.collectionID}}"
            type="list"
            dnd-list="draggedTasks"
            dnd-drop="dropAsRootTask(event, item, index)"
            dnd-dragover="dragover(event, index)">
            <li class="task-item ui-draggable handler"
                taskID="{{task.uri}}"
                ng-animate="'animate'"
                ng-repeat="task in filtered = filteredTasks() | filter:taskAtDay(task,day) | filter:hasNoParent(task) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"
                ng-click="openDetails(task.uri,$event)"
                ng-class="{done: task.completed}"
                dnd-draggable="task"
                dnd-dragstart="dragStart(event)"
                dnd-dragend="dragEnd(event)"
                dnd-effect-allowed="{{ allow(task) }}">
                <?php print_unescaped($this->inc('part.taskbody')); ?>
            </li>
        </ol>
    </div>
</div>
