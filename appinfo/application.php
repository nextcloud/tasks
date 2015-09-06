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

namespace OCA\Tasks\AppInfo;

use \OCP\AppFramework\App;
use \OCA\Tasks\Controller\PageController;
use \OCA\Tasks\Controller\CollectionsController;
use \OCA\Tasks\Controller\ListsController;
use \OCA\Tasks\Controller\SettingsController;
use \OCA\Tasks\Controller\TasksController;
use \OCA\Tasks\Service\TasksService;
use \OCA\Tasks\Service\ListsService;
use \OCA\Tasks\Service\CollectionsService;
use \OCA\Tasks\Service\SettingsService;
use \OCA\Tasks\Service\Helper;
use \OCA\Tasks\Service\MapperHelper;
use \OCA\Tasks\Service\TaskParser;
use \OCA\Tasks\Service\ReminderService;
use \OCA\Tasks\Service\CommentsService;
use \OCA\Tasks\Db\TasksMapper;

class Application extends App {


	public function __construct (array $urlParams=array()) {
		parent::__construct('tasks', $urlParams);

		$container = $this->getContainer();

		/**
		 * Controllers
		 */
		$container->registerService('PageController', function($c) {
			return new PageController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('UserId')
			);
		});

		$container->registerService('CollectionsController', function($c) {
			return new CollectionsController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('CollectionsService')
			);
		});

		$container->registerService('ListsController', function($c) {
			return new ListsController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('ListsService')
			);
		});

		$container->registerService('SettingsController', function($c) {
			return new SettingsController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('SettingsService')
			);
		});

		$container->registerService('TasksController', function($c) {
			return new TasksController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('TasksService'),
				$c->query('ReminderService'),
				$c->query('CommentsService')
			);
		});


		/**
		 * Services
		 */
		$container->registerService('TasksService', function($c) {
			return new TasksService(
				$c->query('UserId'),
				$c->query('TasksMapper'),
				$c->query('MapperHelper'),
				$c->query('Helper'),
				$c->query('TaskParser')
			);
		});

		$container->registerService('ListsService', function($c) {
			return new ListsService(
				$c->query('UserId')
			);
		});

		$container->registerService('CollectionsService', function($c) {
			return new CollectionsService(
				$c->query('UserId'),
				$c->query('L10N'),
				$c->query('Settings'),
				$c->query('AppName')
			);
		});

		$container->registerService('SettingsService', function($c) {
			return new SettingsService(
				$c->query('UserId'),
				$c->query('Settings'),
				$c->query('AppName')
			);
		});

		$container->registerService('MapperHelper', function($c) {
			return new MapperHelper(
				$c->query('TasksMapper'),
				$c->query('Helper'),
				$c->query('TaskParser')
			);
		});

		$container->registerService('TaskParser', function($c) {
			return new TaskParser(
				$c->query('ReminderService'),
				$c->query('Helper')
			);
		});

		$container->registerService('ReminderService', function($c) {
			return new ReminderService(
				$c->query('Helper')
			);
		});

		$container->registerService('CommentsService', function($c) {
			return new CommentsService(
				$c->query('UserId'),
				$c->query('Helper')
			);
		});

		$container->registerService('Helper', function() {
			return new Helper(
			);
		});

		/**
		 * Core
		 */
		$container->registerService('UserId', function($c) {
			$user = $c->query('ServerContainer')->getUserSession()->getUser();

			return ($user) ? $user->getUID() : '';
		});	

		$container->registerService('L10N', function($c) {
			return $c->query('ServerContainer')->getL10N($c->query('AppName'));
		});

		$container->registerService('Settings', function($c) {
			return $c->query('ServerContainer')->getConfig();
		});

		/**
		 * Database Layer
		 */
		$container->registerService('TasksMapper', function($c) {
			return new TasksMapper(
				$c->query('ServerContainer')->getDb()
			);
		});
		
	}


}
