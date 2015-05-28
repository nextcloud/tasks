<div ng-app="Tasks" ng-cloak ng-controller="AppController" ng-click="closeAll($event)" id="tasks_wrapper" class="handler">
    <div id="app-navigation" ng-controller="ListController">
    	<div id="task_lists_header" class="header">
        	<div id="main-toolbar">
                <a id="loading" class="handler" ng-click="update()">
                    <span class="loading" ng-class="{'done':!isLoading()}"></span>
                </a>
            </div>
        </div>
    	<div id="task_lists_scroll" class="scroll">
        	<ul id="collection_filters">
            	<li ng-repeat="collection in collections" id="collection_{{ collection.id }}" rel="{{ collection.id }}"
                    ng-class="{'animate-up': hideCollection(collection.id), active: collection.id==route.listID}" oc-drop-task>
                	<a href="#/lists/{{ collection.id }}">
                		<span class="icon collection-{{ collection.id }}"><text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text></span>
                        <span class="count">{{ getCollectionString(collection.id) }}</span>
                		<span class="title"><text>{{ collection.displayname }}</text></span>
                    </a>
                </li>
            </ul>
            <ul id="collection_lists">
                <li ng-repeat="list in lists" id="list_{{ list.id }}" rel="{{ list.id }}" ng-class="{active: list.id==route.listID}" oc-drop-task>
                    <a href="#/lists/{{ list.id }}" style="border-right: 4px solid {{ list.calendarcolor }};">
                        <span class="icon list-list"></span>
                        <span class="count"><text ng-show="getListCount(list.id,'all')">{{ getListCount(list.id,'all') }}</text></span>
                        <span class="title">
                            <text ng-dblclick="editName(list.id)" oc-click-focus="{selector: 'input.edit', timeout: 0}">{{ list.displayname }}</text>
                        </span>
                    </a>
                    <input ng-model="list.displayname" class="edit handler" type="text" ng-show="route.listparameter=='name' && route.listID == list.id"
                    ng-keydown="checkName($event)">
                </li>
            </ul>
            <a class="addlist handler" ng-click="startAddingList()" oc-click-focus="{selector: '#newList', timeout: 0}">
                <span class="icon detail-add"></span>
                <span class="title"><text><?php p($l->t('Add List...')); ?></text></span>
                <input id="newList" ng-model="status.newListName" class="edit" type="text" ng-disabled="isAddingList" ng-show="status.addingList"
                placeholder="<?php p($l->t('New List')); ?>" ng-keydown="checkListInput($event)" />
            </a>
        </div>
        <div id="task_lists_footer" class="footer">
        	<a class="delete" ng-click="deleteList(route.listID)" ng-show="showDelete(route.listID)">
            	<span class="icon detail-trash"></span>
            </a>
            <a class="settings" ng-click="showSettings()">
                <span class="icon detail-settings"></span>
            </a>
        </div>
    </div>

    <div id="app-content" ng-controller="TasksController" ng-class="{'details-visible':route.taskID}">
        <div class="content-wrapper">
        	<div id="add-task" class="add-task handler" ng-show="showInput()" ng-class="{'focus':status.focusTaskInput}">
                <a class="input-star">
                    <span class="icon input-star "></span>
                </a>
                <a class="input-date">
                    <span class="icon input-date"></span>
                </a>
                <form ng-submit="addTask(taskName)" name="addTaskForm">
                    <input id="target" ng-disabled="isAddingTask" ng-click="focusInput()" class="transparent" placeholder="{{ getAddString() }}" ng-model="taskName"
                    ng-keydown="checkTaskInput($event)"/>
                </form>
            </div>
            <div class="task-list" ng-class="{'completed-hidden':!settingsmodel.getById('various').showHidden}">
                <?php print_unescaped($this->inc('part.tasklist')); ?>
                <?php print_unescaped($this->inc('part.collectionall')); ?>
                <?php print_unescaped($this->inc('part.collectionweek')); ?>
                <div id="searchresults"></div>
                <div class="task-item template">
                    <div class="task-body">
                        <div class="percentdone"></div>
                        <a class="task-checkbox" name="toggleCompleted" ng-click="toggleCompleted()">
                            <span class="icon task-checkbox"></span>
                        </a>
                        <a class="icon task-separator"></a>
                        <a class="task-star" ng-click="toggleStarred(task.id)">
                            <span class="icon task-star faded"></span>
                        </a>
                        <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a>
                        <div class="title-wrapper">
                            <span class="title"></span>
                            <span class="icon task-attachment"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="task-details" ng-class="{'details-visible':route.taskID}">
            <div class="content-wrapper">
                <?php print_unescaped($this->inc('part.details')); ?>
            </div>
        </div>
    </div>
    <script type="text/ng-template" id="part.settings.html">
        <?php print_unescaped($this->inc('part.settings')); ?>
    </script>
</div>