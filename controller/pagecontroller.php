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

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Http\NotFoundResponse;
use \OCP\IRequest;
use \OCP\IConfig;

/**
 * Controller class for main page.
 */
class PageController extends Controller {

	/**
	 * @param string $appName
	 * @param IConfig $config
	 */
	public function __construct($appName, IRequest $request,
								$userId, IConfig $config) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userId = $userId;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {

		$day = new \DateTime('today');
		$day = $day->format('d');

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$response = new TemplateResponse('tasks', 'main');
		$response->setParams(array(
			'appVersion' => $appVersion,
			'DOM' => $day
		));

		return $response;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function templates($template) {
		$templates = array(	'confirmation');
		if (in_array($template, $templates)) {
			$response = new TemplateResponse('tasks', $template, [], 'blank');
		} else {
			$response = new NotFoundResponse();
		}
		return $response;
	}
}
