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

namespace OCA\Tasks\AppInfo;

if(\OCP\App::isEnabled('calendar')) {
	\OC::$server->getNavigationManager()->add(function () {
		$urlGenerator = \OC::$server->getURLGenerator();
	    return [
			'id' => 'tasks',

			'order' => 100,

			'href' => $urlGenerator->linkToRoute('tasks.page.index'),

			'icon' => $urlGenerator->imagePath('tasks', 'tasks.svg'),

			'name' => \OC::$server->getL10N('tasks')->t('Tasks'),
		];
	});
	\OC::$server->getSearch()->registerProvider('OCA\Tasks\Controller\SearchProvider', array('apps' => array('tasks')));
} else {
	$msg = 'Can not enable the Tasks app because the Calendar App is disabled.';
	\OCP\Util::addScript('tasks', 'calendar-missing');
	\OCP\Util::writeLog('tasks', $msg, \OCP\Util::ERROR);
}
