<?php
/**
 * Nextcloud - Tasks
 *
 * @author Julius Härtl
 * @copyright 2016 Julius Härtl <jus@bitgrid.net>
 *
 * @author Raimund Schlüßler
 * @copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

use PHPUnit\Framework\TestCase;

class AppTest extends TestCase {
	private $container;
	private $app;

	public function setUp(): void {
		parent::setUp();
		$this->app = new \OCA\Tasks\AppInfo\Application();
		$this->container = $this->app->getContainer();
	}

	public function testAppInstalled() {
		$appManager = $this->container->query('OCP\App\IAppManager');
		$this->assertTrue($appManager->isInstalled('tasks'));
	}
}
