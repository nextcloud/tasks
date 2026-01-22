<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-warning">
		<strong>
			{{ t('tasks', 'The recurrence definition of this task is not fully supported by Nextcloud. If you edit the recurrence-options, certain recurrences may be lost.') }}
		</strong>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'

export default {
	name: 'RepeatUnsupportedWarning',
	methods: {
		t,
	},
}
</script>
