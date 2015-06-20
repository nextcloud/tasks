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

namespace OCA\Tasks\Controller;

use \OCP\IRequest;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;
use \OCA\Tasks\Controller\Helper;

class TasksController extends Controller {

	private $userId;
	private $tasksService;

	public function __construct($appName, IRequest $request, TasksService $tasksService, $userId){
		parent::__construct($appName, $request);
		$this->tasksService = $tasksService;
		$this->userId = $userId;		
	}

	/**
	 * @NoAdminRequired
	 */
	public function getTasks($listID = 'all', $type = 'all'){
		$result = $this->tasksService->getAll($listID, $type);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function getTask($taskID){
		$result = $this->tasksService->get($taskID);
		$response = array(
			'data' => array(
				'task' => $result
			)
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function starTask($taskID){
		$result = $this->tasksService->setStarred($taskID, true);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function unstarTask($taskID){
		$result = $this->tasksService->setStarred($taskID, false);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function percentComplete($taskID, $complete){
		$result = $this->tasksService->setPercentComplete($taskID, $complete);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}


	/**
	 * @NoAdminRequired
	 */
	public function completeTask(){
		$result = $this->tasksService->setPercentComplete($taskID, 100);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function uncompleteTask(){
		$result = $this->tasksService->setPercentComplete($taskID, 0);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function addTask($taskName, $calendarId, $starred, $due, $start, $tmpID){
		$result = $this->tasksService->add($taskName, $calendarId, $starred, $due, $start, $tmpID);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteTask($taskID){
		$result = $this->tasksService->delete($taskID);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskName($taskID, $name){
		$result = $this->tasksService->setName($taskID, $name);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskCalendar($taskID, $calendarID){
		$result = $this->tasksService->setCalendarId($taskID, $calendarID);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskNote($taskID, $note){
		$result = $this->tasksService->setDescription($taskID, $note);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setDueDate($taskID, $due){
		$result = $this->tasksService->setDueDate($taskID, $due);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setStartDate($taskID, $start){
		$result = $this->tasksService->setStartDate($taskID, $start);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setReminderDate($taskID, $type, $action, $date, $invert, $related = null, $week, $day, $hour, $minute, $second){
		$result = $this->tasksService->setReminderDate($taskID, $type, $action, $date, $invert, $related = null, $week, $day, $hour, $minute, $second);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function addCategory($taskID, $category){
		$result = $this->tasksService->addCategory($taskID, $category);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function removeCategory($taskID, $category){
		$result = $this->tasksService->removeCategory($taskID, $category);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setLocation($taskID, $location){
		$result = $this->tasksService->setLocation($taskID, $location);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function addComment($taskID, $comment, $tmpID){
		$result = $this->tasksService->addComment($taskID, $comment);
		$response = array(
			'data' => array(
				'comment' => $result
			)
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteComment($taskID, $commentID){
		$result = $this->tasksService->deleteComment($taskID, $commentID);
		$response = array(
			'data' => array(
				'comment' => $result
			)
		);
		return (new JSONResponse())->setData($response);
	}
}
