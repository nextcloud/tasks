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

class ListsService {

	private $userId;

	public function __construct($userId) {
		$this->userId = $userId;
	}

	/**
	 * get all calendars
	 *
	 * @return array
	 */
	public function getAll() {
		return \OC_Calendar_Calendar::allCalendars($this->userId, true);
	}

	/**
	 * add a list
	 *
	 * @param string $name
	 * @param string $tmpID
	 * @return array
	 * @throws \Exception
	 */
	public function add($name, $tmpID) {
		if(trim($name) == '') {
			throw new \Exception('An empty name is not allowed.');
		}
		if ($this->isListnameUsed($name)) {
			throw new \Exception('Calendar name already used.');
		}
		$color = '#CCCCCC';
		$listID = \OC_Calendar_Calendar::addCalendar($this->userId, strip_tags($name), 'VEVENT,VTODO,VJOURNAL', null, 0, $color);
		\OC_Calendar_Calendar::setCalendarActive($listID, 1);
		$list = \OC_Calendar_Calendar::find($listID);

		$list['tmpID'] = $tmpID;
		return $list;
	}

	/**
	 * delete list by listID
	 *
	 * @param string $listID
	 * @return array
	 */
	public function delete($listID) {
		$del = \OC_Calendar_Calendar::deleteCalendar($listID);
		if(!$del) {
			throw new \Exception('Calendar cannot be deleted.');
		}
		return array(
			'data' => array()
		);
	}

	/**
	 * set name of list by listID
	 *
	 * @param string $listID
	 * @param string $name
	 * @return array
	 * @throws \Exception
	 */
	public function setName($listID, $name) {
		if(trim($name) == '') {
			throw new \Exception('An empty name is not allowed.');
		}
		if ($this->isListnameUsed($name, $listID)) {
			throw new \Exception('Calendar name already used.');
		}
		$color = '#CCCCCC';
		\OC_Calendar_Calendar::editCalendar($listID, strip_tags($name), null, null, null, $color);
		return array();
	}

	/**
	 * check if list name is used by other list
	 *
	 * @param string $name
	 * @param string $listID
	 * @return bool
	 */
	private function isListnameUsed($name, $listID=null) {
		$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		foreach($calendars as $cal) {
			if($cal['displayname'] == $name && $cal['id'] != $listID) {
				return true;
			}
		}
		return false;
	}
}
