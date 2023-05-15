<?php
/**
 * @copyright Copyright (c) 2017 Joas Schilling <coding@schilljs.com>
 *
 * @author Joas Schilling <coding@schilljs.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Tasks\Migration;

use OCA\DAV\CalDAV\CalDavBackend;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IDBConnection;
use OCP\IUserManager;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Class CreateTasksCalendar
 *
 * @package OCA\Tasks\Migration
 */
class CreateTasksCalendar implements IRepairStep {
	public const APP_ID = 'ecloud-accounts';
	public const TASKS_CALENDAR_URI = 'tasks';
	public const TASKS_CALENDAR_NAME = 'Tasks';
	public const TASKS_CALENDAR_COMPONENT = 'VTODO';

	/** @var IDBConnection */
	protected $connection;

	/** @var  IConfig */
	protected $config;

	/** @var IUserManager */
	private $userManager;

	/** @var CalDavBackend */
	protected $calDav;

	/** @var Defaults */
	protected $themingDefaults;


	public function __construct(IDBConnection $connection, IConfig $config, IUserManager $userManager, CalDavBackend $calDav, Defaults $themingDefaults) {
		$this->connection = $connection;
		$this->config = $config;
		$this->userManager = $userManager;
		$this->calDav = $calDav;
		$this->themingDefaults = $themingDefaults;
	}

	/**
	 * Returns the step's name
	 *
	 * @return string
	 * @since 9.1.0
	 */
	public function getName() {
		return 'Fix by creating Tasks calendar for user if not exist.';
	}

	/**
	 * Returns the array of calendars
	 *
	 * @return array
	 */
	private function getPrincipalUriByCalendar():array {
		$query = $this->connection->getQueryBuilder();
		$expr = $query->expr();
		$query->select($query->createFunction('DISTINCT ' . $query->getColumnName('c1.principaluri')))
			->from('calendars', 'c1')
			->leftJoin('c1', 'calendars', 'c2', $expr->andX(
				$expr->eq('c1.principaluri', 'c2.principaluri'),
				$expr->eq('c2.uri', $query->createNamedParameter('tasks')),
				$expr->eq('c2.components', $query->createNamedParameter('VTODO'))
			)
			)
			->where($query->expr()->isNull('c2.principaluri'));
		$stmt = $query->executeQuery();
		return $stmt->fetchAll();
	}

	/**
	 * Returns the unique Task Uri
	 *
	 * @return string
	 */
	private function getUniqueTaskUri($principal, $taskUri):string {
		$qb = $this->connection->getQueryBuilder();
		$qb->select('uri')
		->from('calendars')
		->where($qb->expr()->eq('uri', $qb->createNamedParameter($taskUri)))
		->andWhere($qb->expr()->eq('principaluri', $qb->createNamedParameter($principal)));
		$count = $qb->execute()->fetchColumn();

		// If the name already exists, add a suffix until you find an available task uri
		if ($count > 0) {
			$i = 1;
			while ($count > 0) {
				$newUriName = $taskUri . '-' . $i;
				$qb->select('uri');
				$qb->where($qb->expr()->eq('uri', $qb->createNamedParameter($newUriName)));
				$qb->andWhere($qb->expr()->eq('principaluri', $qb->createNamedParameter($principal)));
				$count = $qb->execute()->fetchColumn();
				$i++;
			}
			$taskUri = $newUriName;
		}
		return $taskUri;
	}



	/**
	 * @param IOutput $output
	 */
	public function run(IOutput $output) {
		if ($this->config->getAppValue(self::APP_ID, 'CreateTasksHasRun') === 'yes') {
			$output->info('Repair step already executed');
			return;
		}
		//get all principal uri having no task calendar with component as TODO but have personal calendar
		$result = $this->getPrincipalUriByCalendar();
		foreach ($result as $row) {
			$principal = $row['principaluri'];
			$taskUri = $this->getUniqueTaskUri($principal, self::TASKS_CALENDAR_URI);
			$this->calDav->createCalendar($principal, $taskUri, [
				'{DAV:}displayname' => self::TASKS_CALENDAR_NAME,
				'{http://apple.com/ns/ical/}calendar-color' => $this->themingDefaults->getColorPrimary(),
				'components' => 'VTODO'
			]);
		};
		// if everything is done, no need to redo the repair during next upgrade
		$this->config->setAppValue(self::APP_ID, 'CreateTasksHasRun', 'yes');
	}
}
