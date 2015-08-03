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

Class CommentsService {

	private $userId;
	private $helper;

	public function __construct($userId, Helper $helper){
		$this->userId = $userId;
		$this->helper = $helper;
	}

	/**
	 * add comment to task by id
	 * @param  int    $taskID
	 * @param  string $comment
	 * @param  int    $tmpID
	 * @return array
	 * @throws \Exception
	 */
	public function addComment($taskID, $comment, $tmpID){
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
		$this->helper->editVCalendar($vcalendar, $taskID);
		$user_timezone = \OC_Calendar_App::getTimezone();
		$now->setTimezone(new \DateTimeZone($user_timezone));
		$comment = array(
			'taskID' => $taskID,
			'id' => $commentId,
			'tmpID' => $tmpID,
			'name' => \OC::$server->getUserManager()->get($this->userId)->getDisplayName(),
			'userID' => $this->userId,
			'comment' => $comment,
			'time' => $now->format('Ymd\THis')
			);
		return $comment;
	}

	/**
	 * delete comment of task by id
	 * @param  int   $taskID
	 * @param  int   $commentID
	 * @return bool
	 * @throws \Exception
	 */
	public function deleteComment($taskID, $commentID){
		$vcalendar = \OC_Calendar_App::getVCalendar($taskID);
		$vtodo = $vcalendar->VTODO;
		$commentIndex = $this->getCommentById($vtodo,$commentID);
		$comment = $vtodo->children[$commentIndex];
		if($comment['X-OC-USERID']->getValue() == $this->userId){
			unset($vtodo->children[$commentIndex]);
			return $this->helper->editVCalendar($vcalendar, $taskID);
		} else {
			throw new \Exception('Not allowed.');
		}
	}

	/**
	 * sort get comment by ID
	 *
	 * @param object $vtodo
	 * @param string $commentID
	 * @return int
	 * @throws \Exception
	*/
	private function getCommentById($vtodo,$commentID) {
		$idx = 0;
		foreach ($vtodo->children as $i => &$property) {
			if ( $property->name == 'COMMENT' && $property['X-OC-ID']->getValue() == $commentID ) {
				return $idx;
			}
			$idx += 1;
		}
		throw new \Exception('Commment not found.');
	}
}
