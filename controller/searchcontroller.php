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
 * Tasks search provider
 */
class SearchController extends \OCP\Search\Provider {

	/**
	 * Search for query in tasks
	 *
	 * @param string $query
	 * @return array list of \OCA\Tasks\Controller\Task
	 */
	function search($query) {
		$calendars = \OC_Calendar_Calendar::allCalendars(\OCP\USER::getUser(), true);
		$user_timezone = \OC_Calendar_App::getTimezone();
		// check if the calenar is enabled
		if (count($calendars) == 0 || !\OCP\App::isEnabled('tasks')) {
			return array();
		}
		$results = array();
		foreach ($calendars as $calendar) {
			// $calendar_entries = \OC_Calendar_Object::all($calendar['id']);
			$objects = \OC_Calendar_Object::all($calendar['id']);
			// $date = strtotime($query);
		// 	// search all calendar objects, one by one
			foreach ($objects as $object) {
				// skip non-todos
				if ($object['objecttype'] != 'VTODO') {
					continue;
				}
				$vtodo = Helper::parseVTODO($object['calendardata']);
				$id = $object['id'];
				$calendarId = $object['calendarid'];
				
				// check these properties
				$properties = array('SUMMARY', 'DESCRIPTION', 'LOCATION', 'CATEGORIES');

				foreach ($properties as $property) {
					$string = $vtodo->getAsString($property);
					if (stripos($string, $query) !== false) {
						// $results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,$property,$query,$user_timezone);
						$results[] = Helper::arrayForJSON($id, $vtodo, $user_timezone, $calendarId);
						continue 2;
					}
				}
				$comments = $vtodo->COMMENT;
				if($comments) {
					foreach($comments as $com) {
						if (stripos($com->value, $query) !== false) {
							// $results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,'COMMENTS',$query,$user_timezone);
							$results[] = Helper::arrayForJSON($id, $vtodo, $user_timezone, $calendarId);
							continue 2;
						}
					}
				}
			}
		}
		usort($results, array($this, 'sort_completed'));
		return $results;
	}

	private static function sort_completed($a, $b){
		$t1 = $a['completed'];
		$t2 = $b['completed'];
		if ($t1 == $t2) {
			return 0;
		}
		return $t1 > $t2 ? 1 : -1;
	}
}
