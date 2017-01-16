<?php
/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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

	private $userId;
	private $l10n;
	private $settings;
	private $appName;

	public function __construct($userId, IL10N $l10n, IConfig $settings, $appName) {
		$this->userId = $userId;
		$this->l10n = $l10n;
		$this->settings = $settings;
		$this->appName = $appName;
	}

	/**
	 * get all collections
	 *
	 * @return array
	 */
	public function getAll() {
		$collections = array(
			array(
				'id' => "starred",
				'displayname' => (string)$this->l10n->t('Important'),
				'show' => 2),
			array(
				'id' => "today",
				'displayname' => (string)$this->l10n->t('Today'),
				'show' => 2),
			array(
				'id' => "week",
				'displayname' => (string)$this->l10n->t('Week'),
				'show' => 2),
			array(
				'id' => "all",
				'displayname' => (string)$this->l10n->t('All'),
				'show' => 2),
			array(
				'id' => "current",
				'displayname' => (string)$this->l10n->t('Current'),
				'show' => 2),
			array(
				'id' => "completed",
				'displayname' => (string)$this->l10n->t('Completed'),
				'show' => 2)
		);
		foreach ($collections as $key => $collection){
			$tmp = $this->settings->getUserValue($this->userId, $this->appName,'show_'.$collection['id']);
			if (!in_array($tmp, array('0','1','2'))) {
				$this->settings->setUserValue($this->userId, $this->appName,'show_'.$collection['id'],$collections[$key]['show']);
			} else {
				$collections[$key]['show'] = (int)$tmp;
			}
		}
		return $collections;
	}

	/**
	 * set the visibility of a collection by collectionID
	 *
	 * @param int $collectionID
	 * @param int $visibility
	 * @return bool
	 */
	public function setVisibility($collectionID, $visibility){
		if (in_array($visibility, array(0,1,2))){
			$this->settings->setUserValue($this->userId, $this->appName,'show_'.$collectionID,$visibility);
		}
		return true;
	}
}
