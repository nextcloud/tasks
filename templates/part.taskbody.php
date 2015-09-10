<div class="task-body"
    type="task"
    taskID="{{ task.id }}"
    ng-class="{active: route.taskID==task.id, subtasks: hasSubtasks(task), subtaskshidden: task.hidesubtasks, attachment: task.note!=''}">
    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{ getTaskColor(task.calendarid) }};"></div>
    <a class="task-checkbox handler" name="toggleCompleted" ng-click="toggleCompleted(task.id)">
        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
    </a>
    <a class="icon task-separator"></a>
    <a class="task-star handler" ng-click="toggleStarred(task.id)">
        <span class="icon large task-star faded" ng-class="{'high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5}"></span>
    </a>
    <a class="task-addsubtask handler add-subtask" ng-click="showSubtaskInput(task.uid)" oc-click-focus="{selector: '.add-subtask input', timeout: 0}">
        <span class="icon large addsubtask" title="<?php p($l->t('add a subtask to')); ?> {{ task.name }}"></span>
    </a>
    <a class="handler"  ng-click="toggleSubtasks(task.id)">
        <span class="icon large subtasks"></span>
    </a>
    <a>
        <span class="icon large task-attachment"></span>
    </a>
    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
    <a ng-show="route.listID=='week'" class="listname" >{{ getTaskList(task.calendarid) }}</a>
    <div class="title-wrapper">
        <span class="title">{{ task.name }}</span>
        <span class="categories-list">
            <ul>
                <li ng-repeat="category in task.categories"><span>{{ category }}</span></li>
            </ul>
        </span>
    </div>
</div>
<div class="subtasks-container"
     ng-class="{subtaskshidden: task.hidesubtasks}">
    <ol dnd-list="draggedTasks"
        dnd-drop="dropCallback(event, item, index)"
        dnd-dragover="dragover(event, item, index)">
        <li class="task-item ui-draggable handler add-subtask"
            ng-show="status.addSubtaskTo == task.uid">
            <form ng-submit="addTask(status.subtaskName,task.uid,task.calendarid)" name="addTaskForm">
                <input class="transparent"
                    placeholder="{{ getSubAddString(task.name) }}"
                    ng-disabled="isAddingTask"
                    ng-click="focusInput()"
                    ng-model="status.subtaskName"
                    ng-keydown="checkTaskInput($event)"/>
            </form>
        </li>
        <li taskID="{{ task.id }}"
            class="task-item ui-draggable handler subtask"
            ng-repeat="task in getSubTasks(filtered,task) | orderBy:'1*id':true | orderBy:'priority':true | orderBy:'completed':false"
            ng-click="openDetails(task.id,$event)"
            ng-class="{done: task.completed}"
            ng-include="'part.taskbody'"
            dnd-draggable="task"
            dnd-effect-allowed="move"></li>
    </ol>
</div>
