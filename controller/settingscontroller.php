<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2014 Raimund Schlüßler raimund.schluessler@googlemail.com
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

namespace OCA\Tasks\Controller;

use \OCP\IRequest;
use \OCP\IConfig;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;

class SettingsController extends Controller {

	private $userId;
	private $settings;

	public function __construct($appName, IRequest $request, $userId, IConfig $settings){
		parent::__construct($appName, $request);
		$this->userId = $userId;
		$this->settings = $settings;
	}

	/**
	 * @NoAdminRequired
	 */
	public function get(){
		$settings = array(
			array(
				'id' => 'various',
				'showHidden' => (int)$this->settings->getUserValue($this->userId, $this->appName,'various_showHidden'),
				'startOfWeek' => (int)$this->settings->getUserValue($this->userId, $this->appName,'various_startOfWeek'),
				'userID' => $this->userId
			)
		);
		$result = array(
			'data' => array(
				'settings' => $settings
			)
		);
		$response = new JSONResponse();
		$response->setData($result);
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function set(){
		$this->settings->setUserValue($this->userId, $this->appName, $this->params('type').'_'.$this->params('setting'), $this->params('value'));
		$response = new JSONResponse();
		return $response;
	}
}