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

namespace OCA\Tasks\Controller;

use \OCA\Tasks\Service\TasksService;
use \OCA\Tasks\Service\ReminderService;
use \OCA\Tasks\Service\CommentsService;
use \OCP\IRequest;
use \OCP\AppFramework\Controller;


class TasksController extends Controller {

	private $tasksService;
	private $reminderService;
	private $commentsService;

	use Response;

	public function __construct($appName, IRequest $request, TasksService $tasksService, ReminderService $reminderService, CommentsService $commentsService){
		parent::__construct($appName, $request);
		$this->tasksService = $tasksService;
		$this->reminderService = $reminderService;
		$this->commentsService = $commentsService;
	}

	/**
	 * @NoAdminRequired
	 */
	public function getTasks($listID = 'all', $type = 'all'){
		return $this->generateResponse(function () use ($listID, $type) {
			return $this->tasksService->getAll($listID, $type);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function getTask($taskID){
		return $this->generateResponse(function () use ($taskID) {
			return $this->tasksService->getTask($taskID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setPriority($taskID,$priority){
		return $this->generateResponse(function () use ($taskID, $priority) {
			return $this->tasksService->setPriority($taskID, $priority);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setHideSubtasks($taskID,$hide){
		return $this->generateResponse(function () use ($taskID, $hide) {
			return $this->tasksService->hideSubtasks($taskID, $hide);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function changeParent($taskID,$related){
		return $this->generateResponse(function () use ($taskID, $related) {
			return $this->tasksService->parent($taskID, $related);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function percentComplete($taskID, $complete){
		return $this->generateResponse(function () use ($taskID, $complete) {
			return $this->tasksService->setPercentComplete($taskID, $complete);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function addTask($name, $related, $calendarID, $starred, $due, $start, $tmpID){
		return $this->generateResponse(function () use ($name, $related, $calendarID, $starred, $due, $start, $tmpID) {
			return $this->tasksService->add($name, $related, $calendarID, $starred, $due, $start, $tmpID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteTask($taskID){
		return $this->generateResponse(function () use ($taskID) {
			return $this->tasksService->delete($taskID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskName($taskID, $name){
		return $this->generateResponse(function () use ($taskID, $name) {
			return $this->tasksService->setName($taskID, $name);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskCalendar($taskID, $calendarID){
		return $this->generateResponse(function () use ($taskID, $calendarID) {
			return $this->tasksService->setCalendarId($taskID, $calendarID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setTaskNote($taskID, $note){
		return $this->generateResponse(function () use ($taskID, $note) {
			return $this->tasksService->setDescription($taskID, $note);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setDueDate($taskID, $due){
		return $this->generateResponse(function () use ($taskID, $due) {
			return $this->tasksService->setDueDate($taskID, $due);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setStartDate($taskID, $start){
		return $this->generateResponse(function () use ($taskID, $start) {
			return $this->tasksService->setStartDate($taskID, $start);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setReminderDate($taskID, $type, $action, $date, $invert, $related = null, $week, $day, $hour, $minute, $second){
		return $this->generateResponse(function () use ($taskID, $type, $action, $date, $invert, $related, $week, $day, $hour, $minute, $second) {
			return $this->reminderService->createReminder($taskID, $type, $action, $date, $invert, $related, $week, $day, $hour, $minute, $second);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function addCategory($taskID, $category){
		return $this->generateResponse(function () use ($taskID, $category) {
			return $this->tasksService->addCategory($taskID, $category);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function removeCategory($taskID, $category){
		return $this->generateResponse(function () use ($taskID, $category) {
			return $this->tasksService->removeCategory($taskID, $category);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setLocation($taskID, $location){
		return $this->generateResponse(function () use ($taskID, $location) {
			return $this->tasksService->setLocation($taskID, $location);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function addComment($taskID, $comment, $tmpID){
		return $this->generateResponse(function () use ($taskID, $comment, $tmpID) {
			return $this->commentsService->addComment($taskID, $comment, $tmpID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteComment($taskID, $commentID){
		return $this->generateResponse(function () use ($taskID, $commentID) {
			return $this->commentsService->deleteComment($taskID, $commentID);
		});
	}
}
