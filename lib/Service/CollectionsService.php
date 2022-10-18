<?php
/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

use OCP\IConfig;
use OCP\IL10N;

class CollectionsService {
	/**
	 * @var string
	 */
	private $userId;

	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * @var IConfig
	 */
	private $settings;

	/**
	 * @var string
	 */
	private $appName;

	/**
	 * @param string $userId
	 * @param IL10N $l10n
	 * @param IConfig $settings
	 * @param string $appName
	 */
	public function __construct(string $userId, IL10N $l10n, IConfig $settings, string $appName) {
		$this->userId = $userId;
		$this->l10n = $l10n;
		$this->settings = $settings;
		$this->appName = $appName;
	}

	/**
	 * Get all collections
	 *
	 * @return array
	 */
	public function getAll():array {
		$collections = [
			[
				'id' => "starred",
				'displayName' => (string)$this->l10n->t('Important'),
				'show' => 2,
				'icon' => 'Star'],
			[
				'id' => "today",
				'displayName' => (string)$this->l10n->t('Today'),
				'show' => 2,
				'icon' => 'CalendarToday'],
			[
				'id' => "week",
				'displayName' => (string)$this->l10n->t('Week'),
				'show' => 2,
				'icon' => 'CalendarWeek'],
			[
				'id' => "all",
				'displayName' => (string)$this->l10n->t('All'),
				'show' => 2,
				'icon' => 'CircleOutline'],
			[
				'id' => "current",
				'displayName' => (string)$this->l10n->t('Current'),
				'show' => 2,
				'icon' => 'TrendingUp'],
			[
				'id' => "completed",
				'displayName' => (string)$this->l10n->t('Completed'),
				'show' => 2,
				'icon' => 'Check']
		];
		foreach ($collections as $key => $collection) {
			$tmp = $this->settings->getUserValue($this->userId, $this->appName, 'show_'.$collection['id']);
			if (!in_array($tmp, ['0','1','2'])) {
				$this->settings->setUserValue($this->userId, $this->appName, 'show_'.$collection['id'], $collections[$key]['show']);
			} else {
				$collections[$key]['show'] = (int)$tmp;
			}
		}
		return $collections;
	}

	/**
	 * Set the visibility of a collection by collectionID
	 *
	 * @param string $collectionID
	 * @param int $visibility
	 * @return bool
	 */
	public function setVisibility(string $collectionID, int $visibility):bool {
		if (in_array($visibility, [0,1,2])) {
			$this->settings->setUserValue($this->userId, $this->appName, 'show_'.$collectionID, $visibility);
		}
		return true;
	}
}
