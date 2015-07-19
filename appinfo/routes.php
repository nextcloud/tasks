<?php
/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2015 Raimund Schlüßler raimund.schluessler@googlemail.com
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

namespace OCA\Tasks;

// use \OCP\AppFramework\App;
use \OCA\Tasks\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, array('routes' => array(
	// page
	array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),

	// collections
	array('name' => 'collections#getCollections',	'url' => '/collections',										'verb' => 'GET'),
	array('name' => 'collections#setVisibility',	'url' => '/collection/{collectionID}/visibility/{visibility}',	'verb' => 'POST'),

	// lists
	array('name' => 'lists#getLists',	'url' => '/lists',					'verb' => 'GET'),
	array('name' => 'lists#addList',	'url' => '/lists/add',				'verb' => 'POST'),
	array('name' => 'lists#deleteList',	'url' => '/lists/{listID}/delete',	'verb' => 'POST'),
	array('name' => 'lists#setListName','url' => '/lists/{listID}/name',	'verb' => 'POST'),

	// tasks
	array('name' => 'tasks#getTasks',		'url' => '/tasks/{type}/{listID}',		'verb' => 'GET'),
	array('name' => 'tasks#getTask',		'url' => '/task/{taskID}',				'verb' => 'GET'),
	array('name' => 'tasks#addTask',		'url' => '/tasks/add',					'verb' => 'POST'),
	array('name' => 'tasks#deleteTask',		'url' => '/tasks/{taskID}/delete',		'verb' => 'POST'),
	array('name' => 'tasks#setTaskName',	'url' => '/tasks/{taskID}/name',		'verb' => 'POST'),
	array('name' => 'tasks#setTaskCalendar','url' => '/tasks/{taskID}/calendar',	'verb' => 'POST'),
	array('name' => 'tasks#setTaskNote',	'url' => '/tasks/{taskID}/note',		'verb' => 'POST'),
	array('name' => 'tasks#setDueDate',		'url' => '/tasks/{taskID}/due',			'verb' => 'POST'),
	array('name' => 'tasks#setStartDate',	'url' => '/tasks/{taskID}/start',		'verb' => 'POST'),

	array('name' => 'tasks#percentComplete','url' => '/tasks/{taskID}/percentcomplete',	'verb' => 'POST'),
	array('name' => 'tasks#setPriority',	'url' => '/tasks/{taskID}/priority',		'verb' => 'POST'),
	array('name' => 'tasks#setReminderDate','url' => '/tasks/{taskID}/reminder',		'verb' => 'POST'),
	array('name' => 'tasks#addComment',		'url' => '/tasks/{taskID}/comment',			'verb' => 'POST'),
	array('name' => 'tasks#deleteComment',	'url' => '/tasks/{taskID}/comment/{commentID}/delete',	'verb' => 'POST'),
	array('name' => 'tasks#addCategory',	'url' => '/tasks/{taskID}/category/add',	'verb' => 'POST'),
	array('name' => 'tasks#removeCategory',	'url' => '/tasks/{taskID}/category/remove',	'verb' => 'POST'),
	array('name' => 'tasks#setHideSubtasks','url' => '/tasks/{taskID}/hidesubtasks',	'verb' => 'POST'),
	array('name' => 'tasks#changeParent',	'url' => '/tasks/{taskID}/parent',			'verb' => 'POST'),

	// settings
	array('name' => 'settings#get',	'url' => '/settings', 'verb' => 'GET'),
	array('name' => 'settings#set', 'url' => '/settings/{type}/{setting}/{value}', 'verb' => 'POST'),
)));
