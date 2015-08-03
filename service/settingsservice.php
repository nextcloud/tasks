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

namespace OCA\Tasks\Service;

use OCP\IConfig;

class SettingsService {

	private $userId;
	private $settings;
	private $appName;

	public function __construct($userId, IConfig $settings, $appName) {
		$this->userId = $userId;
		$this->settings = $settings;
		$this->appName = $appName;
	}

	/**
	 * get the current settings
	 *
	 * @return array
	 */
	public function get() {
		$settings = array(
			array(
				'id' => 'various',
				'showHidden' => (int)$this->settings->getUserValue($this->userId, $this->appName,'various_showHidden'),
				'startOfWeek' => (int)$this->settings->getUserValue($this->userId, $this->appName,'various_startOfWeek'),
				'userID' => $this->userId,
				'categories' => \OC_Calendar_App::getCategoryOptions()
			)
		);
		return $settings;
	}

	/**
	 * set setting of type to new value
	 *
	 * @param $setting
	 * @param $type
	 * @param $value
	 * @return bool
	 */
	public function set($setting, $type, $value) {
		$this->settings->setUserValue($this->userId, $this->appName, $type.'_'.$setting, $value);
		return true;
	}
}
