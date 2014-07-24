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
		$task['created'] = $vtodo->getAsString('CREATED');
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
				$task['start'] = null;
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['start'] = null;
		}
		$due = $vtodo->DUE;
		if ($due) {
			try {
				$due = $due->getDateTime();
				$due->setTimezone(new \DateTimeZone($user_timezone));
				$task['due'] = $due->format('Ymd\THis');
			} catch(\Exception $e) {
				$task['due'] = null;
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['due'] = null;
		}
		$reminder = $vtodo->VALARM;
		if($reminder) {
			try {

				$reminderType = $reminder->TRIGGER['VALUE']->value;
				$reminderAction = $reminder->ACTION->value;
				$reminderDate = null;
				$reminderDuration = null;


				if($reminderType == 'DATE-TIME'){
					$reminderDate = $reminder->TRIGGER->getDateTime();
					$reminderDate->setTimezone(new \DateTimeZone($user_timezone));
					$reminderDate = $reminderDate->format('Ymd\THis');
				} elseif ($reminderType == 'DURATION' && ($start || $due)) {

					$parsed = VObject\DateTimeParser::parseDuration($reminder->TRIGGER,true);
					// Calculate the reminder date from duration and start date
					$related = null;
					if(is_object($reminder->TRIGGER['RELATED'])){
						$related = $reminder->TRIGGER['RELATED']->value;
						if(is_object($reminder->TRIGGER['RELATED']) && $reminder->TRIGGER['RELATED']->value == 'END' && $due){
							$reminderDate = $due->modify($parsed)->format('Ymd\THis');
						} elseif ($start) {
							$reminderDate = $start->modify($parsed)->format('Ymd\THis');
						}
					} else{
						throw new \Exception('Reminder duration related to not available date.');
					}
					$result = preg_match('/^(?P<plusminus>\+|-)?P((?P<week>\d+)W)?((?P<day>\d+)D)?(T((?P<hour>\d+)H)?((?P<minute>\d+)M)?((?P<second>\d+)S)?)?$/', $reminder->TRIGGER, $matches);
		            $invert = false;
		            if ($matches['plusminus']==='-') {
		                $invert = true;
		            }

		            $parts = array(
		                'week',
		                'day',
		                'hour',
		                'minute',
		                'second',
		            );

		            $reminderDuration = array(
		            	'token' => null
		            	);
		            foreach($parts as $part) {
		                $matches[$part] = isset($matches[$part])&&$matches[$part]?(int)$matches[$part]:0;
		                $reminderDuration[$part] = $matches[$part];
		                if($matches[$part] && !$reminderDuration['token']){
		                	$reminderDuration['token'] = $part;
		                }
		            }
		            if($reminderDuration['token'] == null){
		            	$reminderDuration['token'] = $parts[0];
		            }

					$reminderDuration['params'] = array(
							'id'	=> (int)$invert.(int)($related == 'END'),
							'related'=> $related?$related:'START',
							'invert'=>	$invert
							);

				} else {
					$reminderDate = null;
					$reminderDuration = null;
				}
				
				$task['reminder'] = array(
					'type' 		=> $reminderType,
					'action'	=> $reminderAction,
					'date'		=> $reminderDate,
					'duration'	=> $reminderDuration
					);

			} catch(\Exception $e) {
				$task['reminder'] = null;
				\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
			}
		} else {
			$task['reminder'] = null;
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
		$task['complete'] = $vtodo->getAsString('PERCENT-COMPLETE')==''?'0':$vtodo->getAsString('PERCENT-COMPLETE');
		$comments = $vtodo->COMMENT;
		if($comments){
			$comments_parsed = array();
			foreach($comments as $com) {
				$time = new \DateTime($com['DATE-TIME']->value);
				$time->setTimezone(new \DateTimeZone($user_timezone));
				$time = $time->format('Ymd\THis');
				$comments_parsed[] = array(
					'id' => (int)$com['ID']->value,
					'userID' => $com['USERID']->value,
					'name' => \OCP\USER::getDisplayName($com['USERID']->value),
					'comment' => $com->value,
					'time' => $time
					);
			}
			$task['comments'] = $comments_parsed;
		}
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
		$vtodo->setString('PERCENT-COMPLETE', $request['complete']);

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
