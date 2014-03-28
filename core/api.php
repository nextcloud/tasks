<?php

/**
 * ownCloud - Music app
 *
 * @author Morris Jobke
 * @copyright 2013 Morris Jobke <morris.jobke@gmail.com>
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


namespace OCA\Tasks_enhanced\Core;

use \OCA\AppFramework\Core\API as BaseAPI;

class API extends BaseAPI {

	public function parseVTODO($data) {
		$object = \OC_VObject::parse($data);
		$vtodo = $object->VTODO;
		return $vtodo;
	}

	public static function arrayForJSON($id, $vtodo, $user_timezone){
		$task = array( 'id' => $id );
		$task['name'] = $vtodo->getAsString('SUMMARY');
		$task['note'] = $vtodo->getAsString('DESCRIPTION');
		$task['location'] = $vtodo->getAsString('LOCATION');
		$task['categories'] = $vtodo->getAsArray('CATEGORIES');
		$due = $vtodo->DUE;
		if ($due) {
			try {
				$due = $due->getDateTime();
				$due->setTimezone(new \DateTimeZone($user_timezone));
				$task['due'] = $due->format('Ymd\THis');
			} catch(\Exception $e) {
				$task['due'] = 'undefined';
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['due'] = 'undefined';
		}
		$reminder = $vtodo->REMINDER;
		if($reminder) {
			try {
				$reminder = $reminder->getDateTime();
				$reminder->setTimezone(new \DateTimeZone($user_timezone));
				$task['reminder'] = $reminder->format('Ymd\THis');
			} catch(\Exception $e) {
				$task['reminder'] = 'undefined';
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['reminder'] = 'undefined';
		}
		$starred = $vtodo->getAsString('PRIORITY');
		if($starred){
			$task['starred'] = true;
		} else {
			$task['starred'] = false;
		}
		$completed = $vtodo->COMPLETED;
		if ($completed) {
			try {
				$completed = $completed->getDateTime();
				$completed->setTimezone(new \DateTimeZone($user_timezone));
				$task['completed_date'] = $completed->format('Ymd\THis');
				$task['completed'] = true;
			} catch(\Exception $e) {
				$task['completed'] = false;
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['completed'] = false;
		}
		$task['complete'] = $vtodo->getAsString('PERCENT-COMPLETE');
		return $task;
	}

	public static function getAllCalendars($userId){
		return \OC_Calendar_Calendar::allCalendars($userId, true);
	}

	public static function deleteCalendar($calendarId){
		return \OC_Calendar_Calendar::deleteCalendar($calendarId);
	}

	public static function addCalendar($userId,$listName,$color){
		return \OC_Calendar_Calendar::addCalendar($userId, strip_tags($listName), 'VEVENT,VTODO,VJOURNAL', null, 0, $color);
	}

	public static function setCalendarActive($calendarId){
		return \OC_Calendar_Calendar::setCalendarActive($calendarId, 1);
	}

	public static function editCalendar($calendarId,$listName,$color) {
		return \OC_Calendar_Calendar::editCalendar($calendarId, strip_tags($listName), null, null, null, $color);
	}

	public static function findCalendar($calendarId){
		return \OC_Calendar_Calendar::find($calendarId);
	}

	public static function getTimezone(){
		return \OC_Calendar_App::getTimezone();
	}

	public static function getVCalendar($taskId){
		return \OC_Calendar_App::getVCalendar($taskId);
	}

	public static function getEventObject($taskID){
		return \OC_Calendar_App::getEventObject($taskID);
	}

	public static function getAllTasks($calendarId){
		return \OC_Calendar_Object::all($calendarId);
	}

	public static function editCalendarObject($taskId, $vcalendar){
		return \OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
	}

	public static function moveToCalendar($taskId, $calendarId){
		return \OC_Calendar_Object::moveToCalendar($taskId, $calendarId);
	}

	public static function addCalendarObject($calendarId, $vcalendar){
		return \OC_Calendar_Object::add($calendarId, $vcalendar->serialize());
	}

	public static function deleteCalendarObject($taskID){
		return \OC_Calendar_Object::delete($taskID);
	}

	public static function createVCalendarFromRequest($request){
		$vcalendar = new \OC_VObject('VCALENDAR');
		$vcalendar->add('PRODID', 'ownCloud Calendar');
		$vcalendar->add('VERSION', '2.0');

		$vtodo = new \OC_VObject('VTODO');
		$vcalendar->add($vtodo);

		$vtodo->setDateTime('CREATED', 'now', \Sabre\VObject\Property\DateTime::UTC);

		$vtodo->setUID();
		return self::updateVCalendarFromRequest($request, $vcalendar);
	}

	public static function updateVCalendarFromRequest($request, $vcalendar){
		$vtodo = $vcalendar->VTODO;

		$vtodo->setDateTime('LAST-MODIFIED', 'now', \Sabre\VObject\Property\DateTime::UTC);
		$vtodo->setDateTime('DTSTAMP', 'now', \Sabre\VObject\Property\DateTime::UTC);
		$vtodo->setString('SUMMARY', $request['summary']);

		$vtodo->setString('LOCATION', $request['location']);
		$vtodo->setString('DESCRIPTION', $request['description']);
		$vtodo->setString('CATEGORIES', $request["categories"]);
		$vtodo->setString('PRIORITY', $request['priority']);

		$due = $request['due'];
		if ($due) {
			$timezone = self::getTimezone();
			$timezone = new \DateTimeZone($timezone);
			$due = new \DateTime($due, $timezone);
			$vtodo->setDateTime('DUE', $due);
		} else {
			unset($vtodo->DUE);
		}

		return $vcalendar;
	}


}