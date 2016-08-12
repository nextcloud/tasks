<?php
    script('tasks', 'vendor/angular/angular.min');
    script('tasks', 'vendor/angular-route/angular-route.min');
    script('tasks', 'vendor/angular-animate/angular-animate.min');
    script('tasks', 'vendor/angular-sanitize/angular-sanitize.min');
    script('tasks', 'vendor/angular-draganddrop/angular-drag-and-drop-lists.min');
    script('tasks', 'vendor/angular-ui-select/dist/select.min');
    script('tasks', 'vendor/jstzdetect/jstz.min');
    script('tasks', 'public/app');
    script('tasks', 'vendor/jquery-timepicker/jquery.ui.timepicker');
    script('tasks', 'vendor/davclient.js/lib/client');
    script('tasks', 'vendor/ical.js/build/ical');
    style('tasks', 'style');
    style('tasks', 'vendor/angularui/ui-select/select2');
?>

<div ng-app="Tasks" ng-cloak ng-controller="AppController" ng-click="closeAll($event)" id="app" class="handler" data-appVersion="<?php p($_['appVersion']); ?>">
    <div id="app-navigation" ng-controller="ListController">
        <ul id="collections">
            <li id="collection_{{ collection.id }}"
                class="collection"
                collectionID="{{collection.id}}"
                ng-repeat="collection in collections"
                ng-class="{'animate-up': hideCollection(collection.id), active: collection.id==route.collectionID}"
                dnd-list="draggedTasks"
                dnd-drop="dropCollection(event, index, item)"
                dnd-dragover="dragoverCollection(event, index)">
                <a href="#/collections/{{ collection.id }}">
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
                id="list_{{ calendar.uri }}"
                calendarID="{{calendar.uri}}"
                ng-repeat="calendar in calendars"
                ng-class="{ active: calendar.uri==route.calendarID, edit:route.listparameter == 'name' && route.calendarID == calendar.uri,
                            caldav: route.listparameter == 'caldav' && route.calendarID == calendar.uri}"
                dnd-list="draggedTasks"
                dnd-drop="dropList(event, index, item)"
                dnd-dragover="dragoverList(event, index)">
                <a href="#/calendars/{{ calendar.uri }}" ng-dblclick="startRename(calendar)">
                    <span class="calendar-indicator" style="background-color: {{ calendar.color }};"></span>
                    <span class="title">{{ calendar.displayname }}</span>
                </a>
                <div class="app-navigation-entry-utils">
                    <ul>
                        <li class="app-navigation-entry-utils-counter">{{ getListCount(calendar.uri,'all') | counterFormatter }}</li>
                        <li class="app-navigation-entry-utils-menu-button svg" ng-show="calendar.writable"><button></button></li>
                    </ul>
                </div>
                <div class="app-navigation-entry-menu" ng-show="calendar.writable">
                    <ul>
                        <li>
                            <span title="<?php p($l->t('Edit')); ?>" ng-click="startEdit(calendar)">
                                <img class="icon-rename svg" src="<?php p(image_path('core', 'actions/rename.svg'))?>"/>
                                <span><?php p($l->t('Edit')); ?></span>
                            </span>
                        </li>
                        <li>
                            <span title="<?php p($l->t('CalDAV-Link')); ?>" ng-click="showCalDAVUrl(calendar)">
                                <img class="icon-public svg" src="<?php p(image_path('core', 'actions/public.svg'))?>"/>
                                <span><?php p($l->t('CalDAV-Link')); ?></span>
                            </span>
                        </li>
                        <li>
                            <a href="{{calendar.exportUrl}}" download="{{calendar.uri}}.ics" title="<?php p($l->t('Export')); ?>">
                                <img class="icon-download svg" src="<?php p(image_path('core', 'actions/download.svg'))?>"/>
                                <span><?php p($l->t('Export')); ?></span>
                            </a>
                        </li>
                        <li confirmation="delete(calendar)" confirmation-message="deleteMessage(calendar)">
                        </li>
                    </ul>
                </div>
                <div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
                    <form>
                        <input ng-model="calendar.displayname" class="edit hasTooltip" type="text" ng-keyup="checkEdit($event,calendar)" autofocus-on-insert>
                        <input type="cancel" value="" class="action icon-close svg" ng-click="cancelEdit(calendar)" title="<?php p($l->t('Cancel')); ?>">
                        <input type="submit" value="" class="action icon-checkmark svg" ng-click="saveEdit(calendar)" title="<?php p($l->t('Save')); ?>">
                    </form>
                    <colorpicker class="colorpicker"
                                 selected="calendar.color">
                    </colorpicker>
                </div>
                <div class="app-navigation-entry-edit caldav">
                    <form>
                        <input class="caldav" ng-value="calendar.caldav" readonly type="text"/>
                        <input type="cancel" value="" class="action icon-close svg" ng-click="hideCalDAVUrl()" title="<?php p($l->t('Cancel')); ?>">
                    </form>
                </div>
            </li>
            <li class="newList handler" ng-class="{edit: status.addingList}">
                <a class="addlist" ng-click="startCreate()" oc-click-focus="{selector: '#newList', timeout: 0}">
                    <span class="icon detail-add"></span>
                    <span class="title"><?php p($l->t('Add List...')); ?></span>
                </a>
                <div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
                    <form ng-disabled="isAddingList">
                        <input id="newList" ng-model="status.newListName" class="edit hasTooltip" type="text" autofocus-on-insert
                        placeholder="<?php p($l->t('New List')); ?>" ng-keyup="checkNew($event,status.newListName)">
                        <input type="cancel" value="" class="action icon-close svg" ng-click="cancelCreate()" title="<?php p($l->t('Cancel')); ?>">
                        <input type="submit" value="" class="action icon-checkmark svg" ng-click="create($event)" title="<?php p($l->t('Save')); ?>">
                    </form>
                    <colorpicker class="colorpicker"
                                 selected="color">
                    </colorpicker>
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
                        <div class="label-container">
                            <span class="icon collection-{{ collection.id }}"><text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text></span>
                            <label for="visibilityCollection-{{collection.id}}" class="title">{{ collection.displayname }}</label>
                        </div>
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
        <div id="app-sidebar" ng-class="{'details-visible':route.taskID}">
            <div class="content-wrapper">
                <?php print_unescaped($this->inc('part.details')); ?>
            </div>
        </div>
    </div>
    <script type="text/ng-template" id="part.taskbody">
        <?php print_unescaped($this->inc('part.taskbody')); ?>
    </script>
</div>
