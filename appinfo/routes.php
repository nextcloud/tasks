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
return [
	'routes' => [
		['name' => 'page#index',				'url' => '/',				'verb' => 'GET'],
		['name' => 'page#index',				'url' => '/calendars',	'verb' => 'GET', 'postfix' => 'view.calendars'],
		['name' => 'page#index',				'url' => '/calendars/',	'verb' => 'GET', 'postfix' => 'view.calendars./'],
		[
			'name' => 'page#index',
			'url' => '/calendars/{calendar}',
			'verb' => 'GET',
			'postfix' => 'view.calendars.calendar',
			'requirements' => array('calendar' => '.+')
		],
		['name' => 'page#index',				'url' => '/collections',	'verb' => 'GET', 'postfix' => 'view.collections'],
		['name' => 'page#index',				'url' => '/collections/',	'verb' => 'GET', 'postfix' => 'view.collections./'],
		[
			'name' => 'page#index',
			'url' => '/collections/{collection}',
			'verb' => 'GET',
			'postfix' => 'view.collections.collection',
			'requirements' => array('collection' => '.+')
		],

		['name' => 'collections#getCollections','url' => '/api/v1/collections',										'verb' => 'GET'],
		['name' => 'collections#setVisibility',	'url' => '/api/v1/collection/{collectionID}/visibility/{visibility}',	'verb' => 'POST'],
		['name' => 'settings#get',				'url' => '/api/v1/settings',									'verb' => 'GET'],
		['name' => 'settings#set',				'url' => '/api/v1/settings/{setting}',							'verb' => 'POST'],
	]
];
