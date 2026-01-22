<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2026 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div v-show="task.due || task.start || task.recurrenceRule.frequency !== 'NONE'"
		:class="{
			'property__item--clearable': isRecurring && !readOnly,
			'property__item--readonly': readOnly
		}"
		class="property__item">
		<div class="item__content" @click="!readOnly && openEditor()">
			<span class="content__icon">
				<slot name="icon" />
			</span>
			<span class="content__name">
				{{ recurrenceSummary }}
			</span>
		</div>
		<div class="item__actions">
			<NcActions v-show="isRecurring && !readOnly" class="actions__clear">
				<NcActionButton @click="clearRecurrence">
					<template #icon>
						<Delete :size="20" />
					</template>
					{{ t('tasks', 'Remove recurrence') }}
				</NcActionButton>
			</NcActions>
		</div>

		<!-- Recurrence Editor Modal -->
		<NcModal v-if="showEditor" @close="closeEditor">
			<div class="recurrence-editor">
				<h2>{{ t('tasks', 'Repeat task') }}</h2>
				<div class="recurrence-editor__content">
					<!-- Frequency and Interval -->
					<div class="recurrence-editor__row">
						<label>{{ t('tasks', 'Repeat') }}</label>
						<select v-model="localFrequency" class="recurrence-select">
							<option value="NONE">
								{{ t('tasks', 'Does not repeat') }}
							</option>
							<option value="DAILY">
								{{ t('tasks', 'Daily') }}
							</option>
							<option value="WEEKLY">
								{{ t('tasks', 'Weekly') }}
							</option>
							<option value="MONTHLY">
								{{ t('tasks', 'Monthly') }}
							</option>
							<option value="YEARLY">
								{{ t('tasks', 'Yearly') }}
							</option>
						</select>
					</div>

					<div v-if="localFrequency !== 'NONE'" class="recurrence-editor__row">
						<label>{{ t('tasks', 'Interval') }}</label>
						<input v-model.number="localInterval"
							type="number"
							min="1"
							class="recurrence-input">
					</div>

					<!-- End conditions -->
					<div v-if="localFrequency !== 'NONE'" class="recurrence-editor__row">
						<label>{{ t('tasks', 'End') }}</label>
						<select v-model="endType" class="recurrence-select">
							<option value="never">
								{{ t('tasks', 'Never') }}
							</option>
							<option value="until">
								{{ t('tasks', 'On date') }}
							</option>
							<option value="count">
								{{ t('tasks', 'After') }}
							</option>
						</select>
					</div>

					<div v-if="endType === 'until' && localFrequency !== 'NONE'" class="recurrence-editor__row">
						<label>{{ t('tasks', 'Until') }}</label>
						<NcDateTimePicker v-model="localUntil"
							:clearable="false"
							type="date"
							class="recurrence-date" />
					</div>

					<div v-if="endType === 'count' && localFrequency !== 'NONE'" class="recurrence-editor__row">
						<label>{{ t('tasks', 'Occurrences') }}</label>
						<input v-model.number="localCount"
							type="number"
							min="1"
							class="recurrence-input">
					</div>

					<div class="recurrence-editor__actions">
						<NcButton @click="saveRecurrence">
							{{ t('tasks', 'Save') }}
						</NcButton>
						<NcButton type="tertiary" @click="closeEditor">
							{{ t('tasks', 'Cancel') }}
						</NcButton>
					</div>
				</div>
			</div>
		</NcModal>
	</div>
</template>

<script>
import { NcActions, NcActionButton, NcButton, NcDateTimePicker, NcModal } from '@nextcloud/vue'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import Delete from 'vue-material-design-icons/Delete.vue'
import { RecurValue, Property } from '@nextcloud/calendar-js'

export default {
	name: 'RecurrenceItem',
	components: {
		NcActions,
		NcActionButton,
		NcButton,
		NcDateTimePicker,
		NcModal,
		Delete,
	},
	props: {
		/**
		 * The task object
		 */
		task: {
			type: Object,
			required: true,
		},
		/**
		 * Whether the item is read-only
		 */
		readOnly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			showEditor: false,
			localFrequency: 'NONE',
			localInterval: 1,
			localUntil: null,
			localCount: null,
			endType: 'never',
		}
	},
	computed: {
		isRecurring() {
			return this.task.recurrenceRule && this.task.recurrenceRule.frequency !== 'NONE'
		},
		recurrenceSummary() {
			if (!this.isRecurring) {
				return t('tasks', 'Does not repeat')
			}

			const rule = this.task.recurrenceRule
			const interval = rule.interval || 1

			// Get translated frequency
			const frequencyText = this.getTranslatedFrequency(rule.frequency, interval)

			let summary = ''
			if (interval === 1) {
				summary = frequencyText
			} else {
				summary = t('tasks', 'Every {interval} {frequency}', { interval, frequency: frequencyText })
			}

			if (rule.until) {
				const date = new Date(rule.until).toLocaleDateString()
				summary += ', ' + t('tasks', 'until {date}', { date })
			} else if (rule.count) {
				summary += ', ' + t('tasks', '{count} times', { count: rule.count })
			}

			return summary
		},
	},
	watch: {
		'task.recurrenceRule': {
			handler(newRule) {
				if (newRule && newRule.frequency !== 'NONE') {
					this.loadFromRule(newRule)
				}
			},
			immediate: true,
		},
	},
	methods: {
		t,
		n,

		getTranslatedFrequency(frequency, interval) {
			switch (frequency) {
			case 'DAILY':
				return interval === 1 ? t('tasks', 'Daily') : n('tasks', 'day', 'days', interval)
			case 'WEEKLY':
				return interval === 1 ? t('tasks', 'Weekly') : n('tasks', 'week', 'weeks', interval)
			case 'MONTHLY':
				return interval === 1 ? t('tasks', 'Monthly') : n('tasks', 'month', 'months', interval)
			case 'YEARLY':
				return interval === 1 ? t('tasks', 'Yearly') : n('tasks', 'year', 'years', interval)
			default:
				return frequency
			}
		},

		openEditor() {
			if (!this.readOnly) {
				this.loadFromRule(this.task.recurrenceRule)
				this.showEditor = true
			}
		},

		closeEditor() {
			this.showEditor = false
		},

		loadFromRule(rule) {
			this.localFrequency = rule.frequency || 'NONE'
			this.localInterval = rule.interval || 1
			this.localUntil = rule.until ? new Date(rule.until) : null
			this.localCount = rule.count || null

			if (rule.until) {
				this.endType = 'until'
			} else if (rule.count) {
				this.endType = 'count'
			} else {
				this.endType = 'never'
			}
		},

		async saveRecurrence() {
			if (this.localFrequency === 'NONE') {
				await this.clearRecurrence()
				this.closeEditor()
				return
			}

			// Build the recurrence rule
			const recurrenceData = {
				frequency: this.localFrequency,
				interval: this.localInterval || 1,
			}

			if (this.endType === 'until' && this.localUntil) {
				recurrenceData.until = this.localUntil
			} else if (this.endType === 'count' && this.localCount) {
				recurrenceData.count = this.localCount
			}

			// Dispatch to store
			await this.$store.dispatch('setRecurrenceRule', {
				task: this.task,
				recurrenceRule: recurrenceData,
			})

			this.closeEditor()
		},

		async clearRecurrence() {
			await this.$store.dispatch('removeRecurrenceRule', {
				task: this.task,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	border-bottom: 1px solid var(--color-border);
	padding: 0 6px;
	position: relative;
	margin-bottom: 0;
	width: 100%;
	color: var(--color-text-lighter);
	display: flex;

	&:first-child {
		border-top: 1px solid var(--color-border);
	}

	& * {
		cursor: pointer;
	}

	.item {
		&__content {
			display: flex;
			line-height: var(--default-clickable-area);
			min-width: 0;
			flex-grow: 1;
			gap: 0 4px;

			.content {
				&__icon {
					display: flex;
					height: var(--default-clickable-area);
					width: var(--default-clickable-area);
					min-width: var(--default-clickable-area);
					justify-content: center;

					.material-design-icon__svg {
						vertical-align: middle;
					}
				}

				&__name {
					flex-grow: 1;
					padding-right: 14px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: nowrap;
		}
	}

	&--readonly * {
		cursor: default;
	}

	&--clearable:hover .actions__clear {
		display: inline-block !important;
	}
}

.recurrence-editor {
	padding: 20px;
	min-width: 400px;

	h2 {
		margin-bottom: 20px;
	}

	&__warning {
		color: var(--color-warning);
		font-style: italic;
	}

	&__content {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	&__row {
		display: flex;
		align-items: center;
		gap: 10px;

		label {
			min-width: 100px;
			font-weight: bold;
		}

		.recurrence-select,
		.recurrence-input {
			flex: 1;
			padding: 8px;
			border: 1px solid var(--color-border);
			border-radius: var(--border-radius);
		}

		.recurrence-date {
			flex: 1;
		}
	}

	&__actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		justify-content: flex-end;
	}
}
</style>
