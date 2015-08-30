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
use \OCA\Tasks\Service\TaskParser;
use \OCA\Tasks\Db\TasksMapper;
use \OCA\Tasks\Service\MapperHelper;

class TasksService {

	private $userId;
	private $tasksMapper;
	private $mapperHelper;
	private $helper;
	private $taskParser;

	public function __construct($userId, TasksMapper $tasksMapper, MapperHelper $mapperHelper, Helper $helper, TaskParser $taskParser){
		$this->userId = $userId;
		$this->tasksMapper = $tasksMapper;
		$this->mapperHelper = $mapperHelper;
		$this->helper = $helper;
		$this->taskParser = $taskParser;
	}

	/**
	 * get a list of Tasks filtered by listID and type
	 * 
	 * @param  string $listID
	 * @param  string $type
	 * @return array
	 * @throws \Exception
	 */
	public function getAll($listID = 'all', $type = 'all'){
		
		if ($listID == 'all'){
			$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		} else {
			$calendar = \OC_Calendar_App::getCalendar($listID, true, false);
			$calendars = array($calendar);
		}

		$tasks = array();
		$lists = array();
		foreach( $calendars as $calendar ) {
			$tasksMap = $this->mapperHelper->createTasksMap($calendar['id']);

			list($lists[], $rootTasks) = $this->mapperHelper->getRootTasks($tasksMap, $type, $calendar['id']);

			$tasks = array_merge($tasks, $rootTasks);

			foreach($rootTasks as $rootTask) {
				$tasks = array_merge($tasks, $this->mapperHelper->getChildTasks($rootTask['uid'], $tasksMap, true));
			}
		}
		return array(
			'tasks' => array_values($tasks),
			'lists' => $lists
		);
	}

	/**
	 * get task by id
	 * 
	 * @param  string $taskID
	 * @return array
	 * @throws \Exception
	 */
	public function getTask($taskID){
		$tasks = array();
		$calendar_entry = $this->tasksMapper->findVTODOById($taskID);
		$tasksMap = $this->mapperHelper->createTasksMap($calendar_entry->getCalendarid());
		$rootUID = $this->mapperHelper->findRootUID($this->mapperHelper->getUIDbyID($taskID, $tasksMap), $tasksMap);

		$rootTask = $this->mapperHelper->getTaskByUID($rootUID, $tasksMap);
		if ($rootTask) {
			$tasks = array_merge(array($rootTask), $this->mapperHelper->getChildTasks($rootUID, $tasksMap, true));
		}

		return array(
			'tasks' => $tasks
		);
	}

	/**
	 * Search for query in tasks
	 *
	 * @param string $query
	 * @return array
	 */
	public function search($query) {
		$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		$results = array();
		foreach ($calendars as $calendar) {
			$calendar_entries = $this->tasksMapper->findAllVTODOs($calendar['id']);
		 	// search all calendar objects, one by one
			foreach ($calendar_entries as $calendar_entry) {
				$vtodo = $this->helper->checkTask($calendar_entry);
				if(!$vtodo){
					continue;
				}
				if($this->helper->checkTaskByQuery($vtodo, $query)) {
					$results[] = $this->taskParser->parseTask($vtodo, $calendar_entry->getCalendarid());
				}
			}
		}
		usort($results, array($this->helper, 'sortCompleted'));
		return $results;
	}

	/**
	 * create new task
	 * 
	 * @param  string $taskName
	 * @param  int    $calendarId
	 * @param  bool   $starred
	 * @param  mixed  $due
	 * @param  mixed  $start
	 * @param  int    $tmpID
	 * @return array
	 */
	public function add($taskName, $related, $calendarId, $starred, $due, $start, $tmpID){
		$request = array(
				'summary'			=> $taskName,
				'related'			=> $related,
				'starred'			=> $starred,
				'due'				=> $due,
				'start'				=> $start,
			);
		$vcalendar = $this->helper->createVCalendar($request);
		$vtodo = $vcalendar->VTODO;
		$vtodo->ID = \OC_Calendar_Object::add($calendarId, $vcalendar->serialize());

		$task = $this->taskParser->parseTask($vtodo, $calendarId);

		$task['tmpID'] = $tmpID;
		return $task;
	}

	/**
	 * delete task by id
	 * 
	 * @param  int   $taskID
	 * @return bool
	 */
	public function delete($taskID) {
		return \OC_Calendar_Object::delete($taskID);
	}

	/**
	 * set name of task by id
	 * @param  int    $taskID
	 * @param  string $name
	 * @return bool
	 * @throws \Exception
	 */
	public function setName($taskID, $name) {
		return $this->helper->setProperty($taskID,'SUMMARY',$name);
	}

	/**
	 * set calendar id of task by id
	 * 
	 * @param  int    $taskID
	 * @param  int    $calendarID
	 * @return bool
	 * @throws \Exception
	 */
	public function setCalendarId($taskID, $calendarID) {
		$data = \OC_Calendar_App::getEventObject($taskID);
		if ($data['calendarid'] != $calendarID) {
			return \OC_Calendar_Object::moveToCalendar($taskID, $calendarID);
		} else {
			return true;
		}
	}

	/**
	 * set completeness of task in percent by id
	 * 
	 * @param  int    $taskID
	 * @param  int    $percent_complete
	 * @return bool
	 * @throws \Exception
	 */
	public function setPercentComplete($taskID, $percent_complete) {
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		if (!empty($percent_complete)) {
			$vtodo->{'PERCENT-COMPLETE'} = $percent_complete;
		}else{
			unset($vtodo->{'PERCENT-COMPLETE'});
		}
		if ($percent_complete == 100) {
			$vtodo->STATUS = 'COMPLETED';
			$vtodo->COMPLETED = new \DateTime('now', new \DateTimeZone('UTC'));
		} elseif ($percent_complete != 0) {
			$vtodo->STATUS = 'IN-PROCESS';
			unset($vtodo->COMPLETED);
		} else{
			$vtodo->STATUS = 'NEEDS-ACTION';
			unset($vtodo->COMPLETED);
		}
		return $this->helper->editVCalendar($vcalendar, $taskID);
	}

	/**
	 * set priority of task by id
	 * 
	 * @param  int    $taskID
	 * @param  int    $priority
	 * @return bool
	 * @throws \Exception
	 */
	public function setPriority($taskID, $priority){
		$priority = (10 - $priority) % 10;
		return $this->helper->setProperty($taskID,'PRIORITY',$priority);
	}

	/**
	 * set view state of subtasks
	 * 
	 * @param  int    $taskID
	 * @param  int    $show
	 * @return bool
	 */
	public function hideSubtasks($taskID, $show){
		return $this->helper->setProperty($taskID,'X-OC-HIDESUBTASKS',$show);
	}

	/**
	 * set parent of subtask
	 * 
	 * @param  int    $taskID
	 * @param  int    $related
	 * @return bool
	 */
	public function parent($taskID, $related){
		return $this->helper->setProperty($taskID,'RELATED-TO',$related);
	}

	/**
	 * set due date of task by id
	 * 
	 * @param  int    $taskID
	 * @param  mixed  $dueDate
	 * @return bool
	 * @throws \Exception
	 */
	public function setDueDate($taskID, $dueDate) {
		return $this->helper->setProperty($taskID, 'DUE', $this->helper->createDateFromUNIX($dueDate));
	}

	/**
	 * set start date of task by id
	 * 
	 * @param  int    $taskID
	 * @param  mixed  $startDate
	 * @return bool
	 * @throws \Exception
	 */
	public function setStartDate($taskID, $startDate) {
		return $this->helper->setProperty($taskID, 'DTSTART', $this->helper->createDateFromUNIX($startDate));
	}

	/**
	 * add category to task by id
	 * @param  int    $taskID
	 * @param  string $category
	 * @return bool
	 * @throws \Exception
	 */
	public function addCategory($taskID, $category){
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		// fetch categories from TODO
		$categories = $vtodo->CATEGORIES;
		$taskcategories = array();
		if ($categories){
			$taskcategories = $categories->getParts();
		}
		// add category
		if (!in_array($category, $taskcategories)){
			$taskcategories[] = $category;
			$vtodo->CATEGORIES = $taskcategories;
			return $this->helper->editVCalendar($vcalendar, $taskID);
		} else {
			return true;
		}
	}

	/**
	 * remove category from task by id
	 * @param  int    $taskID
	 * @param  string $category
	 * @return bool
	 * @throws \Exception
	 */
	public function removeCategory($taskID, $category){
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		// fetch categories from TODO
		$categories = $vtodo->CATEGORIES;
		if ($categories){
			$taskcategories = $categories->getParts();
			// remove category
			$key = array_search($category, $taskcategories);
			if ($key !== null && $key !== false){
				unset($taskcategories[$key]);
				if(count($taskcategories)){
					$vtodo->CATEGORIES = $taskcategories;
				} else{
					unset($vtodo->{'CATEGORIES'});
				}
				return $this->helper->editVCalendar($vcalendar, $taskID);
			}
		}
		return true;
	}

	/**
	 * set location of task by id
	 * @param  int    $taskID
	 * @param  string $location
	 * @return bool
	 * @throws \Exception
	 */
	public function setLocation($taskID, $location){
		return $this->helper->setProperty($taskID,'LOCATION',$location);
	}

	/**
	 * set description of task by id
	 * 
	 * @param  int    $taskID
	 * @param  string $description
	 * @return bool
	 * @throws \Exception
	 */
	public function setDescription($taskID, $description){
		return $this->helper->setProperty($taskID,'DESCRIPTION',$description);
	}
}
