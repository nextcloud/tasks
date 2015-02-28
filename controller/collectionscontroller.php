<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2014 Raimund Schlüßler raimund.schluessler@googlemail.com
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

use \OCP\IRequest;
use \OCP\IConfig;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;

class CollectionsController extends Controller {

	private $userId;
	private $l10n;
	private $settings;

	public function __construct($appName, IRequest $request, $userId, $l10n, IConfig $settings){
		parent::__construct($appName, $request);
		$this->l10n = $l10n;
		$this->userId = $userId;
		$this->settings = $settings;
	}

	/**
	 * @NoAdminRequired
	 */
	public function getCollections(){
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
			try{
				$tmp = $this->settings->getUserValue($this->userId, $this->appName,'show_'.$collection['id']);
				if (!in_array((int)$tmp, array(0,1,2)) || $tmp === null) {
					$tmp = 2;
					$this->settings->setUserValue($this->userId, $this->appName,'show_'.$collection['id'],$tmp);
				}
				$collections[$key]['show'] = (int)$tmp;
			}catch(\Exception $e) {
					\OCP\Util::writeLog($this->appName, $e->getMessage(), \OCP\Util::ERROR);
			}
		}
		$result = array(
			'data' => array(
				'collections' => $collections
			)
		);
		$response = new JSONResponse();
		$response->setData($result);
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function setVisibility(){
		$collectionId = (string) $this->params('collectionID');
		$vis = (int) $this->params('visibility');
		if (in_array($vis, array(0,1,2))){
			$this->settings->setUserValue($this->userId, $this->appName,'show_'.$collectionId,$vis);
		}
		$response = new JSONResponse();
		return $response;
	}
}