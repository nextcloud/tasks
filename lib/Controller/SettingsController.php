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

namespace OCA\Tasks\Controller;

use \OCA\Tasks\Service\SettingsService;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;

class SettingsController extends Controller {
	/**
	 * @var SettingsService
	 */
	private $settingsService;

	use Response;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param SettingsService $settingsService
	 */
	public function __construct(string $appName, IRequest $request, SettingsService $settingsService) {
		parent::__construct($appName, $request);
		$this->settingsService = $settingsService;
	}

	/**
	 * @NoAdminRequired
	 */
	public function set($setting, $value) {
		return $this->generateResponse(function () use ($setting, $value) {
			return $this->settingsService->set($setting, $value);
		});
	}
}
