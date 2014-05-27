<?php
/**
 * @author Thomas Tanghus
 * @copyright 2013-2014 Thomas Tanghus (thomas@tanghus.net)
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\Tasks_enhanced;

use OCP\AppFramework\App as MainApp,
	OCP\AppFramework\IAppContainer,
	OCA\Tasks_enhanced\Controller\PageController,
	OCA\Tasks_enhanced\Controller\CollectionsController,
	OCA\Tasks_enhanced\Controller\ListsController,
	OCA\Tasks_enhanced\Controller\TasksController,
	OCA\Tasks_enhanced\Controller\SettingsController;

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
		parent::__construct('tasks_enhanced', $params);
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
