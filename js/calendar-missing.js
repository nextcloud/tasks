/*
 * Copyright (c) 2015
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */
$(function(){
	$(document).ready(function () {
		OC.Notification.showTemporary(t('tasks', 'Tasks app is unavailable because the calendar is not installed'));
	});
});
