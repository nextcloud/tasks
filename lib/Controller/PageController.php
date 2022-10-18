<?php
/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

use \OCA\Tasks\Service\SettingsService;
use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IInitialStateService;
use \OCP\IRequest;

/**
 * Controller class for main page.
 */
class PageController extends Controller {
	/**
	 * @var IInitialStateService
	 */
	private $initialStateService;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 */
	public function __construct(string $appName, IRequest $request, SettingsService $settingsService, IInitialStateService $initialStateService) {
		parent::__construct($appName, $request);
		$this->settingsService = $settingsService;
		$this->initialStateService = $initialStateService;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index():TemplateResponse {
		$settings = $this->settingsService->get();

		foreach ($settings as $setting => $value) {
			$this->initialStateService->provideInitialState($this->appName, $setting, $value);
		}

		return new TemplateResponse('tasks', 'main');
	}
}
