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

/**
 * Controller class for main page.
 */
class PageController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		if (defined('DEBUG') && DEBUG) {
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-route');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-animate');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-sanitize');
			\OCP\Util::addScript('tasks', 'vendor/angular-draganddrop/angular-drag-and-drop-lists');
			\OCP\Util::addScript('tasks', 'vendor/angularui/ui-select/select');
			\OCP\Util::addScript('tasks', 'vendor/bootstrap/ui-bootstrap-custom-tpls-0.10.0');
		} else {
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular.min');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-route.min');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-animate.min');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-sanitize.min');
			\OCP\Util::addScript('tasks', 'vendor/angular-draganddrop/angular-drag-and-drop-lists.min');
			\OCP\Util::addScript('tasks', 'vendor/angularui/ui-select/select.min');
			\OCP\Util::addScript('tasks', 'vendor/bootstrap/ui-bootstrap-custom-tpls-0.10.0.min');
		}
		\OCP\Util::addScript('tasks', 'public/app');
		\OCP\Util::addScript('tasks', 'vendor/timepicker/jquery.ui.timepicker');
		\OCP\Util::addStyle('tasks', 'style');
		\OCP\Util::addStyle('tasks', 'vendor/angularui/ui-select/select2');

		$date = new \DateTimeZone(\OC_Calendar_App::getTimezone());
		$day = new \DateTime('today', $date);
		$day = $day->format('d');

		// TODO: Make a HTMLTemplateResponse class
		$response = new TemplateResponse('tasks', 'main');
		$response->setParams(array(
			'DOM' => $day
		));

		return $response;
	}
}
