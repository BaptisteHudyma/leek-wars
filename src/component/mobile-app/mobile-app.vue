<template>
	<div>
		<div class="page-header page-bar">
			<h1>{{ $t('title') }}</h1>
			<div class="tabs">
				<router-link to="/about">
					<div class="tab">
						<v-icon>mdi-information-variant</v-icon>
						{{ $t('main.about') }}
					</div>
				</router-link>
				<router-link to="/changelog">
					<div class="tab">
						<v-icon>mdi-format-list-bulleted-square</v-icon>
						{{ $t('main.changelog') }}
					</div>
				</router-link>
				<router-link to="/statistics">
					<div class="tab">
						<v-icon>mdi-chart-timeline-variant</v-icon>
						{{ $t('main.stats') }}
					</div>
				</router-link>
			</div>
		</div>
		<panel class="first last">
			<h3>{{ $t('app_installation') }}</h3>
			<br>
			<div v-html="$t('app_info')"></div>
			<div class="steps">
				<div v-for="n in [1, 2, 3, 4]" :key="n" class="step">
					<img :src="'/image/app/step' + n + '.jpg'">
					<div class="legend"><b>{{ $t('step_n', [n]) }}</b> - {{ $t('step' + n) }}</div>
				</div>
			</div>
			<h3>{{ $t('app_preview') }}</h3>
			<div class="previews">
				<div v-for="n in [1, 2, 3, 4, 5, 6, 7, 8]" :key="n" class="preview">
					<img :src="'/image/app/preview' + n + '.jpg'">
					<div class="legend">{{ $t('preview' + n) }}</div>
				</div>
			</div>
		</panel>
	</div>
</template>

<script lang="ts">
	import { LeekWars } from '@/model/leekwars'
	import { Component, Vue } from 'vue-property-decorator'

	@Component({ name: 'mobile_app', i18n: {} })
	export default class MobileApp extends Vue {
		created() {
			LeekWars.setTitle(this.$t('title'))
		}
	}
</script>

<style lang="scss" scoped>
	.steps {
		display: flex;
		margin: 10px 0;
	}
	.step {
		flex: 1;
		text-align: center;
		img {
			padding: 5px;
			width: calc(100% - 10px);
		}
	}
	.legend {
		font-style: italic;
	}
	.previews {
		display: flex;
		flex-wrap: wrap;
	}
	.preview {
		flex: 1 0 25%;
		text-align: center;
		margin-bottom: 20px;
		img {
			padding: 5px;
			width: calc(100% - 10px);
		}
	}
</style>