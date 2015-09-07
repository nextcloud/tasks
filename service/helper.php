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

use Sabre\VObject;

Class Helper {

	public function __construct(){
	}

	/**
	 * check if task is valid
	 *
	 * @param \OCA\Tasks\Db\Tasks $task
	 * @return mixed
	*/
	public function checkTask($task) {
		$object = $this->readTask($task);
		if(!$object){
			return false;
		}
		if(\OC_Calendar_Object::getowner($task->getId()) !== \OC::$server->getUserSession()->getUser()->getUID()){
			$sharedAccessClassPermissions = \OC_Calendar_Object::getAccessClassPermissions($object);
			if (!($sharedAccessClassPermissions & \OCP\Constants::PERMISSION_READ)) {
				return false;
			}
		}
		$taskID = $task->getId();
		$object = \OC_Calendar_Object::cleanByAccessClass($taskID, $object);
		$vtodo = $object->VTODO;
		$vtodo->ID = $taskID;
		return $vtodo;
	}

	/**
	 * read object from calendar data
	 *
	 * @param \OCA\Tasks\Db\Tasks $task
	 * @return mixed
	*/
	private function readTask($task){
		if (is_null($task->getSummary())) {
			return false;
		}
		return \Sabre\VObject\Reader::read($task->getCalendardata());
	}

	/**
	 * select tasks
	 *
	 * @param array $tasks
	 * @param string $type
	 * @return array
	*/
	public function selectTasks($tasks, $type) {
		$notLoaded = 0;
		switch($type){
			case 'init':	// Only select uncompleted tasks and the five most recent completed ones
				$count = count($tasks);
				$tasks_completed = $this->selectCompletedTasks($tasks);
				usort($tasks_completed, array($this, 'sortCompletedDate'));
				$tasks = array_merge($this->selectUncompletedTasks($tasks), array_slice($tasks_completed,0,5));
				$notLoaded = $count - count($tasks);
				break;
			case 'completed':
				$tasks = $this->selectCompletedTasks($tasks);
				break;
			case 'uncompleted':
				$tasks = $this->selectUncompletedTasks($tasks);
				break;
		}
		return array($notLoaded, $tasks);
	}

	/**
	 * select completed tasks
	 *
	 * @param array $tasks
	 * @return array
	*/
	private function selectCompletedTasks($tasks) {
		return array_filter($tasks, function($task) {
			return $task['completed'];
		});
	}

	/**
	 * select uncompleted tasks
	 *
	 * @param array $tasks
	 * @return array
	*/
	private function selectUncompletedTasks($tasks) {
		return array_filter($tasks, function($task) {
			return !$task['completed'];
		});
	}

	/**
	 * set property of a task
	 * 
	 * @param  int    $taskID
	 * @param  string $property
	 * @param  mixed  $value
	 * @return bool
	 * @throws \Exception
	 */
	public function setProperty($taskID,$property,$value){
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		if($value){
			$vtodo->{$property} = $value;
		}else{
			unset($vtodo->{$property});
		}
		return $this->editVCalendar($vcalendar, $taskID);
	}

	/**
	 * edit VCalendar and set modification dates
	 * 
	 * @param  mixed  $vcalendar
	 * @param  string $taskID
	 * @return bool
	 * @throws \Exception
	 */
	public function editVCalendar($vcalendar, $taskID) {
		$vtodo = $vcalendar->VTODO;
		$vtodo->{'LAST-MODIFIED'}->setValue(new \DateTime('now', new \DateTimeZone('UTC')));
		$vtodo->DTSTAMP = new \DateTime('now', new \DateTimeZone('UTC'));
		return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
	}

	/**
	 * format date
	 * 
	 * @param  string $date
	 * @return \DateTime
	 */
	public function createDateFromUNIX($date) {
		if (!$date) {
			return null;
		}
		$timezone = \OC_Calendar_App::getTimezone();
		$date = new \DateTime('@'.$date);
		return $date->setTimezone(new \DateTimeZone($timezone));
	}

	/**
	 * parse reminder string
	 *
	 * @param string $date
	 * @return string
	 */
	public function parseDateString($date) {
		$date = new \DateTime($date);
		return $this->formatDate($date);
	}

	/**
	 * parse reminder object
	 *
	 * @param object $date
	 * @param string $modifier
	 * @return string
	 */
	public function parseDateObject($date, $modifier='+0 days') {
		if(!$date) {
			return null;
		}
		return $this->formatDate($date->getDateTime(), $modifier);
	}

	/**
	 * format date object
	 *
	 * @param object $date
	 * @param string $modifier
	 * @return string
	 */
	private function formatDate($date, $modifier='+0 days') {
		$user_timezone = \OC_Calendar_App::getTimezone();
		$date->setTimezone(new \DateTimeZone($user_timezone));
		return $date->modify($modifier)->format('Ymd\THis');
	}

	/**
	 * sort tasks
	 *
	 * @param array $a
	 * @param array $b
	 * @return array
	*/
	public function sortCompletedDate($a, $b) {
		return $this->sort(\DateTime::createFromFormat('Ymd\THis', $b['completed_date']), \DateTime::createFromFormat('Ymd\THis', $a['completed_date']));
	}


	/**
	 * sort tasks by completed
	 *
	 * @param array $a
	 * @param array $b
	 * @return int
	 */
	public function sortCompleted($a, $b) {
		return $this->sort($a['completed'], $b['completed']);
	}

	/**
	 * sort tasks by completed
	 *
	 * @param mixed $t1
	 * @param mixed $t2
	 * @return int
	 */
	public function sort($t1, $t2) {
		if ($t1 == $t2) {
			return 0;
		}
		return $t1 > $t2 ? 1 : -1;
	}

	/**
	 * create calendar entry from request
	 *
	 * @param array $request
	 * @return mixed
	*/
	public function createVCalendar($request){
		$vcalendar = new \Sabre\VObject\Component\VCalendar();
		$vcalendar->PRODID = 'ownCloud Calendar';
		$vcalendar->VERSION = '2.0';

		$vtodo = $vcalendar->createComponent('VTODO');
		$vcalendar->add($vtodo);

		$vtodo->CREATED = new \DateTime('now', new \DateTimeZone('UTC'));

		$vtodo->UID = \Sabre\VObject\UUIDUtil::getUUID();
		return $this->addVTODO($vcalendar, $request);
	}

	/**
	 * update task from request
	 *
	 * @param array $request
	 * @param mixed $vcalendar
	 * @return mixed
	*/
	public function addVTODO($vcalendar, $request){
		$vtodo = $vcalendar->VTODO;
		$timezone = \OC_Calendar_App::getTimezone();
		$timezone = new \DateTimeZone($timezone);

		$vtodo->{'LAST-MODIFIED'} = new \DateTime('now', new \DateTimeZone('UTC'));
		$vtodo->DTSTAMP = new \DateTime('now', new \DateTimeZone('UTC'));
		$vtodo->SUMMARY = $request['summary'];

		if($request['starred']) {
			$vtodo->PRIORITY = 1; // prio: high
		}
		$due = $request['due'];
		if ($due) {
			$vtodo->DUE = new \DateTime($due, $timezone);
		}
		$start = $request['start'];
		if ($start) {
			$vtodo->DTSTART = new \DateTime($start, $timezone);
		}
		$related = $request['related'];
		if ($related) {
			$vtodo->{'RELATED-TO'} = $related;
		}

		return $vcalendar;
	}

	/**
	 * check if task contains query
	 *
	 * @param mixed  $vtodo
	 * @param string $query
	 * @return array
	 */
	public function checkTaskByQuery($vtodo, $query) {
		// check these properties
		$properties = array('SUMMARY', 'DESCRIPTION', 'LOCATION', 'CATEGORIES', 'COMMENT');
		foreach ($properties as $property) {
			$strings = $vtodo->{$property};
			if ($strings) {
				foreach ($strings as $string) {
					$needle = $string->getValue();
					if (stripos($needle, $query) !== false) {
						return true;
					}
				}
			}
		}
		return false;
	}
}
