<?php
/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2014 Raimund Schlüßler raimund.schluessler@googlemail.com
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
				$c->query('TasksService')
			);
		});


		/**
		 * Services
		 */
		$container->registerService('TasksService', function($c) {
			return new TasksService(
				$c->query('UserId')
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

		/**
		 * Core
		 */
		$container->registerService('UserId', function() {
			return \OCP\User::getUser();
		});	

		$container->registerService('L10N', function($c) {
			return $c->query('ServerContainer')->getL10N($c->query('AppName'));
		});

		$container->registerService('Settings', function($c) {
			return $c->query('ServerContainer')->getConfig();
		});

		\OC::$server->getSearch()->registerProvider('OCA\Tasks\Controller\SearchController', array('apps' => array('tasks')));
		
	}


}
