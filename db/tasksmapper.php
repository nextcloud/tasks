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

namespace OCA\Tasks\Db;

use OCP\IDb;
use OCP\AppFramework\Db\Mapper;

class TasksMapper extends Mapper {

	public function __construct(IDb $db) {
		parent::__construct($db, 'tasks_tasks', '\OCA\Tasks\Db\Tasks');
	}

	public function findAllVTODOs($calendarID, $limit=null, $offset=null) {
		$sql = 'SELECT * FROM `*PREFIX*clndr_objects` WHERE `calendarid` = ? AND `objecttype`= ?';
		return $this->findEntities($sql, array($calendarID, 'VTODO'), $limit, $offset);
	}

	public function findVTODOById($taskID, $limit=null, $offset=null) {
		$sql = 'SELECT * FROM `*PREFIX*clndr_objects` WHERE `id` = ? AND `objecttype`= ?';
		return $this->findEntity($sql, array($taskID, 'VTODO'), $limit, $offset);
	}
}
