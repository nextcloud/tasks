<?php
/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

namespace OCA\Tasks\Tests\Unit\Service;

use OCA\Tasks\Service\CollectionsService;
use OCP\IConfig;
use OCP\IL10N;

use PHPUnit\Framework\TestCase;

class CollectionsServiceTest extends TestCase {
	private $collectionsService;
	private $settings;
	private $userId;
	private $l10n;
	private $appName;

	/**
	 * Gets run before each test
	 */
	protected function setUp(): void {
		$this->appName = 'tasks';
		$this->userId = 'admin';
		$this->settings = $this->getMockBuilder(IConfig::class)
			->disableOriginalConstructor()
			->getMock();
		$this->l10n = $this->createMock(IL10N::class);
		$this->collectionsService = new CollectionsService(
			$this->userId,
			$this->l10n,
			$this->settings,
			$this->appName
		);
	}

	public function testGetAll() {
		$return = [
			[
				'id' => "starred",
				'displayName' => 'Important',
				'show' => 2,
				'icon' => 'Star'],
			[
				'id' => "today",
				'displayName' => 'Today',
				'show' => 2,
				'icon' => 'CalendarToday'],
			[
				'id' => "week",
				'displayName' => 'Week',
				'show' => 2,
				'icon' => 'CalendarWeek'],
			[
				'id' => "all",
				'displayName' => 'All',
				'show' => 2,
				'icon' => 'CircleOutline'],
			[
				'id' => "current",
				'displayName' => 'Current',
				'show' => 2,
				'icon' => 'TrendingUp'],
			[
				'id' => "completed",
				'displayName' => 'Completed',
				'show' => 2,
				'icon' => 'Check']
		];
		
		$map = [
			['Important', [],'Important'],
			['Today', [], 'Today'],
			['Week', [], 'Week'],
			['All', [], 'All'],
			['Completed', [], 'Completed'],
			['Current', [], 'Current']
		];

		$this->l10n->expects($this->any())
			->method('t')
			->will(
				$this->returnValueMap($map)
			);

		$result = $this->collectionsService->getAll();

		$this->assertEquals($return, $result);
	}


	public function testSetVisibility() {
		$return = true;
		
		$this->settings->expects($this->once())
			->method('setUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'show_starred',
				0
			);
		
		$result = $this->collectionsService->setVisibility('starred', 0);
		// These lines should not lead to a call of '$this->settings->setUserValue'
		$this->collectionsService->setVisibility('starred', -1);
		$this->collectionsService->setVisibility('starred', '3');

		$this->assertEquals($return, $result);
	}
}
