<template>
	<table v-if="statistics" class="report">
		<tr>
			<th>{{ $t('main.leek') }}</th>
			<th>{{ $t('main.level') }}</th>
			<th>{{ $t('damage_received') }}</th>
			<th>{{ $t('damage_inflicted') }}</th>
			<th>{{ $t('heal_received') }}</th>
			<th>{{ $t('heal_casted') }}</th>
			<th>{{ $t('kills') }}</th>
			<th>{{ $t('tp_used') }}</th>
			<th>{{ $t('tp_per_turn') }}</th>
			<th>{{ $t('mp_used') }}</th>
			<th>{{ $t('turns_played') }}</th>
			<th>{{ $t('shootings') }}</th>
			<th>{{ $t('chips_used') }}</th>
			<th>{{ $t('summons') }}</th>
			<th>{{ $t('resurrections') }}</th>
			<th>{{ $t('criticals') }}</th>
			<th>{{ $t('bugs') }}</th>
		</tr>
		<tr>
			<td colspan="17" class="header"><b>{{ $t('team_n', [1]) }}</b></td>
		</tr>
		<template v-for="entity in statistics.team1">
			<report-statistics-entity :key="entity.leek.id" :entity="entity" :stats="stats" :best="best" />
			<report-statistics-entity v-for="summon in entity.summons" :key="entity.leek.id + '-' + summon.leek.id" :entity="summon" :stats="stats" :best="best" />
		</template>
		<tr>
			<td colspan="17" class="header"><b>{{ $t('team_n', [2]) }}</b></td>
		</tr>
		<template v-for="entity in statistics.team2">
			<report-statistics-entity :key="entity.leek.id" :entity="entity" :stats="stats" :best="best" />
			<report-statistics-entity v-for="summon in entity.summons" :key="entity.leek.id + '-' + summon.leek.id" :entity="summon" :stats="stats" :best="best" />
		</template>
	</table>
</template>

<script lang="ts">
	import { Action, ActionType } from '@/model/action'
	import { EffectType } from '@/model/effect'
	import { Component, Prop, Vue } from 'vue-property-decorator'
	import ReportStatisticsEntity from './report-statistics-entity.vue'

	@Component({ components: { ReportStatisticsEntity } })
	export default class ReportStatistics extends Vue {
		@Prop({required: true}) fight!: any
		@Prop({required: true}) statistics!: any
		stats = ['dmg_in', 'dmg_out', 'heal_in', 'heal_out', 'kills', 'usedPT', 'usedPTperTurn', 'usedPM', 'roundsPlayed', 'actionsWeapon', 'actionsChip', 'invocation', 'resurrection', 'critical', 'crashes']

		get best() {
			const result: any = {}
			for (const stat of this.stats) {
				let best = 0
				let bestEntity = null
				for (const e in this.statistics.leeks) {
					if (this.statistics.leeks[e][stat] > best) {
						best = this.statistics.leeks[e][stat]
						bestEntity = this.statistics.leeks[e].leek.id
					}
				}
				if (bestEntity !== null) {
					result[stat] = bestEntity
				}
			}
			return result
		}
	}
</script>

<style lang="scss" scoped>
	td.header {
		text-align: left;
		background: white;
	}
	th {
		border: 1px solid #ddd;
		padding: 6px;
		background: white;
		font-weight: normal;
		color: #777;
		font-size: 14px;
	}
	td {
		border: 1px solid #ddd;
		text-align: center;
		padding: 4px 8px;
	}
</style>