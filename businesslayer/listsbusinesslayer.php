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

namespace OCA\Tasks_enhanced\BusinessLayer;

use \OCA\AppFramework\Core\API;
use \OCA\AppFramework\Utility\TimeFactory;

use \OCA\Tasks_enhanced\Db\ListsMapper;


class ListsBusinessLayer extends BusinessLayer {

	private $api;

	public function __construct(ListsMapper $listsMapper,
	                            API $api
	                            ){
		parent::__construct($listsMapper);
		$this->api = $api;
	}

	public function getAllLists($userId) {
		return $this->mapper->getAllLists($userId);
	}

	public function addList($listName,$userId){
		if(trim($listName) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = $this->api->getAllCalendars($userId);
		foreach($calendars as $cal) {
			if($cal['displayname'] == $listName) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}
		$color = '#CCCCCC';
		$calendarId = $this->api->addCalendar($userId,$listName,$color);
		$this->api->setCalendarActive($calendarId);
		$calendar = $this->api->findCalendar($calendarId);
		return $calendar;
	}

	public function deleteList($listId){
		try {
			$del = $this->api->deleteCalendar($listId);
			if($del == true) {
				return true;
			}else{
				return array('error'=>'dberror');
			}
		} catch(Exception $e) {
			return array('message'=>$e->getMessage());
		}
	}

	public function editList($calendarId,$listName,$userId){
		if(trim($listName) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = $this->api->getAllCalendars($userId);
		foreach($calendars as $cal) {
			if($cal['userid'] != $userId){
				continue;
			}
			if($cal['displayname'] == $listName && $cal['id'] != $calendarId) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}

		$color = '#CCCCCC';
		$this->api->editCalendar($calendarId,$listName,$color);
		$calendar = $this->api->findCalendar($calendarId);
		return $calendar;
	}
}
