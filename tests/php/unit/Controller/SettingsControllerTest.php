<?php
/**
 * Nextcloud - Tasks
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

namespace OCA\Tasks\Tests\Unit\Controller;

use OCA\Tasks\Controller\SettingsController;
use OCA\Tasks\Service\SettingsService;
use OCP\IRequest;

use PHPUnit\Framework\TestCase;

class SettingsControllerTest extends TestCase {
	private $appName;
	private $settingsService;
	private $request;
	private $controller;

	use \OCA\Tasks\Controller\Response;

	/**
	 * Gets run before each test
	 */
	public function setUp(): void {
		$this->appName = 'tasks';
		$this->settingsService = $this->getMockBuilder(SettingsService::class)
			->disableOriginalConstructor()
			->getMock();
		$this->request = $this->getMockBuilder(IRequest::class)
			->disableOriginalConstructor()
			->getMock();
		$this->controller = new SettingsController(
			$this->appName,
			$this->request,
			$this->settingsService
		);
	}

	public function testSet() {
		$this->settingsService->expects($this->once())
			->method('set')
			->with(
				'sortOrder',
				$this->equalTo(0)
			)
			->will($this->returnValue(true));

		$expected = $this->generateResponse(function () {
			return true;
		});
		$response = $this->controller->set('sortOrder', 0);
		$this->assertEquals($expected, $response);
	}
}
