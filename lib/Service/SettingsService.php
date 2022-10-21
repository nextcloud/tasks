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

namespace OCA\Tasks\Service;

use OCP\App\IAppManager;
use OCP\IConfig;

class SettingsService {
	/**
	 * @var ?string
	 */
	private $userId;

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var string
	 */
	private $appName;

	/**
	 * @var IAppManager
	 */
	private $appManager;

	/**
	 * @param string $userId
	 * @param IConfig $settings
	 * @param string $appName
	 */
	public function __construct(?string $userId, IConfig $config, string $appName, IAppManager $appManager) {
		$this->userId = $userId;
		$this->config = $config;
		$this->appName = $appName;
		$this->appManager = $appManager;
	}

	/**
	 * Get the current settings
	 *
	 * @return array
	 */
	public function get():array {
		$defaultCalendarId = (string)$this->config->getUserValue($this->userId, $this->appName, 'various_defaultCalendarId');
		$showHidden = (bool)$this->config->getUserValue($this->userId, $this->appName, 'various_showHidden', false);
		$sortOrder = (string)$this->config->getUserValue($this->userId, $this->appName, 'various_sortOrder', 'default');
		$sortDirection = (bool)$this->config->getUserValue($this->userId, $this->appName, 'various_sortDirection', false);
		$allDay = (bool)$this->config->getUserValue($this->userId, $this->appName, 'various_allDay', false);
		$initialRoute = (string)$this->config->getUserValue($this->userId, $this->appName, 'various_initialRoute', '/collections/all');

		$calendarEnabled = $this->appManager->isEnabledForUser('calendar');
		$defaultInitialView = $this->config->getAppValue('calendar', 'currentView', 'dayGridMonth');
		$calendarView = $this->getView($this->config->getUserValue($this->userId, 'calendar', 'currentView', $defaultInitialView));
		$defaultShowTasks = $this->config->getAppValue('calendar', 'showTasks', 'yes');
		$showTasks = $this->config->getUserValue($this->userId, 'calendar', 'showTasks', $defaultShowTasks) === 'yes';

		return [
			'defaultCalendarId' => $defaultCalendarId,
			'showHidden' => $showHidden,
			'sortOrder' => $sortOrder,
			'sortDirection' => $sortDirection,
			'allDay' => $allDay,
			'initialRoute' => $initialRoute,
			'calendarEnabled' => $calendarEnabled,
			'showTasks' => $showTasks,
			'calendarView' => $calendarView
		];
	}

	/**
	 * Set setting of type to new value
	 *
	 * @param $setting
	 * @param $value
	 * @return bool
	 */
	public function set($setting, $value):bool {
		$this->config->setUserValue($this->userId, $this->appName, 'various_'.$setting, $value);
		return true;
	}

	/**
	 * Makes sure we don't use the old views anymore
	 *
	 * @param string $view
	 * @return string
	 */
	private function getView(string $view): string {
		switch ($view) {
			case 'agendaDay':
				return 'timeGridDay';

			case 'agendaWeek':
				return 'timeGridWeek';

			case 'month':
				return 'dayGridMonth';

			default:
				return $view;
		}
	}
}
