<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-warning">
		<strong>
			{{ t('tasks', 'This task is the recurrence-exception of a recurrence-set. You cannot add a recurrence-rule to it.') }}
		</strong>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'

export default {
	name: 'RepeatExceptionWarning',
	methods: {
		t,
	},
}
</script>
