<div ng-app="Tasks" ng-cloak ng-controller="AppController" ng-click="closeAll($event)" id="app" class="handler">
    <div id="app-navigation" ng-controller="ListController">
        <ul id="collections">
            <li id="collection_{{ collection.id }}"
                class="collection"
                collectionID="{{collection.id}}"
                ng-repeat="collection in collections"
                ng-class="{'animate-up': hideCollection(collection.id), active: collection.id==route.listID}"
                dnd-list="draggedTasks"
                dnd-drop="dropCollection(event, item, index)"
                dnd-dragover="dragoverCollection(event, item, index)">
                <a href="#/lists/{{ collection.id }}">
                    <span class="icon collection-{{ collection.id }}">
                        <text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text>
                    </span>
                    <span class="title">{{ collection.displayname }}</span>
                </a>
                <div class="app-navigation-entry-utils">
                    <ul>
                        <li class="app-navigation-entry-utils-counter">{{ getCollectionString(collection.id) | counterFormatter }}</li>
                    </ul>
                </div>
            </li>
            <li class="list with-menu handler"
                id="list_{{ list.id }}"
                listID="{{list.id}}"
                ng-repeat="list in lists"
                ng-class="{active: list.id==route.listID, edit:route.listparameter == 'name' && route.listID == list.id}"
                dnd-list="draggedTasks"
                dnd-drop="dropList(event, item, index)"
                dnd-dragover="dragoverList(event, item, index)">
                <a href="#/lists/{{ list.id }}" style="border-right: 4px solid {{ list.calendarcolor }};" ng-dblclick="editName(list.id)">
                    <span class="icon list-list"></span>
                    <span class="title">{{ list.displayname }}</span>
                </a>
                <div class="app-navigation-entry-utils">
                    <ul>
                        <li class="app-navigation-entry-utils-counter">{{ getListCount(list.id,'all') | counterFormatter }}</li>
                        <li class="app-navigation-entry-utils-menu-button svg"><button></button></li>
                    </ul>
                </div>
                <div class="app-navigation-entry-menu">
                    <ul>
                        <li title="<?php p($l->t('rename')); ?>" ng-click="editName(list.id)" >
                            <img class="icon-rename svg" src="<?php p(image_path('core', 'actions/rename.svg'))?>"/>
                            <span><?php p($l->t('rename')); ?></span>
                        </li>
                        <li title="<?php p($l->t('delete')); ?>" ng-click="deleteList(list.id)" ng-show="showDelete(list.id)" >
                            <img class="icon-delete svg" src="<?php p(image_path('core', 'actions/delete.svg'))?>"/>
                            <span><?php p($l->t('delete')); ?></span>
                        </li>
                    </ul>
                </div>
                <div class="app-navigation-entry-edit">
                    <form>
                        <input ng-model="list.displayname" class="edit" type="text" ng-keydown="checkName($event)" autofocus-on-insert>
                        <input type="submit" value="" class="action icon-checkmark svg" ng-click="submitNewName()">
                    </form>
                </div>
            </li>
            <li class="newList handler" ng-class="{edit: status.addingList}">
                <a class="addlist" ng-click="startAddingList()" oc-click-focus="{selector: '#newList', timeout: 0}">
                    <span class="icon detail-add"></span>
                    <span class="title"><?php p($l->t('Add List...')); ?></span>
                </a>
                <div class="app-navigation-entry-edit">
                    <form ng-disabled="isAddingList">
                        <input id="newList" ng-model="status.newListName" class="edit" type="text" autofocus-on-insert
                        placeholder="<?php p($l->t('New List')); ?>" ng-keydown="checkListInput($event)" >
                        <input type="submit" value="" class="action icon-checkmark svg" ng-click="submitNewList($event)">
                    </form>
                </div>
            </li>
        </ul>
        <div id="app-settings" ng-controller="SettingsController">
            <div id="app-settings-header">
                <button class="settings-button" data-apps-slide-toggle="#app-settings-content">
                    <span><?php p($l->t('Settings')); ?></span>
                </button>
            </div>
            <div id="app-settings-content">
                <ul>
                    <li>
                        <label for="startOfWeek"><?php p($l->t('Start of week')); ?></label>
                        <select id="startOfWeek" ng-change="setStartOfWeek()" ng-model="settingsmodel.getById('various').startOfWeek" ng-options="startOfWeekOption.id as startOfWeekOption.name for startOfWeekOption in startOfWeekOptions"></select>
                    </li>
                    <li class="headline">
                        <?php p($l->t('Visibility of Smart Collections')); ?>
                    </li>
                    <li ng-repeat="collection in collections">
                        <span class="icon collection-{{ collection.id }}"><text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text></span>
                        <label for="visibilityCollection-{{collection.id}}" class="title">{{ collection.displayname }}</label>
                        <select id="visibilityCollection-{{collection.id}}" ng-change="setVisibility(collection.id)" ng-model="collection.show" ng-options="collectionOption.id as collectionOption.name for collectionOption in collectionOptions"></select>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div id="app-content" ng-controller="TasksController" ng-class="{'details-visible':route.taskID}">
        <div class="content-wrapper">
        	<div id="add-task" class="add-task handler" ng-show="showInput()" ng-class="{'focus':status.focusTaskInput}">
                <a class="input-star">
                    <span class="icon input-star"></span>
                </a>
                <a class="input-date">
                    <span class="icon input-date"></span>
                </a>
                <form ng-submit="addTask(status.taskName)" name="addTaskForm">
                    <input id="target" ng-disabled="isAddingTask" ng-click="focusTaskInput()" class="transparent" placeholder="{{ getAddString() }}" ng-model="status.taskName"
                        ng-keydown="checkTaskInput($event)"/>
                </form>
            </div>
            <div class="task-list">
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
    <script type="text/ng-template" id="part.taskbody">
        <?php print_unescaped($this->inc('part.taskbody')); ?>
    </script>
</div>
