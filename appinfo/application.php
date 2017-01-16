<?php
/**
* Nextcloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2017 Raimund Schlüßler raimund.schluessler@googlemail.com
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
use \OCP\AppFramework\IAppContainer;
use \OCA\Tasks\Controller\PageController;
use \OCA\Tasks\Controller\CollectionsController;
use \OCA\Tasks\Controller\SettingsController;
use \OCA\Tasks\Service\CollectionsService;
use \OCA\Tasks\Service\SettingsService;

class Application extends App {


	public function __construct (array $urlParams=array()) {
		parent::__construct('tasks', $urlParams);

		$container = $this->getContainer();

		/**
		 * Controllers
		 */
		$container->registerService('PageController', function(IAppContainer $c) {
			return new PageController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('UserId'),
				$c->query('ServerContainer')->getConfig()
			);
		});

		$container->registerService('CollectionsController', function(IAppContainer $c) {
			return new CollectionsController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('CollectionsService')
			);
		});

		$container->registerService('SettingsController', function(IAppContainer $c) {
			return new SettingsController(
				$c->query('AppName'),
				$c->query('Request'),
				$c->query('SettingsService')
			);
		});

		/**
		 * Services
		 */

		$container->registerService('CollectionsService', function(IAppContainer $c) {
			return new CollectionsService(
				$c->query('UserId'),
				$c->query('L10N'),
				$c->query('Settings'),
				$c->query('AppName')
			);
		});

		$container->registerService('SettingsService', function(IAppContainer $c) {
			return new SettingsService(
				$c->query('UserId'),
				$c->query('Settings'),
				$c->query('AppName')
			);
		});

		/**
		 * Core
		 */
		$container->registerService('UserId', function(IAppContainer $c) {
			$user = $c->query('ServerContainer')->getUserSession()->getUser();

			return ($user) ? $user->getUID() : '';
		});

		$container->registerService('L10N', function(IAppContainer $c) {
			return $c->query('ServerContainer')->getL10N($c->query('AppName'));
		});

		$container->registerService('Settings', function(IAppContainer $c) {
			return $c->query('ServerContainer')->getConfig();
		});
	}
}
