<?php
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