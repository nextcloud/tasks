<?php
/**
 * @author Thomas Tanghus
 * @copyright 2013-2014 Thomas Tanghus (thomas@tanghus.net)
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\Tasks;

use OCP\AppFramework\App as MainApp;
use OCP\AppFramework\IAppContainer;
use OCA\Tasks\Controller\PageController;
use OCA\Tasks\Controller\CollectionsController;
use OCA\Tasks\Controller\ListsController;
use OCA\Tasks\Controller\TasksController;
use OCA\Tasks\Controller\SettingsController;

/**
 * This class manages our app actions
 *
 * TODO: Merge with App
 */

class Dispatcher extends MainApp {
	/**
	* @var App
	*/
	protected $app;

	public function __construct($params) {
		parent::__construct('tasks', $params);
		$this->container = $this->getContainer();
		$this->registerServices();
	}

	public function registerServices() {
		$this->container->registerService('PageController', function(IAppContainer $container) {
			return new PageController($container);
		});
		$this->container->registerService('CollectionsController', function(IAppContainer $container) {
			return new CollectionsController($container);
		});
		$this->container->registerService('ListsController', function(IAppContainer $container) {
			return new ListsController($container);
		});
		$this->container->registerService('TasksController', function(IAppContainer $container) {
			return new TasksController($container);
		});
		$this->container->registerService('SettingsController', function(IAppContainer $container) {
			return new SettingsController($container);
		});
	}

}
