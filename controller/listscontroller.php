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

namespace OCA\Tasks\Controller;

use \OCA\Tasks\Service\ListsService;
use \OCP\IRequest;
use \OCP\AppFramework\Controller;

class ListsController extends Controller {

	private $listsService;

	use Response;

	public function __construct($appName, IRequest $request, ListsService $listsService){
		parent::__construct($appName, $request);
		$this->listsService = $listsService;
	}

	/**
	 * @NoAdminRequired
	 */
	public function getLists(){
		return $this->generateResponse(function () {
			return ['lists' => $this->listsService->getAll()];
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function addList($name, $tmpID){
		return $this->generateResponse(function () use ($name, $tmpID) {
			return ['list' => $this->listsService->add($name, $tmpID)];
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteList($listID){
		return $this->generateResponse(function () use ($listID) {
			return $this->listsService->delete($listID);
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setListName($listID, $name){
		return $this->generateResponse(function () use ($listID, $name) {
			return $this->listsService->setName($listID, $name);
		});
	}
}
