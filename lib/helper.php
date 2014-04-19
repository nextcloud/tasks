<?php
/**
 * ownCloud - Utility class for VObject properties
 *
 * @author Thomas Tanghus
 * @copyright 2013-2014 Thomas Tanghus (thomas@tanghus.net)
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

namespace OCA\Tasks_enhanced;

use Sabre\VObject;
// use OCA\Tasks_enhanced\App;

Class helper {

	public static function parseVTODO($data) {
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
		$start = $vtodo->DTSTART;
		if ($start) {
			try {
				$start = $start->getDateTime();
				$start->setTimezone(new \DateTimeZone($user_timezone));
				$task['start'] = $start->format('Ymd\THis');
			} catch(\Exception $e) {
				$task['start'] = 'undefined';
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['start'] = 'undefined';
		}
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
		$reminder = $vtodo->VALARM;
		if($reminder) {
			try {

				$reminderType = $reminder->TRIGGER['VALUE']->value;
				$reminderTrigger = $reminder->TRIGGER->value;
				$reminderAction = $reminder->ACTION->value;

				if($reminderType == 'DATE-TIME'){
					$reminderDate = $reminder->TRIGGER->getDateTime();
					$reminderDate->setTimezone(new \DateTimeZone($user_timezone));
					$reminderDate = $reminderDate->format('Ymd\THis');
				} elseif ($reminderType == 'DURATION' && $start) {
					$parsed = VObject\DateTimeParser::parseDuration($reminder->TRIGGER,true);
					// Calculate the reminder date from duration and start date
					$reminderDate = $start->modify($parsed)->format('Ymd\THis');
				} else {
					$reminderDate = 'undefined';
				}
				
				
				$task['reminder'] = array(
					'type' 		=> $reminderType,
					'trigger'	=> $reminderTrigger,
					'action'	=> $reminderAction,
					'date'		=> $reminderDate
					);

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
			$timezone = \OC_Calendar_App::getTimezone();
			$timezone = new \DateTimeZone($timezone);
			$due = new \DateTime($due, $timezone);
			$vtodo->setDateTime('DUE', $due);
		} else {
			unset($vtodo->DUE);
		}
		$start = $request['start'];
		if ($start) {
			$timezone = \OC_Calendar_App::getTimezone();
			$timezone = new \DateTimeZone($timezone);
			$start = new \DateTime($start, $timezone);
			$vtodo->setDateTime('DTSTART', $start);
		} else {
			unset($vtodo->DTSTART);
		}

		return $vcalendar;
	}
}
