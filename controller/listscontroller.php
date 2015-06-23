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

namespace OCA\Tasks\Controller;

use \OCA\Tasks\Service\ListsService;
use \OCP\IRequest;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;

class ListsController extends Controller {

	private $listsService;

	public function __construct($appName, IRequest $request, ListsService $listsService){
		parent::__construct($appName, $request);
		$this->listsService = $listsService;
	}

	/**
	 * @NoAdminRequired
	 */
	public function getLists(){
		$result = $this->listsService->getAll();
		$response = array(
			'data' => array(
				'lists' => $result
			)
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function addList($name, $tmpID){
		$result = $this->listsService->add($name, $tmpID);
		$response = array(
			'data' => array(
				'list' => $result
			)
		);
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteList($listID){
		$result = $this->listsService->delete($listID);
		$response = $result;
		return (new JSONResponse())->setData($response);
	}

	/**
	 * @NoAdminRequired
	 */
	public function setListName($listID, $name){
		$result = $this->listsService->setName($listID, $name);
		$response = array(
			'data' => $result
		);
		return (new JSONResponse())->setData($response);
	}
}