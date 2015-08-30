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

Class MapperHelper {

	private $tasksMapper;
	private $helper;
	private $taskParser;

	public function __construct(TasksMapper $tasksMapper, Helper $helper, TaskParser $taskParser){
		$this->tasksMapper = $tasksMapper;
		$this->helper = $helper;
		$this->taskParser = $taskParser;
	}

	/**
	 * creates a map of the tasks to find tasks by UID and RELATED-TO
	 * checks the calendar entries and returns and array with two arrays as content:
	 * [0] -> an array of the parsed tasks with the UIDs as keys
	 * [1] -> an array of arrays containing the child UIDs with the parent UIDs as keys
	 * [2] -> an array of the UIDs with the IDs as keys
	 *
	 * this function should be removed once the UID and the RELATED-TO property is directly stored in the database
	 * and tasks can be found by querying the UID or RELATED-TO properties
	 * TODO
	 *
	 * @param string $calendarID
	 * @return array
	*/
	public function createTasksMap($calendarID) {
		$calendar_entries = $this->tasksMapper->findAllVTODOs($calendarID);
		$host = $this;
		$VTODOs = array_map(function($task) use ($host) {
			return $host->helper->checkTask($task);
		}, $calendar_entries);
		$VTODOs = array_filter($VTODOs);
		$tasks = array_map(function($task) use ($host, $calendarID) {
    		return $host->taskParser->parseTask($task, $calendarID);
		},$VTODOs);

		$mapUID = array();
		$mapRelatedTo = array();
		$mapID = array();
		foreach ($tasks as $task) {
			$mapUID[$task['uid']] = $task;	// create UID map
			$mapID[$task['id']] = $task['uid'];	// create ID map
			if ($task['related']) {			// create RELATED-TO map
				$mapRelatedTo[$task['related']][] = $task['uid'];
			}
		}
		return array($mapUID, $mapRelatedTo, $mapID);
	}

	/**
	 * find a task by its UID
	 *
	 * currently needs the tasks Map created by $this->createTasksMap
	 * has to find the task only by its UID by a database query once that's possible
	 * TODO
	 *
	 * @param string $UID
	 * @param array  $tasksMap
	 * @return mixed
	*/
	public function getTaskByUID($UID, $tasksMap) {
		if (isset($tasksMap[0][$UID])) {
			return $tasksMap[0][$UID];
		}
		return false;
	}

	/**
	 * find tasks by their parent UID
	 *
	 * currently needs the tasks Map created by $this->createTasksMap
	 * has to find the tasks only by their RELATED-TO property by a database query once that's possible
	 * TODO
	 *
	 * @param string $parentUID
	 * @param array  $tasksMap
	 * @return array
	*/
	private function getTasksByParentUID($parentUID, $tasksMap) {
		$tasks = array();
		if (isset($tasksMap[1][$parentUID])){
			$UIDs = $tasksMap[1][$parentUID];
			foreach ($UIDs as $UID) {
				$task = $this->getTaskByUID($UID, $tasksMap);
				if ($task) {
					$tasks[] = $task;
				}
			}
		}
		return $tasks;
	}

	/**
	 * get tasks
	 *
	 * @param array  $tasksMap
	 * @param string $type
	 * @param string $calendarID
	 * @return array
	*/
	public function getRootTasks($tasksMap, $type, $calendarID) {
		$list = array(
			'id' 		=> $calendarID,
			'notLoaded' => 0
			);
		$host = $this;
		$rootTasks = array_filter($tasksMap[0], function($task) use ($host, $tasksMap) {
			return $host->isRootTask($task, $tasksMap);
		});

		list($list['notLoaded'], $rootTasks) = $this->helper->selectTasks($rootTasks, $type);
		return array($list, $rootTasks);
	}

	/**
	 * check if root task
	 *
	 * @param array $task
	 * @param array $tasksMap
	 * @return bool
	*/
	private function isRootTask($task, $tasksMap) {
		if ($task['related']) {
			return !(bool) $this->getTaskByUID($task['related'], $tasksMap);
		}
		return true;
	}

	/**
	 * find taskID of root task
	 *
	 * @param string $taskUID
	 * @param array $tasksMap
	 * @return string
	*/
	public function findRootUID($taskUID, $tasksMap) {
		$task = $this->getTaskByUID($taskUID, $tasksMap);
		if ($this->isRootTask($task, $tasksMap)) {
			return $taskUID;
		}
		$parent = $this->getTaskByUID($task['related'], $tasksMap);
		return $this->findRootUID($parent['uid'], $tasksMap);
	}

	/**
	 * find taskUID by taskID
	 *
	 * @param string $taskID
	 * @param array $tasksMap
	 * @return string
	*/
	public function getUIDbyID($taskID, $tasksMap) {
		if (isset($tasksMap[2][$taskID])) {
			return $tasksMap[2][$taskID];
		}
		return null;
	}

	/**
	 * get child tasks by parentUID
	 *
	 * @param string $parentUID
	 * @param array  $tasksMap
	 * @param bool   $deep
	 * @return array
	*/
	public function getChildTasks($parentUID, $tasksMap, $deep=true) {
		$childTasks = $this->getTasksByParentUID($parentUID, $tasksMap);
		if ($deep) {
			$subChildTasks = array();
			foreach ($childTasks as $childTask) {
				$subChildTasks = array_merge($subChildTasks, $this->getChildTasks($childTask['uid'], $tasksMap, $deep));
			}
			$childTasks = array_merge($childTasks, $subChildTasks);
		}
		return $childTasks;
	}

}
