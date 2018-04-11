<?php
    script('tasks', 'merged');
    style('tasks', 'style');
    style('tasks', 'vendor/angularui/ui-select/select2');
?>

<div id="app"
    ng-app="Tasks"
    ng-cloak
    ng-controller="AppController"
    ng-click="closeAll($event)"
    class="handler"
    data-appVersion="<?php p($_['appVersion']); ?>">
    <div id="app-navigation" ng-controller="ListController">
        <ul id="collections">
            <li id="collection_{{ collection.id }}"
                class="collection {{ collection.icon }} reactive"
                collectionID="{{collection.id}}"
                ng-repeat="collection in collections"
                ng-class="{'animate-up': hideCollection(collection.id), active: collection.id==route.collectionID}"
                dnd-list="draggedTasks"
                dnd-drop="dropCollection(event, index, item)"
                dnd-dragover="dragoverCollection(event, index)">
                <a href="#/collections/{{ collection.id }}" class="sprite">
                    <span class="date" ng-if="collection.id=='today'"><?php p($_['DOM']); ?></span>
                    <span class="title">{{ collection.displayname }}</span>
                </a>
                <div class="app-navigation-entry-utils">
                    <ul>
                        <li class="app-navigation-entry-utils-counter">{{ getCollectionString(collection.id) | counterFormatter }}</li>
                    </ul>
                </div>
            </li>
            <li id="list_{{ calendar.uri }}"
                class="list with-menu handler editing"
                calendarID="{{calendar.uri}}"
                ng-repeat="calendar in calendars"
                ng-class="{ active: calendar.uri==route.calendarID, edit:route.listparameter == 'name' && route.calendarID == calendar.uri,
                            caldav: route.listparameter == 'caldav' && route.calendarID == calendar.uri}"
                dnd-list="draggedTasks"
                dnd-drop="dropList(event, index, item)"
                dnd-dragover="dragoverList(event, index)">
                <div class="app-navigation-entry-bullet" style="background-color: {{ calendar.color }};"></div>
                <a href="#/calendars/{{ calendar.uri }}" ng-dblclick="startRename(calendar)">
                    <span class="title">{{ calendar.displayname }}</span>
                </a>
                <div class="app-navigation-entry-utils">
                    <ul>
                        <li class="app-navigation-entry-utils-counter">{{ getListCount(calendar.uri,'all') | counterFormatter }}</li>
                        <li class="app-navigation-entry-utils-menu-button" ng-show="calendar.writable"><button></button></li>
                    </ul>
                </div>
                <div class="app-navigation-entry-menu" ng-show="calendar.writable">
                    <ul>
                        <li>
                            <a ng-click="startEdit(calendar)">
                                <span class="icon-rename"></span>
                                <span><?php p($l->t('Edit')); ?></span>
                            </a>
                        </li>
                        <li>
                            <a ng-click="showCalDAVUrl(calendar)">
                                <span class="icon-public"></span>
                                <span><?php p($l->t('Link')); ?></span>
                            </a>
                        </li>
                        <li>
                            <a href="{{calendar.exportUrl}}" download="{{calendar.uri}}.ics">
                                <span class="icon-download"></span>
                                <span><?php p($l->t('Download')); ?></span>
                            </a>
                        </li>
                        <li confirmation="delete(calendar)" confirmation-message="deleteMessage(calendar)">
                        </li>
                    </ul>
                </div>
                <div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
                    <form>
                        <input ng-model="calendar.displayname"
                            class="edit hasTooltip"
                            type="text"
                            ng-keyup="checkEdit($event,calendar)"
                            autofocus-on-insert>
                        <input type="cancel"
                            value=""
                            class="action icon-close"
                            ng-click="cancelEdit(calendar)"
                            title="<?php p($l->t('Cancel')); ?>">
                        <input type="submit"
                            value=""
                            class="action icon-checkmark"
                            ng-click="saveEdit(calendar)"
                            title="<?php p($l->t('Save')); ?>">
                    </form>
                    <colorpicker class="colorpicker"
                                 selected="calendar.color">
                    </colorpicker>
                </div>
                <div class="app-navigation-entry-edit caldav">
                    <form>
                        <input class="caldav"
                            ng-value="calendar.caldav"
                            readonly
                            type="text"/>
                        <input type="cancel"
                            value=""
                            class="action icon-close"
                            ng-click="hideCalDAVUrl()"
                            title="<?php p($l->t('Cancel')); ?>">
                    </form>
                </div>
            </li>
            <li class="newList handler icon-add reactive editing" ng-class="{edit: status.addingList}">
                <a class="addlist icon sprite"
                    ng-click="startCreate()"
                    oc-click-focus="{selector: '#newList', timeout: 0}">
                    <span class="title"><?php p($l->t('Add List...')); ?></span>
                </a>
                <div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
                    <form ng-disabled="isAddingList">
                        <input id="newList"
                            ng-model="status.newListName"
                            class="edit hasTooltip"
                            type="text"
                            autofocus-on-insert
                            placeholder="<?php p($l->t('New List')); ?>"
                            ng-keyup="checkNew($event,status.newListName)">
                        <input type="cancel"
                            value=""
                            class="action icon-close"
                            ng-click="cancelCreate()"
                            title="<?php p($l->t('Cancel')); ?>">
                        <input type="submit"
                            value=""
                            class="action icon-checkmark"
                            ng-click="create($event)"
                            title="<?php p($l->t('Save')); ?>">
                    </form>
                    <colorpicker class="colorpicker" selected="color"></colorpicker>
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
                        <select id="startOfWeek"
                            ng-change="setStartOfWeek()"
                            ng-model="settingsmodel.getById('various').startOfWeek"
                            ng-options="startOfWeekOption.id as startOfWeekOption.name for startOfWeekOption in startOfWeekOptions">
                        </select>
                    </li>
                    <li>
                        <label for="enableOpenTaskParsing"><?php p($l->t('OpenTaskParsing')); ?></label>
                        <select id="enableOpenTaskParsing"
                                ng-change="setOpenTaskParsing()"
                                ng-model="settingsmodel.getById('various').parsingOptions"
                                ng-options="parsingOption.id as parsingOption.name for parsingOption in parsingOptions">
                        </select>
                    </li>
                    <li class="headline">
                        <?php p($l->t('Visibility of Smart Collections')); ?>
                    </li>
                    <li ng-repeat="collection in collections">
                        <div class="label-container">
                            <span class="icon {{ collection.icon }}">
                                <text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text>
                            </span>
                            <label for="visibilityCollection-{{collection.id}}" class="title">{{ collection.displayname }}</label>
                        </div>
                        <select id="visibilityCollection-{{collection.id}}"
                            ng-change="setVisibility(collection.id)"
                            ng-model="collection.show"
                            ng-options="collectionOption.id as collectionOption.name for collectionOption in collectionOptions">
                        </select>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div id="app-content"
        ng-controller="TasksController"
        ng-class="{'with-app-sidebar':route.taskID}">
        <div class="content-wrapper">
            <div id="add-task"
                class="add-task handler"
                ng-show="showInput()"
                ng-class="{'focus':status.focusTaskInput}">
                <form ng-submit="addTask(status.taskName)" name="addTaskForm">
                    <input id="target"
                        ng-disabled="isAddingTask"
                        ng-click="focusTaskInput()"
                        class="transparent"
                        placeholder="{{ getAddString() }}"
                        ng-model="status.taskName"
                        ng-keydown="checkTaskInput($event)"/>
                </form>
            </div>
            <div class="app-navigation-entry-utils">
                <div class="app-navigation-entry-utils-menu-button" title="<?php p($l->t('Change sort order')); ?>">
                    <button class="sortorder-dropdown-button">
                        <span class="icon" ng-class="getSortOrderIcon()"></span>
                        <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                    </button>
                </div>
            </div>
            <div class="app-navigation-entry-menu bubble sortorder-dropdown">
                <ul>
                    <li ng-click="setSortOrder($event, 'default')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'default'}" class="handler">
                        <a>
                            <span class="icon icon-menu"></span>
                            <span class="label"><?php p($l->t('Default')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li>
                    <li ng-click="setSortOrder($event, 'due')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'due'}">
                        <a>
                            <span class="icon icon-calendar"></span>
                            <span class="label"><?php p($l->t('Due date')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li>
                    <li ng-click="setSortOrder($event, 'start')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'start'}">
                        <a>
                            <span class="icon icon-calendar"></span>
                            <span class="label"><?php p($l->t('Start date')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li>
                    <li ng-click="setSortOrder($event, 'priority')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'priority'}">
                        <a>
                            <span class="icon icon-task-star"></span>
                            <span class="label"><?php p($l->t('Priority')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li>
                    <li ng-click="setSortOrder($event, 'alphabetically')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'alphabetically'}">
                        <a>
                            <span class="icon icon-alphabetically"></span>
                            <span class="label"><?php p($l->t('Alphabetically')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li>
<!--                     <li ng-click="setSortOrder($event, 'manual')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'manual'}">
                        <a>
                            <span class="icon icon-manual"></span>
                            <span class="label"><?php p($l->t('Manually')); ?></span>
                            <span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
                        </a>
                    </li> -->
                </ul>
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
        <div id="app-sidebar" ng-class="{'disappear':!route.taskID}">
            <?php print_unescaped($this->inc('part.details')); ?>
        </div>
    </div>
    <script type="text/ng-template" id="part.taskbody">
        <?php print_unescaped($this->inc('part.taskbody')); ?>
    </script>
</div>
