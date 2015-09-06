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

use \OCA\Tasks\Service\ReminderService;
use \OCA\Tasks\Service\Helper;
use Sabre\VObject;

Class TaskParser {

	private $reminderService;
	private $helper;

	public function __construct(ReminderService $reminderService, Helper $helper){
		$this->reminderService = $reminderService;
		$this->helper = $helper;
	}

	/**
	 * parse task
	 *
	 * @param mixed $vtodo
	 * @param string $calendarID
	 * @return string
	 */
	public function parseTask($vtodo, $calendarID){
		$task = array( 'id' => (string) $vtodo->ID);
		$task['calendarid'] = (string) $calendarID;
		$task['type'] 		= 'task';
		$task['name'] 		= (string) $vtodo->SUMMARY;
		$task['created'] 	= (string) $vtodo->CREATED;
		$task['note'] 		= (string) $vtodo->DESCRIPTION;
		$task['location'] 	= (string) $vtodo->LOCATION;
		$task['categories'] 	= $this->parseCategories($vtodo->CATEGORIES);
		$task['start'] 			= $this->helper->parseDateObject($vtodo->DTSTART);
		$task['due'] 			= $this->helper->parseDateObject($vtodo->DUE);
		$task['completed_date'] = $this->helper->parseDateObject($vtodo->COMPLETED);
		$task['completed'] = (bool) $task['completed_date'];
		try {
			$task['reminder']  = $this->reminderService->parseReminder($vtodo->VALARM, $vtodo->DTSTART, $vtodo->DUE);
		} catch(\Exception $e) {
			\OCP\Util::writeLog('tasks', 'TaskID '.$vtodo->ID.': '.$e->getMessage(), \OCP\Util::DEBUG);
			$task['reminder'] = false;
		}
		$task['uid'] 		= (string) $vtodo->UID;
		$task['related'] 	= (string) $vtodo->{'RELATED-TO'};
		$task['hidesubtasks'] 	= $this->parseHideSubtasks((string) $vtodo->{'X-OC-HIDESUBTASKS'});
		$task['priority']  = $this->parsePriority($vtodo->PRIORITY);
		$task['starred']   = $this->parseStarred($task['priority']);
		$task['complete']  = $this->parsePercentCompleted($vtodo->{'PERCENT-COMPLETE'});
		$task['comments']  = $this->parseComments($vtodo->COMMENT);
		return $task;
	}

	/**
	 * parse starred
	 *
	 * @param mixed $priority
	 * @return bool
	 */
	private function parseStarred($priority) {
		if ((int) $priority > 5) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * parse priority
	 *
	 * @param mixed $priority
	 * @return string
	 */
	private function parsePriority($priority) {
		if(isset($priority)){
			return (string) ((10 - $priority->getValue()) % 10);
		} else {
			return '0';
		}
	}

	/**
	 * parse categories
	 *
	 * @param mixed $categories
	 * @return array
	 */
	private function parseCategories($categories) {
		if ($categories){
			return $categories->getParts();
		} else {
			return array();
		}
	}

	/**
	 * parse hiding subtasks
	 *
	 * @param mixed $hidesubtasks
	 * @return bool
	 */
	private function parseHideSubtasks($hidesubtasks) {
		// show subtasks on default
		if ($hidesubtasks == '1'){
			return true;
		} else {
			return false;
		}
	}

	/**
	 * parse percent completed
	 *
	 * @param mixed $percentComplete
	 * @return string
	 */
	private function parsePercentCompleted($percentComplete) {
		if($percentComplete){
			return $percentComplete->getValue();
		} else {
			return '0';
		}
	}

	/**
	 * parse comments
	 *
	 * @param mixed $comments
	 * @return array
	 */
	private function parseComments($comments){
		$comments_parsed = array();
		if($comments){
			foreach($comments as $com) {
				// parse time
				$time = $this->helper->parseDateString($com['X-OC-DATE-TIME']);
				// parse comment ID
				$comID = $com['X-OC-ID'];
				// parse user ID
				$userID = $com['X-OC-USERID'];

				if ($this->isCommentValid($time, $comID, $userID)) {
					$userID = (string) $userID->getValue();
					$user = \OC::$server->getUserManager()->get($userID);
					if ($user) {
						$comments_parsed[] = array(
							'id' 		=> $comID->getValue(),
							'userID' 	=> $userID,
							'name' 		=> $user->getDisplayName(),
							'comment' 	=> $com->getValue(),
							'time' 		=> $time,
						);
					}
				}
			}
		}
		return $comments_parsed;
	}

	/**
	 * check if comment is valid
	 *
	 * @param string $time
	 * @param string $comID
	 * @param string $userID
	 * @return bool
	 */
	private function isCommentValid($time, $comID, $userID) {
		return ($time && $comID && $userID);
	}
}
