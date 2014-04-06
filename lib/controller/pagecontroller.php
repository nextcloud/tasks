<?php
/**
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus (thomas@tanghus.net)
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\Tasks_enhanced\Controller;

use OCA\Tasks_enhanced\Controller,
	OCP\AppFramework\Http\TemplateResponse;


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
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular-route');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular-animate');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/momentjs/moment');
		} else {
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular.min');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular-route.min');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/angularjs/angular-animate.min');
			\OCP\Util::addScript('tasks_enhanced', 'vendor/momentjs/moment.min');
		}
		\OCP\Util::addScript('tasks_enhanced', 'public/app');
		\OCP\Util::addScript('tasks_enhanced', 'vendor/appframework/app');
		\OCP\Util::addScript('tasks_enhanced', 'vendor/timepicker/jquery.ui.timepicker');
		\OCP\Util::addStyle('tasks_enhanced', 'style');

		// TODO: Make a HTMLTemplateResponse class
		$response = new TemplateResponse('tasks_enhanced', 'main');
		/*$response->setParams(array(
			'var' => $var,
		));*/

		return $response;
	}
}