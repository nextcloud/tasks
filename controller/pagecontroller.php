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
			script('tasks', 'vendor/angular/angular');
			script('tasks', 'vendor/angular-route/angular-route');
			script('tasks', 'vendor/angular-animate/angular-animate');
			script('tasks', 'vendor/angular-sanitize/angular-sanitize');
			script('tasks', 'vendor/angular-draganddrop/angular-drag-and-drop-lists');
			script('tasks', 'vendor/angular-ui-select/dist/select');
			script('tasks', 'vendor/jstzdetect/jstz');
		} else {
			script('tasks', 'vendor/angular/angular.min');
			script('tasks', 'vendor/angular-route/angular-route.min');
			script('tasks', 'vendor/angular-animate/angular-animate.min');
			script('tasks', 'vendor/angular-sanitize/angular-sanitize.min');
			script('tasks', 'vendor/angular-draganddrop/angular-drag-and-drop-lists.min');
			script('tasks', 'vendor/angular-ui-select/dist/select.min');
			script('tasks', 'vendor/jstzdetect/jstz.min');
		}
		script('tasks', 'public/app');
		script('tasks', 'vendor/jquery-timepicker/jquery.ui.timepicker');
		script('tasks', 'vendor/davclient.js/lib/client');
		script('tasks', 'vendor/ical.js/build/ical');
		style('tasks', 'style');	
		style('tasks', 'vendor/angularui/ui-select/select2');

		$day = new \DateTime('today');
		$day = $day->format('d');

		// TODO: Make a HTMLTemplateResponse class
		$response = new TemplateResponse('tasks', 'main');
		$response->setParams(array(
			'DOM' => $day
		));

		return $response;
	}
}
