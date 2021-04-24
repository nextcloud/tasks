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
use OCP\App\IAppManager;
use OCP\IConfig;

use PHPUnit\Framework\TestCase;

class SettingsServiceTest extends TestCase {
	private $settingsService;
	private $settings;
	private $userId;
	private $appName;
	private $appManager;

	/**
	 * Gets run before each test
	 */
	protected function setUp(): void {
		$this->appName = 'tasks';
		$this->userId = 'admin';
		$this->config = $this->getMockBuilder(IConfig::class)
			->disableOriginalConstructor()
			->getMock();
		$this->appManager = $this->getMockBuilder(IAppManager::class)
			->disableOriginalConstructor()
			->getMock();
		$this->settingsService = new SettingsService(
			$this->userId,
			$this->config,
			$this->appName,
			$this->appManager
		);
	}

	public function testGet() {
		$return = [
			'defaultCalendarId' => 'personal',
			'showHidden' => false,
			'sortOrder' => 'default',
			'sortDirection' => false,
			'allDay' => false,
			'initialRoute' => '/collections/all',
			'calendarEnabled' => true,
			'showTasks' => true,
			'calendarView' => 'dayGridMonth'
		];

		$userValueMap = [
			[
				$this->userId,
				$this->appName,
				'various_defaultCalendarId',
				'',
				'personal'
			],
			[
				$this->userId,
				$this->appName,
				'various_showHidden',
				false,
				false
			],
			[
				$this->userId,
				$this->appName,
				'various_sortOrder',
				'default',
				'default'
			],
			[
				$this->userId,
				$this->appName,
				'various_sortDirection',
				false,
				false
			],
			[
				$this->userId,
				$this->appName,
				'various_allDay',
				false,
				false
			],
			[
				$this->userId,
				$this->appName,
				'various_initialRoute',
				'/collections/all',
				'/collections/all'
			],
			[
				$this->userId,
				'calendar',
				'showTasks',
				'yes',
				'yes'
			],
			[
				$this->userId,
				'calendar',
				'currentView',
				'dayGridMonth',
				'dayGridMonth'
			]
		];

		$appValueMap = [
			[
				'calendar',
				'currentView',
				'dayGridMonth',
				'dayGridMonth'
			],
			[
				'calendar',
				'showTasks',
				'yes',
				'yes'
			]
		];

		$this->config->expects($this->any())
			->method('getUserValue')
			->will(
				$this->returnValueMap($userValueMap)
			);

		$this->config->expects($this->any())
			->method('getAppValue')
			->will(
				$this->returnValueMap($appValueMap)
			);

		$this->appManager->expects($this->any())
			->method('isEnabledForUser')
			->willReturn(true);

		$result = $this->settingsService->get();

		$this->assertEquals($return, $result);
	}


	public function testSet() {
		$return = true;
		
		$this->config->expects($this->once())
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
