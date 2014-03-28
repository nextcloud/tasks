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

namespace OCA\Tasks_enhanced\Controller;

use \OCA\AppFramework\Controller\Controller;
use \OCA\AppFramework\Core\API;
use \OCA\AppFramework\Http\Request;

use \OCA\Tasks_enhanced\BusinessLayer\TasksBusinessLayer;

class TasksController extends Controller {

	private $tasksBusinessLayer;

	public function __construct(API $api, Request $request, 
	                            TasksBusinessLayer $tasksBusinessLayer){
		parent::__construct($api, $request);
		$this->tasksBusinessLayer = $tasksBusinessLayer;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function getTasks(){
		$tasks = $this->tasksBusinessLayer->getAllTasks($this->api->getUserId());
		$result = array(
			'tasks' => $tasks
		);
		return $this->renderJSON($result);
	}

	private function setStarred($isStarred){
		$taskID = (int) $this->params('taskID');
		$this->tasksBusinessLayer->star($taskID, $isStarred);
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function starTask(){
		try {
			$this->setStarred(true);
			return $this->renderJSON();
		} catch(\Exception $e) {
			return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function unstarTask(){
		try {
			$this->setStarred(false);
			return $this->renderJSON();
		} catch(\Exception $e) {
			return $this->renderJSON(array(), $e->getMessage());
		}
	}

	private function setCompleted($isCompleted){
		$taskId = (int) $this->params('taskID');
		$this->tasksBusinessLayer->complete($taskId, null, $isCompleted ? '100' : '0');
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function completeTask(){
		try {
			$this->setCompleted(true);
			return $this->renderJSON();
		} catch(\Exception $e) {
			return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function uncompleteTask(){
		try {
			$this->setCompleted(false);
			return $this->renderJSON();
		} catch(\Exception $e) {
			return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function addTask(){
		$taskName = $this->params('name');
		$calendarID = $this->params('calendarID');
		$starred = $this->params('starred');
		$due = $this->params('due');
		$task = $this->tasksBusinessLayer->add($taskName, $calendarID, $starred, $due);
		$task['tmpID'] = $this->params('tmpID');
		$result = array(
			'task' => $task
		);
		return $this->renderJSON($result);
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function deleteTask(){
		$taskId = $this->params('taskID');
		$task = $this->api->getEventObject($taskId);

		$this->api->deleteCalendarObject($taskId);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskName(){
		$taskId = (int) $this->params('taskID');
		$taskName = $this->params('name');
		$this->tasksBusinessLayer->setName($taskId, $taskName);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskCalendar(){
		$taskId = $this->params('taskID');
		$calendarId = $this->params('calendarID');
		$this->tasksBusinessLayer->setCalendar($taskId, $calendarId);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskNote(){
		$taskId = $this->params('taskID');
		$note = $this->params('note');
		$this->tasksBusinessLayer->setNote($taskId, $note);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setDueDate(){
		$taskId = $this->params('taskID');
		$due = $this->params('due');
		$date = 1;
		$this->tasksBusinessLayer->setDue($taskId, $due, $date);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setReminderDate(){
		$taskID = $this->params('taskID');
		$reminder = $this->params('reminder');
		$this->tasksBusinessLayer->setReminder($taskId, $due);
		return $this->renderJSON();
	}


}