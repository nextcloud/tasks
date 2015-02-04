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
				// skip non-events
				if ($object['objecttype'] != 'VTODO') {
					continue;
				}
				$vtodo = Helper::parseVTODO($object['calendardata']);
				$id = $object['id'];
				$calendarId = $object['calendarid'];
				// check the task summary
				$summary = $vtodo->getAsString('SUMMARY');
				if (stripos($summary, $query) !== false) {
					$results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,'summary',$query);
					continue;
				}
				// check the task note
				$note = $vtodo->getAsString('DESCRIPTION');
				if (stripos($note, $query) !== false) {
					$results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,'note',$query);
					continue;
				}
				// check the task location
				$location = $vtodo->getAsString('LOCATION');
				if (stripos($location, $query) !== false) {
					$results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,'location',$query);
					continue;
				}
				// check the task categorie
				$categories = $vtodo->getAsString('CATEGORIES');
				if (stripos($categories, $query) !== false) {
					$results[] = new \OCA\Tasks\Controller\Task($id,$calendarId,$vtodo,'categories',$query);
					continue;
				}
			}
		}
		return $results;
	}
}
