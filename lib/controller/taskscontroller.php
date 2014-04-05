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

use OCA\Tasks_enhanced\Controller,
	OCA\Tasks_enhanced\Helper,
	OCP\AppFramework\Http\JSONResponse;

class TasksController extends Controller {

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function getTasks(){
		$userId = $this->api->getUserId();
		$calendars = \OC_Calendar_Calendar::allCalendars($userId, true);
		$user_timezone = \OC_Calendar_App::getTimezone();

		$tasks = array();
		foreach( $calendars as $calendar ) {
			$calendar_tasks = \OC_Calendar_Object::all($calendar['id']);
			foreach( $calendar_tasks as $task ) {
				if($task['objecttype']!='VTODO') {
					continue;
				}
				if(is_null($task['summary'])) {
					continue;
				}
				$vtodo = Helper::parseVTODO($task['calendardata']);
				try {
					$task_data = Helper::arrayForJSON($task['id'], $vtodo, $user_timezone);
					$task_data['calendarid'] = $calendar['id'];
					$tasks[] = $task_data;
				} catch(\Exception $e) {
					\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
				}
			}
		}

		$result = array(
			'data' => array(
				'tasks' => $tasks
				)
			);
		$response = new JSONResponse();
		$response->setData($result);
		return $response;
	}

	private function setStarred($isStarred){
		$taskId = (int) $this->params('taskID');
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			if($isStarred){
				$vtodo->setString('PRIORITY',1);
			}else{
				$vtodo->__unset('PRIORITY');
			}
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function starTask(){
		$response = new JSONResponse();
		try {
			$this->setStarred(true);
			return $response;
		} catch(\Exception $e) {
			return $response;
			// return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function unstarTask(){
		$response = new JSONResponse();
		try {
			$this->setStarred(false);
			return $response;
		} catch(\Exception $e) {
			return $response;
			// return $this->renderJSON(array(), $e->getMessage());
		}
	}

	private function setCompleted($isCompleted){
		$taskId = (int) $this->params('taskID');
		$percent_complete = $isCompleted ? '100' : '0';
		$isCompleted = null;
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
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
				$timezone = \OC_Calendar_App::getTimezone();
				$timezone = new \DateTimeZone($timezone);
				$isCompleted = new \DateTime($isCompleted, $timezone);
				$vtodo->setDateTime('COMPLETED', $isCompleted);
			} else {
				unset($vtodo->COMPLETED);
			}
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function completeTask(){
		$response = new JSONResponse();
		try {
			$this->setCompleted(true);
			return $response;
		} catch(\Exception $e) {
			return $response;
			// return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function uncompleteTask(){
		$response = new JSONResponse();
		try {
			$this->setCompleted(false);
			return $response;
		} catch(\Exception $e) {
			return $response;
			// return $this->renderJSON(array(), $e->getMessage());
		}
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function addTask(){
		$taskName = $this->params('name');
		$calendarId = $this->params('calendarID');
		$starred = $this->params('starred');
		$due = $this->params('due');
		$response = new JSONResponse();
		$userId = $this->api->getUserId();
		$calendars = \OC_Calendar_Calendar::allCalendars($userId, true);
		$user_timezone = \OC_Calendar_App::getTimezone();
		$request = array(
				'summary'			=> $taskName,
				'categories'		=> null,
				'priority'			=> $starred,
				'location' 			=> null,
				'due'				=> $due,
				'description'		=> null
			);
		$vcalendar = Helper::createVCalendarFromRequest($request);
		$taskId = \OC_Calendar_Object::add($calendarId, $vcalendar->serialize());

		$task = Helper::arrayForJSON($taskId, $vcalendar->VTODO, $user_timezone);
		$task['calendarid'] = $calendarId;

		$task['tmpID'] = $this->params('tmpID');
		$result = array(
			'data' => array(
				'task' => $task
				)
		);
		$response->setData($result);
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function deleteTask(){
		$response = new JSONResponse();
		$taskId = $this->params('taskID');
		$task = \OC_Calendar_App::getEventObject($taskId);
		\OC_Calendar_Object::delete($taskId);
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskName(){
		$taskId = (int) $this->params('taskID');
		$taskName = $this->params('name');
		$response = new JSONResponse();
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('SUMMARY', $taskName);
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskCalendar(){
		$taskId = $this->params('taskID');
		$calendarId = $this->params('calendarID');
		$response = new JSONResponse();
		try {
			$data = \OC_Calendar_App::getEventObject($taskId);
			if ($data['calendarid'] != $calendar) {
				\OC_Calendar_Object::moveToCalendar($taskId, $calendarId);
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setTaskNote(){
		$taskId = $this->params('taskID');
		$note = $this->params('note');
		$response = new JSONResponse();
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('DESCRIPTION', $note);
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setDueDate(){
		$taskId = $this->params('taskID');
		$due = $this->params('due');
		$response = new JSONResponse();
		$date = 1;
		try{
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			$type = null;
			if ($due != 'false') {
				$timezone = \OC_Calendar_App::getTimezone();
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
		\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setReminderDate(){
		$taskID = $this->params('taskID');
		$reminder = $this->params('reminder');
		$response = new JSONResponse();
		//TODO


		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setCategories($taskId, $categories){
		$taskId = $this->params('taskID');
		$categories = $this->params('categories');
		$response = new JSONResponse();
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('CATEGORIES', $categories);
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $response;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setLocation($taskId, $location){
		$taskId = $this->params('taskID');
		$location = $this->params('location');
		$response = new JSONResponse();
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskId);
			$vtodo = $vcalendar->VTODO;
			$vtodo->setString('LOCATION', $location);
			\OC_Calendar_Object::edit($taskId, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $response;
	}


}