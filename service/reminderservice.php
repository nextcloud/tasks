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

use \OCA\Tasks\Service\Helper;
use Sabre\VObject;

Class ReminderService {

	private $helper;

	public function __construct(Helper $helper){
		$this->helper = $helper;
	}

	/**
	 * create reminder for task
	 * @param  int    $taskID
	 * @param  string $type
	 * @param  mixed  $action
	 * @param  mixed  $date
	 * @param  bool   $invert
	 * @param  string $related
	 * @param  mixed  $week
	 * @param  mixed  $day
	 * @param  mixed  $hour
	 * @param  mixed  $minute
	 * @param  mixed  $second
	 * @return bool
	 * @throws \Exception
	 */
	public function createReminder($taskID, $type, $action, $date, $invert, $related = null, $week, $day, $hour, $minute, $second) {
		$types = array('DATE-TIME','DURATION');
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		$valarm = $vtodo->VALARM;

		if (in_array($type,$types)) {
			if($valarm == null) {
				$valarm = $vcalendar->createComponent('VALARM');
				$valarm->ACTION = $action;
				$valarm->DESCRIPTION = 'Default Event Notification';
				$vtodo->add($valarm);
			} else {
				unset($valarm->TRIGGER);
			}
			$string = '';
			if ($type == 'DATE-TIME') {
				$string = $this->createReminderDateTime($date);
			} elseif ($type == 'DURATION') {
				$string = $this->createReminderDuration($week, $day, $hour, $minute, $second, $invert);
			}
			if($related == 'END'){
				$valarm->add('TRIGGER', $string, array('VALUE' => $type, 'RELATED' => $related));
			} else {
				$valarm->add('TRIGGER', $string, array('VALUE' => $type));
			}
		} else {
			unset($vtodo->VALARM);
		}
		return $this->helper->editVCalendar($vcalendar, $taskID);
	}

	/**
	 * parse reminder date-time
	 *
	 * @param string $date
	 * @return string
	 */
	private function createReminderDateTime($date) {
		$date = new \DateTime('@'.$date);
		return $date->format('Ymd\THis\Z');
	}

	/**
	 * parse reminder duration
	 *
	 * @param  bool   $invert
	 * @param  mixed  $week
	 * @param  mixed  $day
	 * @param  mixed  $hour
	 * @param  mixed  $minute
	 * @param  mixed  $second
	 * @return string
	 */
	private function createReminderDuration($week, $day, $hour, $minute, $second, $invert) {
		// Create duration string
		$string = 'PT0S';
		$P = array(
			'W' => $week,
			'D' => $day,
			);
		$P = array_filter($P);
		$T = array(
			'H' => $hour,
			'M' => $minute,
			'S' => $second,
			);
		$T = array_filter($T);
		if(count($P) || count($T)) {
			$string = '';
			$string .= $invert ? '-' : '';
			$string .= 'P';
			$string .= implode('' , array_map(function($value, $key) {
					return $value.$key;
				}, $P, array_keys($P))
			);
			$string .= 'T';
			$string .= implode('' , array_map(function($value, $key) {
					return $value.$key;
				}, $T, array_keys($T))
			);
		}
		return $string;
	}

	/**
	 * parse reminder
	 *
	 * @param mixed $reminder
	 * @param object $start
	 * @param object $due
	 * @return array
	 */
	public function parseReminder($reminder, $start, $due) {
		if(!$reminder) {
			return false;
		}

		if (!$reminder->TRIGGER['VALUE']){
			throw new \Exception('Reminder type not specified.');
		}
		$reminderType = $reminder->TRIGGER['VALUE']->getValue();	

		if (!$reminder->ACTION) {
			throw new \Exception('Reminder action not specified.');
		}
		$reminderAction = $reminder->ACTION->getValue();

		$reminderDate = null;
		$reminderDuration = null;

		if($reminderType == 'DATE-TIME'){
			$reminderDate = $this->helper->parseDateString($reminder->TRIGGER);
		} elseif ($reminderType == 'DURATION') {
			list($related, $reminderDate) = $this->parseReminderDuration($reminder, $due, $start);
			$reminderDuration = $this->parseReminderDurationString($reminder, $related);
		}
		return array(
			'type' 		=> $reminderType,
			'action'	=> $reminderAction,
			'date'		=> $reminderDate,
			'duration'	=> $reminderDuration,
		);
	}

	/**
	 * parse reminder duration
	 *
	 * @param mixed  $reminder
	 * @param object $due
	 * @param object $start
	 * @return string
	 */
	private function parseReminderDuration($reminder, $due, $start) {
		$parsed = VObject\DateTimeParser::parseDuration($reminder->TRIGGER,true);
		// Calculate the reminder date from duration and start date
		$related = null;
		if(is_object($reminder->TRIGGER['RELATED'])){
			$related = $reminder->TRIGGER['RELATED']->getValue();
			if($related == 'END' && $due){
				$reminderDate = $this->helper->parseDateObject($due, $parsed);
			} else {
				throw new \Exception('Reminder duration related to not available date.');
			}
		} elseif ($start) {
			$reminderDate = $this->helper->parseDateObject($start, $parsed);
		} else{
			throw new \Exception('Reminder duration related to not available date.');
		};
		return array($related, $reminderDate);
	}

	/**
	 * parse reminder date-time
	 *
	 * @param mixed $reminder
	 * @param string $related
	 * @return string
	 */
	private function parseReminderDurationString($reminder, $related) {
		preg_match('/^(?P<plusminus>\+|-)?P((?P<week>\d+)W)?((?P<day>\d+)D)?(T((?P<hour>\d+)H)?((?P<minute>\d+)M)?((?P<second>\d+)S)?)?$/', $reminder->TRIGGER, $matches);
		$invert = $matches['plusminus']==='-' ? true: false;
		$keys = array('week', 'day', 'hour', 'minute', 'second');
		$reminderDuration = array();
		foreach($keys as $key) {
			$reminderDuration[$key] = empty($matches[$key]) ? 0 : (int) $matches[$key];
		}
		$tmp = array_keys(array_filter($reminderDuration));
		$reminderDuration['token'] = count($tmp) ? $tmp[0] : 'week';
		$reminderDuration['params'] = array(
			'id'		=> (int)$invert.(int)($related == 'END'),
			'related'	=> $related?$related:'START',
			'invert'	=> $invert,
		);
		return $reminderDuration;
	}
}
