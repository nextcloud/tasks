<?php

/**
 * ownCloud
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

/**
 * A task
 */
class Task extends \OCP\Search\Result {

	/**
	 * Type name; translated in templates
	 *
	 * @var string
	 */
	public $type = 'task';

	/**
	 * CalendarID
	 *
	 * @var string
	 */
	public $calendarid;

	/**
	 * Is Task completed
	 *
	 * @var boolean
	 */
	public $completed;

	/**
	 * Used by the client JS to display additional information under the event summary
	 *
	 * @var string
	 */
	public $text = '';

	/**
	 * Start time for the task
	 *
	 * @var string human-readable string in RFC2822 format
	 */
	public $start;

	/**
	 * Due time for the task
	 *
	 * @var string human-readable string in RFC2822 format
	 */
	public $due;

	/**
	 * Is Task starred
	 *
	 * @var boolean
	 */
	public $starred;

	/**
	 * Percent complete
	 *
	 * @var string human-readable string in RFC2822 format
	 */
	public $complete;

	/**
	 * Content of the note
	 *
	 * @var string human-readable string in RFC2822 format
	 */
	public $note;

	/**
	 * Constructor
	 *
	 * @param array $data
	 * @return \OCA\Tasks\Controller\Task
	 */
	public function __construct($taskId, $calendarId, $vtodo, $reason, $query, $user_timezone) {
		// set default properties
		$this = Helper::arrayForJSON($taskId, $vtodo, $user_timezone);
		// $this->id = $taskId;
		// $this->calendarid = $calendarId;
		// $this->name = $vtodo->getAsString('SUMMARY');
		// $this->completed = $vtodo->COMPLETED ? true : false;
		// $this->note = $vtodo->getAsString('DESCRIPTION');
		// $start = $vtodo->DTSTART;
		// if ($start) {
		// 	try {
		// 		$start = $start->getDateTime();
		// 		$start->setTimezone(new \DateTimeZone($user_timezone));
		// 		$this->start = $start->format('Ymd\THis');
		// 	} catch(\Exception $e) {
		// 		$this->start = null;
		// 		\OCP\Util::writeLog('tasks', $e->getMessage(), \OCP\Util::ERROR);
		// 	}
		// } else {
		// 	$this->start = null;
		// }
		// $due = $vtodo->DUE;
		// if ($due) {
		// 	try {
		// 		$due = $due->getDateTime();
		// 		$due->setTimezone(new \DateTimeZone($user_timezone));
		// 		$this->due = $due->format('Ymd\THis');
		// 	} catch(\Exception $e) {
		// 		$this->due = null;
		// 		\OCP\Util::writeLog('tasks', $e->getMessage(), \OCP\Util::ERROR);
		// 	}
		// } else {
		// 	$this->due = null;
		// }
		// $this->starred = $vtodo->getAsString('PRIORITY') ? true : false;
		// $this->complete = $vtodo->getAsString('PERCENT-COMPLETE')==''?'0':$vtodo->getAsString('PERCENT-COMPLETE');
		// $this->link = \OCP\Util::linkToRoute('tasks.page.index') . '#/lists/' . $calendarId . '/tasks/' . $taskId;
		// $l = new \OC_l10n('tasks');
		// switch($reason){
		// 	case 'SUMMARY':
		// 		$this->text = '"' . $query .'" '. $l->t('found in task title.');
		// 		break;
		// 	case 'DESCRIPTION':
		// 		$this->text = '"' . $query .'" '. $l->t('found in task note.');
		// 		break;
		// 	case 'LOCATION':
		// 		$this->text = '"' . $query .'" '. $l->t('found in task location.');
		// 		break;
		// 	case 'CATEGORIES':
		// 		$this->text = '"' . $query .'" '. $l->t('found in task categories.');
		// 		break;
		// 	case 'COMMENTS':
		// 		$this->text = '"' . $query .'" '. $l->t('found in task comments.');
		// 		break;
		// 	default:
		// 		$this->text = '';
		// 		break;
		// }
	}
}