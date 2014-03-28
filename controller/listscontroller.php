<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2013 Raimund Schlüßler raimund.schluessler@googlemail.com
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

use \OCA\AppFramework\Controller\Controller;
use \OCA\AppFramework\Core\API;
use \OCA\AppFramework\Http\Request;

use \OCA\Tasks_enhanced\BusinessLayer\ListsBusinessLayer;

class ListsController extends Controller {

	private $listsBusinessLayer;

	public function __construct(API $api, Request $request,
	                            ListsBusinessLayer $listsBusinessLayer){
		parent::__construct($api, $request);
		$this->listsBusinessLayer = $listsBusinessLayer;
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function getLists(){
		$lists = $this->listsBusinessLayer->getAllLists($this->api->getUserId());
		$result = array(
			'lists' => $lists
		);
		return $this->renderJSON($result);
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function addList(){
		$listName = $this->params('name');
		$list = $this->listsBusinessLayer->addList($listName,$this->api->getUserId());
		$list['tmpID'] = $this->params('tmpID');
		$result = array(
			'list' => $list
		);
		return $this->renderJSON($result);
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function deleteList(){
		$listId = $this->params('listID');
		$result = $this->listsBusinessLayer->deleteList($listId);
		return $this->renderJSON();
	}

	/**
	 * @IsAdminExemption
	 * @IsSubAdminExemption
	 * @Ajax
	 */
	public function setListName(){
		$listId = (int) $this->params('listID');
		$listName = $this->params('name');
		$result = $this->listsBusinessLayer->editList($listId, $listName,$this->api->getUserId());
		return $this->renderJSON($result);
	}
}