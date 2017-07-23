<div class="task-body"
    type="task"
    taskID="{{ task.uri }}"
    ng-class="{active: route.taskID==task.uri, subtasks: hasSubtasks(task), completedsubtasks: hasCompletedSubtasks(task), subtaskshidden: task.hideSubtasks, attachment: task.note!=''}">
    <div class="percentdone" style="width:{{ task.complete }}%; background-color:{{ task.calendar.color }};" aria-label="{{ task.complete | percentDetails}}"></div>
    <a class="task-checkbox handler" name="toggleCompleted" ng-click="toggleCompleted(task)" role="checkbox" aria-checked="{{task.completed}}" aria-label="<?php p($l->t('Task is completed')); ?>">
        <span class="icon task-checkbox" ng-class="{'task-checked': task.completed}"></span>
    </a>
    <a class="icon task-separator"></a>
    <a class="task-star handler" ng-click="toggleStarred(task)">
        <span class="icon large task-star faded" ng-class="{'high':task.priority>5,'medium':task.priority==5,'low':task.priority > 0 && task.priority < 5}"></span>
    </a>
    <a class="task-addsubtask handler add-subtask" ng-show="task.calendar.writable" ng-click="showSubtaskInput(task.uid)" oc-click-focus="{selector: '.add-subtask input', timeout: 0}">
        <span class="icon large addsubtask" title="<?php p($l->t('add a subtask to')); ?> {{ task.summary }}"></span>
    </a>
    <a class="handler"  ng-click="toggleSubtasks(task)">
        <span class="icon large subtasks" title="<?php p($l->t('Toggle subtasks')); ?>"></span>
    </a>
    <a class="handler"  ng-click="toggleCompletedSubtasks(task)">
        <span class="icon large toggle-completed-subtasks" ng-class="{'hidden': task.hideCompletedSubtasks}" title="<?php p($l->t('Toggle completed subtasks')); ?>"></span>
    </a>
    <a>
        <span class="icon large task-attachment"></span>
    </a>
    <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
    <a ng-show="route.collectionID=='week'" class="listname" >{{ task.calendar.displayname }}</a>
    <div class="title-wrapper">
        <span class="title" ng-bind-html="task.summary | linky:'_blank':{rel: 'nofollow'}"></span>
        <span class="categories-list">
            <ul>
                <li ng-repeat="category in task.categories"><span>{{ category }}</span></li>
            </ul>
        </span>
    </div>
</div>
<div class="subtasks-container"
     ng-class="{subtaskshidden: hideSubtasks(task)}">
    <ol dnd-list="draggedTasks"
        calendarID="{{task.calendar.uri}}"
        dnd-drop="dropAsSubtask(event, item, index)"
        dnd-dragover="dragover(event, index)">
        <li class="task-item ui-draggable handler add-subtask"
            ng-show="status.addSubtaskTo == task.uid">
            <form ng-submit="addTask(status.subtaskName,task.uid,task.calendar,task)" name="addTaskForm">
                <input class="transparent"
                    placeholder="{{ getSubAddString(task.summary) }}"
                    ng-disabled="isAddingTask"
                    ng-click="focusInput()"
                    ng-model="status.subtaskName"
                    ng-keydown="checkTaskInput($event)"/>
            </form>
        </li>
        <li taskID="{{ task.uri }}"
            class="task-item ui-draggable handler subtask"
            ng-repeat="task in getSubTasks(filtered,task) | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"
            ng-click="openDetails(task.uri,$event)"
            ng-class="{done: task.completed}"
            ng-include="'part.taskbody'"
            dnd-draggable="task"
            dnd-dragstart="dragStart(event)"
            dnd-dragend="dragEnd(event)"
            dnd-effect-allowed="{{ allow(task) }}">
        </li>
    </ol>
</div>
