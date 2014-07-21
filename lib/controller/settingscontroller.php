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

namespace OCA\Tasks_enhanced\Controller;

use OCA\Tasks_enhanced\Controller,
	OCP\AppFramework\Http\JSONResponse;

class SettingsController extends Controller {

	/**
	 * @NoAdminRequired
	 */
	public function getSettings(){
		$settings = array(
			array(
				'id' => 'various',
				'showHidden' => (int)\OCP\Config::getUserValue($this->api->getUserId(), 'tasks_enhanced','various_showHidden'),
				'startOfWeek' => (int)\OCP\Config::getUserValue($this->api->getUserId(), 'tasks_enhanced','various_startOfWeek'),
				'userID' => $this->api->getUserId()

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
		\OCP\Config::setUserValue($this->api->getUserId(), 'tasks_enhanced',$this->params('type').'_'.$this->params('setting'), $this->params('value'));
		$response = new JSONResponse();
		$response->setData();
		return $response;
	}
}