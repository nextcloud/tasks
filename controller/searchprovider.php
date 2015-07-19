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

namespace OCA\Tasks\Controller;

use OCA\Tasks\AppInfo\Application;

/**
 * Tasks search provider
 */
class SearchProvider extends \OCP\Search\Provider {

	private $tasksService;

	public function __construct() {
		$app = new Application();
		$container = $app->getContainer();
		$this->app = $app;
		$this->tasksService = $container->query('TasksService');
	}


	/**
	 * Search for query in tasks
	 *
	 * @param string $query
	 * @return array
	 */
	public function search($query) {
		return $this->tasksService->search($query);
	}
}
