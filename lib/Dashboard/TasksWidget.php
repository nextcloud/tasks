<?php

declare(strict_types=1);
/**
 * @copyright Copyright (c) 2021 Jakob Röhrl <jakob.roehrl@web.de>
 *
 * @author Jakob Röhrl <jakob.roehrl@web.de>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Tasks\Dashboard;

use OCA\Tasks\AppInfo\Application;
use OCP\Dashboard\IWidget;
use OCP\IL10N;

class TasksWidget implements IWidget {
	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * TasksWidget constructor.
	 * @param IL10N $l10n
	 */
	public function __construct(IL10N $l10n) {
		$this->l10n = $l10n;
	}

	/**
	 * @inheritDoc
	 */
	public function getId(): string {
		return Application::APP_ID;
	}

	/**
	 * @inheritDoc
	 */
	public function getTitle(): string {
		return $this->l10n->t('Upcoming tasks');
	}

	/**
	 * @inheritDoc
	 */
	public function getOrder(): int {
		return 20;
	}

	/**
	 * @inheritDoc
	 */
	public function getIconClass(): string {
		return 'icon-tasks';
	}

	/**
	 * @inheritDoc
	 */
	public function getUrl(): ?string {
		return null;
	}

	/**
	 * @inheritDoc
	 */
	public function load(): void {
		\OCP\Util::addScript('tasks', 'tasks-dashboard');
		\OCP\Util::addStyle('tasks', 'tasks-dashboard');
		\OCP\Util::addStyle('tasks', 'tasks-store');
		\OCP\Util::addStyle('tasks', 'tasks-icon');
		\OCP\Util::addStyle('tasks', 'tasks-TaskCreateDialog');
		\OCP\Util::addStyle('tasks', 'tasks-Plus');
	}
}
