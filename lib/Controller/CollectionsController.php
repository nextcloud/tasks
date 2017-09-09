<?php
/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler raimund.schluessler@googlemail.com
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

use \OCA\Tasks\Service\CollectionsService;
use \OCP\IRequest;
use \OCP\AppFramework\Controller;

class CollectionsController extends Controller {

	private $collectionsService;

	use Response;

	public function __construct($appName, IRequest $request, CollectionsService $collectionsService){
		parent::__construct($appName, $request);
		$this->collectionsService = $collectionsService;
	}

	/**
	 * @NoAdminRequired
	 */
	public function getCollections(){
		return $this->generateResponse(function () {
			return ['collections' => $this->collectionsService->getAll()];
		});
	}

	/**
	 * @NoAdminRequired
	 */
	public function setVisibility($collectionID, $visibility){
		return $this->generateResponse(function () use ($collectionID, $visibility) {
			return $this->collectionsService->setVisibility($collectionID, $visibility);
		});
	}
}
