<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2013 Raimund Schlüßler raimund.schluessler@googlemail.com
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
*
*/

namespace OCA\Tasks_enhanced;

use \OCA\AppFramework\App;

use \OCA\Tasks_enhanced\DependencyInjection\DIContainer;

$this->create('tasks_enhanced_index', '/')->get()->action(
    function($params){
        // call the index method on the class PageController
        App::main('PageController', 'index', $params, new DIContainer());
    }
);

/*
 * Lists
 */
$this->create('getLists', '/lists')->get()->action(
	function($params){
		App::main('ListsController', 'getLists', $params, new DIContainer());
	}
);

$this->create('list_add', '/lists/add/{name}')->post()->action(
	function($params){
		App::main('ListsController', 'addList', $params, new DIContainer());
	}
);

$this->create('list_delete', '/lists/{listID}/delete')->post()->action(
	function($params){
		App::main('ListsController', 'deleteList', $params, new DIContainer());
	}
);

$this->create('list_name', '/lists/{listID}/name')->post()->action(
	function($params){
		App::main('ListsController', 'setListName', $params, new DIContainer());
	}
);

/*
 * Tasks
 */
$this->create('getTasks', '/tasks')->get()->action(
	function($params){
		App::main('TasksController', 'getTasks', $params, new DIContainer());
	}
);

$this->create('task_star', '/tasks/{taskID}/star')->post()->action(
	function($params){
		App::main('TasksController', 'starTask', $params, new DIContainer());
	}
);

$this->create('task_unstar', '/tasks/{taskID}/unstar')->post()->action(
	function($params){
		App::main('TasksController', 'unstarTask', $params, new DIContainer());
	}
);

$this->create('task_complete', '/tasks/{taskID}/complete')->post()->action(
	function($params){
		App::main('TasksController', 'completeTask', $params, new DIContainer());
	}
);

$this->create('task_uncomplete', '/tasks/{taskID}/uncomplete')->post()->action(
	function($params){
		App::main('TasksController', 'uncompleteTask', $params, new DIContainer());
	}
);

$this->create('task_add', '/tasks/add/{calendarID}/{name}')->post()->action(
	function($params){
		App::main('TasksController', 'addTask', $params, new DIContainer());
	}
);

$this->create('task_delete', '/tasks/{taskID}/delete')->post()->action(
	function($params){
		App::main('TasksController', 'deleteTask', $params, new DIContainer());
	}
);

$this->create('task_name', '/tasks/{taskID}/name')->post()->action(
	function($params){
		App::main('TasksController', 'setTaskName', $params, new DIContainer());
	}
);

$this->create('task_calendar', '/tasks/{taskID}/calendar')->post()->action(
	function($params){
		App::main('TasksController', 'setTaskCalendar', $params, new DIContainer());
	}
);

$this->create('task_note', '/tasks/{taskID}/note')->post()->action(
	function($params){
		App::main('TasksController', 'setTaskNote', $params, new DIContainer());
	}
);

$this->create('task_due', '/tasks/{taskID}/due')->post()->action(
	function($params){
		App::main('TasksController', 'setDueDate', $params, new DIContainer());
	}
);

$this->create('task_reminder', '/tasks/{taskID}/reminder')->post()->action(
	function($params){
		App::main('TasksController', 'setReminderDate', $params, new DIContainer());
	}
);