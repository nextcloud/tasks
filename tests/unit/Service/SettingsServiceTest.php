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

use OCA\Tasks\Service\SettingsService;
use OCP\IConfig;

use PHPUnit\Framework\TestCase;


class SettingsServiceTest extends TestCase {

	private $settingsService;
	private $settings;
	private $userId;
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
		$this->settingsService = new SettingsService(
			$this->userId,
			$this->settings,
			$this->appName
		);
	}

	public function testGet() {
		$return = [
			'defaultCalendarId' => 'personal',
			'showHidden' => 0,
			'sortOrder' => 'default',
			'sortDirection' => false,
			'userID' => $this->userId
		];
		
		$this->settings->expects($this->at(0))
			->method('getUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'various_defaultCalendarId'
			)
			->will($this->returnValue('personal'));

		$this->settings->expects($this->at(1))
			->method('getUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'various_showHidden'
			)
			->will($this->returnValue(0));

		$this->settings->expects($this->at(2))
			->method('getUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'various_sortOrder'
			)
			->will($this->returnValue('default'));

		$this->settings->expects($this->at(3))
			->method('getUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'various_sortDirection'
			)
			->will($this->returnValue(false));

		$result = $this->settingsService->get();

		$this->assertEquals($return, $result);
	}


	public function testSet() {
		$return = true;
		
		$this->settings->expects($this->once())
			->method('setUserValue')
			->with(
				$this->equalTo($this->userId),
				$this->equalTo($this->appName),
				'various_defaultCalendarId',
				'personal'
			);
		
		$result = $this->settingsService->set('defaultCalendarId', 'personal');

		$this->assertEquals($return, $result);
	}
}
