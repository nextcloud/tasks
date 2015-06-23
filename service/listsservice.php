<?php
namespace OCA\Tasks\Service;

class ListsService {

	private $userId;

	public function __construct($userId) {
		$this->userId = $userId;
	}

	/**
	 * get all lists
	 *
	 * @return array
	 */
	public function getAll() {
		$calendar = new \OC_Calendar_Calendar();
		$lists = $calendar::allCalendars($this->userId, true);
		return $lists;
	}

	/**
	 * add a list
	 *
	 * @param $name
	 * @param $tmpID
	 * @return array
	 * @throws \Exception
	 */
	public function add($name, $tmpID) {
		if(trim($name) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		foreach($calendars as $cal) {
			if($cal['displayname'] == $name) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}
		$color = '#CCCCCC';
		$calendarId = \OC_Calendar_Calendar::addCalendar($this->userId, strip_tags($name), 'VEVENT,VTODO,VJOURNAL', null, 0, $color);
		\OC_Calendar_Calendar::setCalendarActive($calendarId, 1);
		$list = \OC_Calendar_Calendar::find($calendarId);

		$list['tmpID'] = $tmpID;
		return $list;
	}

	/**
	 * delete list by id
	 *
	 * @param $id
	 * @return array
	 */
	public function delete($id) {
		try {
			$del = \OC_Calendar_Calendar::deleteCalendar($id);
			if($del == true) {
				return array(
					'data' => array()
				);
			} else {
				return array('error'=>'dberror');
			}
		} catch(\Exception $e) {
			return array('message'=>$e->getMessage());
		}
	}

	/**
	 * set name of list by id
	 *
	 * @param $id
	 * @param $name
	 * @return array
	 * @throws \Exception
	 */
	public function setName($id, $name) {
		if(trim($name) == '') {
			// OCP\JSON::error(array('message'=>'empty'));
			exit;
		}
		$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		foreach($calendars as $cal) {
			if($cal['userid'] != $this->userId){
				continue;
			}
			if($cal['displayname'] == $name && $cal['id'] != $id) {
				// OCP\JSON::error(array('message'=>'namenotavailable'));
				exit;
			}
		}

		$color = '#CCCCCC';
		\OC_Calendar_Calendar::editCalendar($id, strip_tags($name), null, null, null, $color);

		return array();
	}


}