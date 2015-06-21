<?php
namespace OCA\Tasks\Service;

use \OCA\Tasks\Controller\Helper;

class TasksService {

	private $userId;

	public function __construct($userId){
		$this->userId = $userId;
	}

	/**
	 * get a list of Tasks filtered by listID and type
	 * 
	 * @param  string $listID
	 * @param  string $type
	 * @return array
	 */
	public function getAll($listID = 'all', $type = 'all'){
		
		$user_timezone = \OC_Calendar_App::getTimezone();
		if ($listID == 'all'){
			$calendars = \OC_Calendar_Calendar::allCalendars($this->userId, true);
		} else {
			$calendar = \OC_Calendar_App::getCalendar($listID, true, false);
			$calendars = array($calendar);
		}

		$tasks = array();
		$lists = array();
		foreach( $calendars as $calendar ) {
			$calendar_entries = \OC_Calendar_Object::all($calendar['id']);
			$tasks_selected = array();
			foreach( $calendar_entries as $task ) {
				if($task['objecttype']!='VTODO') {
					continue;
				}
				if(is_null($task['summary'])) {
					continue;
				}
				if(!($vtodo = Helper::parseVTODO($task))){
					continue;
				}
				try {
					$task_data = Helper::arrayForJSON($task['id'], $vtodo, $user_timezone, $calendar['id']);
					switch($type){
						case 'all':
							$tasks[] = $task_data;
							break;
						case 'init':
							if (!$task_data['completed']){
								$tasks[] = $task_data;
							} else {
								$tasks_selected[] = $task_data;
							}
							break;
						case 'completed':
							if ($task_data['completed']){
								$tasks[] = $task_data;
							}
							break;
						case 'uncompleted':
							if (!$task_data['completed']){
								$tasks[] = $task_data;
							}
							break;
					}
				} catch(\Exception $e) {
					\OCP\Util::writeLog('tasks', $e->getMessage(), \OCP\Util::ERROR);
				}
			}
			$nrCompleted = 0;
			$notLoaded = 0;
			usort($tasks_selected, array($this, 'sort_completed'));
			foreach( $tasks_selected as $task_selected){
				$nrCompleted++;
				if ($nrCompleted > 5){
					$notLoaded++;
					continue;
				}
				$tasks[] = $task_selected;
			}
			$lists[] = array(
				'id' 		=> $calendar['id'],
				'notLoaded' => $notLoaded
				);
		}
		return array(
			'tasks' => $tasks,
			'lists' => $lists
		);
	}

	/**
	 * get task by id
	 * 
	 * @param  string $taskID
	 * @return array
	 */
	public function get($taskID){
		$object = \OC_Calendar_App::getEventObject($taskID);
		$user_timezone = \OC_Calendar_App::getTimezone();
		$task = array();
		if($object['objecttype']=='VTODO' && !is_null($object['summary'])) {
			if($vtodo = Helper::parseVTODO($object)){
				try {
					$task_data = Helper::arrayForJSON($object['id'], $vtodo, $user_timezone, $object['calendarid']);
					$task[] = $task_data;
				} catch(\Exception $e) {
					\OCP\Util::writeLog('tasks', $e->getMessage(), \OCP\Util::ERROR);
				}
			}
		}
		return array(
			'tasks' => $task
		);
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
	public function add($taskName, $calendarId, $starred, $due, $start, $tmpID){
		$user_timezone = \OC_Calendar_App::getTimezone();
		$request = array(
				'summary'			=> $taskName,
				'categories'		=> null,
				'priority'			=> $starred,
				'location' 			=> null,
				'due'				=> $due,
				'start'				=> $start,
				'description'		=> null
			);
		$vcalendar = Helper::createVCalendarFromRequest($request);
		$taskID = \OC_Calendar_Object::add($calendarId, $vcalendar->serialize());

		$task = Helper::arrayForJSON($taskID, $vcalendar->VTODO, $user_timezone, $calendarId);

		$task['tmpID'] = $tmpID;
		return array(
			'task' => $task
		);
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
	 */
	public function setName($taskID, $name) {
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			$vtodo->SUMMARY = $taskName;
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * set calendar id of task by id
	 * 
	 * @param  int    $taskID
	 * @param  int    $calendarID
	 * @return bool
	 */
	public function setCalendarId($taskID, $calendarID) {
		try {
			$data = \OC_Calendar_App::getEventObject($taskID);
			if ($data['calendarid'] != $calendarId) {
				return \OC_Calendar_Object::moveToCalendar($taskID, $calendarId);
			} else {
				return true;
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * star or unstar task by id
	 * 
	 * @param int    $taskID
	 * @param bool   $isStarred
	 */
	public function setStarred($taskID, $isStarred) {
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			if($isStarred) {
				$vtodo->PRIORITY = 5; // prio: medium
			} else {
				$vtodo->PRIORITY = 0;
			}
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch(\Exception $e) {
			return false;
		}
	}

	/**
	 * set completeness of task in percent by id
	 * 
	 * @param  int    $taskID
	 * @param  int    $percent_complete
	 * @return bool
	 */
	public function setPercentComplete($taskID, $percent_complete) {
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			if (!empty($percent_complete)) {
				$vtodo->{'PERCENT-COMPLETE'} = $percent_complete;
			}else{
				$vtodo->__unset('PERCENT-COMPLETE');
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
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch(\Exception $e) {
			return false;// throw new BusinessLayerException($e->getMessage());
		}
	}

	/**
	 * set due date of task by id
	 * 
	 * @param  int    $taskID
	 * @param  mixed  $dueDate
	 * @return bool
	 */
	public function setDueDate($taskID, $dueDate) {
		try{
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			if ($dueDate != false) {
				$timezone = \OC_Calendar_App::getTimezone();
				$timezone = new \DateTimeZone($timezone);

				$dueDate = new \DateTime('@'.$dueDate);
				$dueDate->setTimezone($timezone);
				$vtodo->DUE = $dueDate;
			} else {
				unset($vtodo->DUE);
			}
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch (\Exception $e) {
			return false;
		}
	}

	public function setStartDate($taskID, $startDate) {
		try{
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			if ($startDate != false) {
				$timezone = \OC_Calendar_App::getTimezone();
				$timezone = new \DateTimeZone($timezone);

				$startDate = new \DateTime('@'.$startDate);
				$startDate->setTimezone($timezone);
				$vtodo->DTSTART = $startDate;
			} else {
				unset($vtodo->DTSTART);
			}
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch (\Exception $e) {
			return false;
		}
	}

	/**
	 * set reminder date of task by id
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
	 */
	public function setReminderDate($taskID, $type, $action, $date, $invert, $related = null, $week, $day, $hour, $minute, $second){
		$types = array('DATE-TIME','DURATION');

		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		$valarm = $vtodo->VALARM;

		if ($type == false){
			unset($vtodo->VALARM);
			$vtodo->__get('LAST-MODIFIED')->setValue(new \DateTime('now', new \DateTimeZone('UTC')));
			$vtodo->DTSTAMP = new \DateTime('now', new \DateTimeZone('UTC'));
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		}
		elseif (in_array($type,$types)) {
			try{
				if($valarm == null) {
					$valarm = $vcalendar->createComponent('VALARM');
					$valarm->ACTION = $action;
					$valarm->DESCRIPTION = 'Default Event Notification';
					$vtodo->add($valarm);
				} else {
					unset($valarm->TRIGGER);
				}
				$tv = '';
				if ($type == 'DATE-TIME') {
					$date = new \DateTime('@'.$this->params('date'));
					$tv = $date->format('Ymd\THis\Z');
				} elseif ($type == 'DURATION') {
					// Create duration string
					if($week || $day || $hour || $minute || $second) {
						if ($invert){
							$tv.='-';
						}
						$tv.='P';
						if ($week){
							$tv.=$week.'W';
						}
						if ($day){
							$tv.=$day.'D';
						}
						$tv.='T';
						if ($hour){
							$tv.=$hour.'H';
						}
						if ($minute){
							$tv.=$minute.'M';
						}
						if ($second){
							$tv.=$second.'S';
						}
					}else{
						$tv = 'PT0S';
					}
				}
				if($related == 'END'){
					$valarm->add('TRIGGER', $tv, array('VALUE' => $type, 'RELATED' => $related));
				} else {
					$valarm->add('TRIGGER', $tv, array('VALUE' => $type));
				}
				$vtodo->__get('LAST-MODIFIED')->setValue(new \DateTime('now', new \DateTimeZone('UTC')));
				$vtodo->DTSTAMP = new \DateTime('now', new \DateTimeZone('UTC'));
				return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
			} catch (\Exception $e) {
				return false;
			}
		}
	}

	/**
	 * add category to task by id
	 * @param  int    $taskID
	 * @param  string $category
	 * @return bool
	 */
	public function addCategory($taskID, $category){
		$taskID = $this->params('taskID');
		$category = $this->params('category');
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			// fetch categories from TODO
			$categories = $vtodo->CATEGORIES;
			if ($categories){
				$taskcategories = $categories->getParts();
			}
			// add category
			if (!in_array($category, $taskcategories)){
				$taskcategories[] = $category;
				$vtodo->CATEGORIES = $taskcategories;
				return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
			} else {
				return true;
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * remove category from task by id
	 * @param  int    $taskID
	 * @param  string $category
	 * @return bool
	 */
	public function removeCategory($taskID, $category){
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			// fetch categories from TODO
			$categories = $vtodo->CATEGORIES;
			if ($categories){
				$taskcategories = $categories->getParts();
			}
			// remove category
			$key = array_search($category, $taskcategories);
			if ($key !== null && $key !== false){
				unset($taskcategories[$key]);
				if(count($taskcategories)){
					$vtodo->CATEGORIES = $taskcategories;
				} else{
					$vtodo->__unset('CATEGORIES');
				}
				return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * set location of task by id
	 * @param  int    $taskID
	 * @param  string $location
	 * @return bool
	 */
	public function setLocation($taskID, $location){
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			$vtodo->LOCATION = $location;
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * set description of task by id
	 * 
	 * @param  int    $taskID
	 * @param  string $description
	 * @return bool
	 */
	public function setDescription($taskID, $description){
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			$vtodo->DESCRIPTION = $description;
			return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
	}

	/**
	 * add comment to task by id
	 * @param  int    $taskID
	 * @param  string $comment
	 * @param  int    $tmpID
	 * @return array
	 */
	public function addComment($taskID, $comment, $tmpID){
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;

			if($vtodo->COMMENT == "") {
				// if this is the first comment set the id to 0
				$commentId = 0;
			} else {
				// Determine new commentId by looping through all comments
				$commentIds = array();
				foreach($vtodo->COMMENT as $com) {
					$commentIds[] = (int)$com['X-OC-ID']->getValue();
				}
				$commentId = 1+max($commentIds);
			}

			$now = 	new \DateTime();
			$vtodo->add('COMMENT',$comment,
				array(
					'X-OC-ID' => $commentId,
					'X-OC-USERID' => $this->userId,
					'X-OC-DATE-TIME' => $now->format('Ymd\THis\Z')
					)
				);
			\OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
			$user_timezone = \OC_Calendar_App::getTimezone();
			$now->setTimezone(new \DateTimeZone($user_timezone));
			$comment = array(
				'taskID' => $taskID,
				'id' => $commentId,
				'tmpID' => $tmpID,
				'name' => \OCP\User::getDisplayName(),
				'userID' => $this->userId,
				'comment' => $comment,
				'time' => $now->format('Ymd\THis')
				);
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
		}
		return $comment;
	}

	/**
	 * delete comment of task by id
	 * @param  int   $taskID
	 * @param  int   $commentID
	 * @return bool
	 */
	public function deleteComment($taskID, $commentID){
		try {
			$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
			$vtodo = $vcalendar->VTODO;
			$commentIndex = $this->getCommentById($vtodo,$commentID);
			$comment = $vtodo->children[$commentIndex];
			if($comment['X-OC-USERID']->getValue() == $this->userId){
				unset($vtodo->children[$commentIndex]);
				return \OC_Calendar_Object::edit($taskID, $vcalendar->serialize());
			}else{
				throw new \Exception('Not allowed.');
			}
		} catch(\Exception $e) {
			// throw new BusinessLayerException($e->getMessage());
			return false;
		}
		return $response;
	}


	private static function sort_completed($a, $b) {
		$t1 = \DateTime::createFromFormat('Ymd\THis', $a['completed_date']);
		$t2 = \DateTime::createFromFormat('Ymd\THis', $b['completed_date']);
		if ($t1 == $t2) {
			return 0;
		}
		return $t1 < $t2 ? 1 : -1;
	}

	private function getCommentById($vtodo,$commentId) {
		$idx = 0;
		foreach ($vtodo->children as $i => &$property) {
			if ( $property->name == 'COMMENT' && $property['X-OC-ID']->getValue() == $commentId ) {
				return $idx;
			}
			$idx += 1;
		}
		throw new \Exception('Commment not found.');
	}

}