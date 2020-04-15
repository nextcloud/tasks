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

use OCA\Tasks\Controller\CollectionsController;
use OCA\Tasks\Service\CollectionsService;
use OCP\IRequest;

use PHPUnit\Framework\TestCase;

class CollectionsControllerTest extends TestCase {
	private $appName;
	private $collectionsService;
	private $request;
	private $controller;

	use \OCA\Tasks\Controller\Response;

	/**
	 * Gets run before each test
	 */
	public function setUp(): void {
		$this->appName = 'tasks';
		$this->collectionsService = $this->getMockBuilder(CollectionsService::class)
			->disableOriginalConstructor()
			->getMock();
		$this->request = $this->getMockBuilder(IRequest::class)
			->disableOriginalConstructor()
			->getMock();
		$this->controller = new CollectionsController(
			$this->appName,
			$this->request,
			$this->collectionsService
		);
	}

	public function testgetCollections() {
		$return = [[], []];
		$this->collectionsService->expects($this->once())
			->method('getAll')
			->will($this->returnValue($return));

		$expected = $this->generateResponse(function () use ($return) {
			return ['collections' => $return];
		});
		$response = $this->controller->getCollections();
		$this->assertEquals($expected, $response);
	}

	public function testSetVisibility() {
		$this->collectionsService->expects($this->once())
			->method('setVisibility')
			->with(
				'starred',
				$this->equalTo(0)
			)
			->will($this->returnValue(true));

		$expected = $this->generateResponse(function () {
			return true;
		});
		$response = $this->controller->setVisibility('starred', 0);
		$this->assertEquals($expected, $response);
	}
}
