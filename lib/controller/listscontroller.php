<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2013 Raimund Schlüßler raimund.schluessler@googlemail.com
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

class ListsController extends Controller {

	/**
	 * @NoAdminRequired
	 */
	public function getLists(){
		$userId = $this->api->getUserId();
		$calendar = new \OC_Calendar_Calendar();
		$lists = $calendar::allCalendars($userId, true);
		$result = array(
			'data' => array(
				'lists' => $lists
			)
		);
		$response = new JSONResponse();
		$response->setData($result);
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function addList(){
		$listName = $this->params('name');
		$userId = $this->api->getUserId();

		if(trim($listName) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = \OC_Calendar_Calendar::allCalendars($userId, true);
		foreach($calendars as $cal) {
			if($cal['displayname'] == $listName) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}
		$color = '#CCCCCC';
		$calendarId = \OC_Calendar_Calendar::addCalendar($userId, strip_tags($listName), 'VEVENT,VTODO,VJOURNAL', null, 0, $color);
		\OC_Calendar_Calendar::setCalendarActive($calendarId, 1);
		$list = \OC_Calendar_Calendar::find($calendarId);

		$list['tmpID'] = $this->params('tmpID');
		$result = array(
			'data' => array(
				'list' => $list
			)
		);
		$response = new JSONResponse();
		$response->setData($result);
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteList(){
		$listId = $this->params('listID');
		$response = new JSONResponse();
		try {
			$del = \OC_Calendar_Calendar::deleteCalendar($listId);
			if($del == true) {
				$result = array(
					'data' => array()
				);
			}else{
				$result = array('error'=>'dberror');
			}
		} catch(Exception $e) {
			$result = array('message'=>$e->getMessage());
		}
		$response->setData($result);
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function setListName(){
		$listId = (int) $this->params('listID');
		$listName = $this->params('name');
		$userId = $this->api->getUserId();
		$response = new JSONResponse();
		if(trim($listName) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = \OC_Calendar_Calendar::allCalendars($userId, true);
		foreach($calendars as $cal) {
			if($cal['userid'] != $userId){
				continue;
			}
			if($cal['displayname'] == $listName && $cal['id'] != $listId) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}

		$color = '#CCCCCC';
		\OC_Calendar_Calendar::editCalendar($listId, strip_tags($listName), null, null, null, $color);

		$result = array(
			'data' => array()
		);
		$response->setData($result);
		return $response;
	}
}