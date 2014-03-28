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

use \OCA\Tasks_enhanced\Db\TasksMapper;


class TasksBusinessLayer extends BusinessLayer {

	private $api;
	private $timeFactory;
	private $autoPurgeMinimumInterval;

	public function __construct(TasksMapper $tasksMapper,
	                            API $api
	                            ){
		parent::__construct($tasksMapper);
		$this->api = $api;
	}

	public function getInitialTasks($userId) {
		return $this->mapper->getInitialTasks($userId);
	}

	public function getAllTasks($userId) {
		return $this->mapper->getAllTasks($userId);
	}

	public function star($taskId, $isStarred){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			if($isStarred){
				$vtodo->setString('PRIORITY',1);
			}else{
				$vtodo->__unset('PRIORITY');
			}
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function complete($taskId, $isCompleted, $percent_complete){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			if (!empty($percent_complete)) {
				$vtodo->setString('PERCENT-COMPLETE', $percent_complete);
			}else{
				$vtodo->__unset('PERCENT-COMPLETE');
			}

			if ($percent_complete == 100) {
				if (!$isCompleted) {
					$isCompleted = 'now';
				}
			} else {
				$isCompleted = null;
			}
			if ($isCompleted) {
				$timezone = $this->api->getTimezone();
				$timezone = new \DateTimeZone($timezone);
				$isCompleted = new \DateTime($isCompleted, $timezone);
				$vtodo->setDateTime('COMPLETED', $isCompleted);
			} else {
				unset($vtodo->COMPLETED);
			}
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function add($taskName, $calendarId, $starred, $due){
		$calendars = $this->api->getAllCalendars($this->api->getUserId());
		$user_timezone = $this->api->getTimezone($this->api->getUserId());
		$request = array(
				'summary'			=> $taskName,
				'categories'		=> null,
				'priority'			=> $starred,
				'location' 			=> null,
				'due'				=> $due,
				'description'		=> null
			);
		$vcalendar = $this->api->createVCalendarFromRequest($request);
		$taskId = $this->api->addCalendarObject($calendarId, $vcalendar);

		$task = $this->api->arrayForJSON($taskId, $vcalendar->VTODO, $user_timezone);
		$task['calendarid'] = $calendarId;
		return $task;
	}

	public function setName($taskId, $name){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('SUMMARY', $name);
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function setCalendar($taskId, $calendar){
		try {
			$data = $this->api->getEventObject($taskId);
			if ($data['calendarid'] != $calendar) {
				$this->api->moveToCalendar($taskId, $calendar);
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function setNote($taskId, $note){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('DESCRIPTION', $note);
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function setDue($taskId, $due, $due_date_only){
		try{
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			$type = null;
			if ($due != 'false') {
				$timezone = $this->api->getTimezone();
				$timezone = new \DateTimeZone($timezone);

				$due = new \DateTime('@'.$due);
				$due->setTimezone($timezone);
				$type = \Sabre\VObject\Property\DateTime::LOCALTZ;
				if ($due_date_only) {
					$type = \Sabre\VObject\Property\DateTime::DATE;
				}
			}
		} catch (\Exception $e) {

		}
		$vtodo->setDateTime('DUE', $due, $type);
		$this->api->editCalendarObject($taskId, $vcalendar);
	}

	public function setReminder(){

	}

	public function setCategories($taskId, $categories){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('CATEGORIES', $categories);
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	public function setLocation($taskId, $location){
		try {
			$vcalendar = $this->mapper->findByID($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('LOCATION', $location);
			$this->api->editCalendarObject($taskId, $vcalendar);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}
}	