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

namespace OCA\Tasks;

// use \OCP\AppFramework\App;
use \OCA\Tasks\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, array('routes' => array(
	// page
	array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),

	// templates
	array('name' => 'page#templates', 'url' => '/templates/{template}', 'verb' => 'GET'),

	// collections
	array('name' => 'collections#getCollections',	'url' => '/collections',										'verb' => 'GET'),
	array('name' => 'collections#setVisibility',	'url' => '/collection/{collectionID}/visibility/{visibility}',	'verb' => 'POST'),

	// settings
	array('name' => 'settings#get',	'url' => '/settings', 'verb' => 'GET'),
	array('name' => 'settings#set', 'url' => '/settings/{type}/{setting}/{value}', 'verb' => 'POST'),
)));
