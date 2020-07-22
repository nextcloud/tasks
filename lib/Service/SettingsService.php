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
	 * @param string $userId
	 * @param IConfig $settings
	 * @param string $appName
	 */
	public function __construct(?string $userId, IConfig $config, string $appName) {
		$this->userId = $userId;
		$this->config = $config;
		$this->appName = $appName;
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

		return [
			'defaultCalendarId' => $defaultCalendarId,
			'showHidden' => $showHidden,
			'sortOrder' => $sortOrder,
			'sortDirection' => $sortDirection,
			'allDay' => $allDay,
			'initialRoute' => $initialRoute
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
}
