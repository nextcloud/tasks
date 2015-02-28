<?php
/**
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus (thomas@tanghus.net)
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
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
			\OCP\Util::addScript('tasks', 'vendor/bootstrap/ui-bootstrap-custom-tpls-0.10.0');
		} else {
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular.min');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-route.min');
			\OCP\Util::addScript('tasks', 'vendor/angularjs/angular-animate.min');
			\OCP\Util::addScript('tasks', 'vendor/bootstrap/ui-bootstrap-custom-tpls-0.10.0.min');
		}
		\OCP\Util::addScript('tasks', 'public/app');
		\OCP\Util::addScript('tasks', 'vendor/appframework/app');
		\OCP\Util::addScript('tasks', 'vendor/timepicker/jquery.ui.timepicker');
		\OCP\Util::addStyle('tasks', 'style');
		\OCP\Util::addStyle('tasks', 'vendor/bootstrap/bootstrap');

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