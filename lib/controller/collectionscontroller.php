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

namespace OCA\Tasks_enhanced\Controller;

use OCA\Tasks_enhanced\Controller,
	OCP\AppFramework\Http\JSONResponse;

class CollectionsController extends Controller {

	/**
	 * @NoAdminRequired
	 */
	public function getCollections(){
		$l = \OCP\Util::getL10N('tasks_enhanced');
		$collections = array(
			array(
				'id' => "starred",
				'displayname' => (string)$l->t('Important'),
				'show' => 2),
			array(
				'id' => "today",
				'displayname' => (string)$l->t('Today'),
				'show' => 2),
			array(
				'id' => "week",
				'displayname' => (string)$l->t('Week'),
				'show' => 2),
			array(
				'id' => "all",
				'displayname' => (string)$l->t('All'),
				'show' => 2),
			array(
				'id' => "current",
				'displayname' => (string)$l->t('Current'),
				'show' => 2),
			array(
				'id' => "completed",
				'displayname' => (string)$l->t('Done'),
				'show' => 2)
		);
		foreach ($collections as $key => $collection){
			try{
				$tmp = \OCP\Config::getUserValue($this->api->getUserId(), 'tasks_enhanced','show_'.$collection['id']);
				if (!in_array((int)$tmp, array(0,1,2)) || $tmp === null) {
					$tmp = 2;
					\OCP\Config::setUserValue($this->api->getUserId(), 'tasks_enhanced','show_'.$collection['id'],$tmp);
				}
				$collections[$key]['show'] = (int)$tmp;
			}catch(\Exception $e) {
					\OCP\Util::writeLog('tasks_enhanced', $e->getMessage(), \OCP\Util::ERROR);
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
			\OCP\Config::setUserValue($this->api->getUserId(), 'tasks_enhanced','show_'.$collectionId,$vis);
		}
		$response = new JSONResponse();
		return $response;
	}
}