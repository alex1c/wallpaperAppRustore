import { env } from '@/config/env'

/**
 * Official Yandex demo ad unit IDs — guaranteed test creatives, no paid traffic.
 * @see https://ads.yandex.com/helpcenter/en/dev/android/demo-blocks
 */
export const YANDEX_DEMO_BANNER_UNIT_ID = 'demo-banner-yandex'
export const YANDEX_DEMO_REWARDED_UNIT_ID = 'demo-rewarded-yandex'

/** Product placement ids — never confuse with Yandex adUnitId strings. */
export type BannerPlacementId = 'result_banner' | 'footer_banner'
export type RewardedPlacementId = 'dev_rewarded_test' | 'future_pdf_reward'

export type AdPlacementId = BannerPlacementId | RewardedPlacementId

/** Product banner placements that share one Yandex banner ad unit. */
export const PRODUCT_BANNER_PLACEMENTS: readonly BannerPlacementId[] = [
	'result_banner',
	'footer_banner',
] as const

export function isProductBannerPlacement(
	placement: string,
): placement is BannerPlacementId {
	return (PRODUCT_BANNER_PLACEMENTS as readonly string[]).includes(placement)
}

/**
 * Max height (dp) for the result inline banner.
 * Keeps the adaptive banner compact inside scroll content.
 */
export const RESULT_BANNER_MAX_HEIGHT_DP = 90

function isJestRuntime(): boolean {
	return typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined
}

function trimUnitId(value: string): string {
	return value.trim()
}

const YANDEX_PRODUCTION_UNIT_ID_PATTERN = /^R-M-\d+-\d+$/

/** Accept only partner-console unit IDs in production; demo/malformed values disable ads. */
export function resolveConfiguredProductionUnitId(value: string): string | null {
	const configured = trimUnitId(value)
	return YANDEX_PRODUCTION_UNIT_ID_PATTERN.test(configured) ? configured : null
}

/**
 * Resolves the banner ad unit for the current runtime.
 *
 * Strategy:
 * - `__DEV__` / Jest → always official demo ID (never production impressions).
 * - Production → env production ID only; empty → ads disabled (fail open).
 */
export function resolveBannerAdUnitId(): string | null {
	if (__DEV__ || isJestRuntime()) {
		return YANDEX_DEMO_BANNER_UNIT_ID
	}

	return resolveConfiguredProductionUnitId(env.yandexAdsBannerUnitId)
}

/**
 * Resolves the rewarded ad unit for the current runtime.
 * Same dev/prod strategy as banners.
 */
export function resolveRewardedAdUnitId(): string | null {
	if (__DEV__ || isJestRuntime()) {
		return YANDEX_DEMO_REWARDED_UNIT_ID
	}

	return resolveConfiguredProductionUnitId(env.yandexAdsRewardedUnitId)
}

/** True when a banner placement may attempt to load (unit id present). */
export function isBannerConfigured(): boolean {
	return resolveBannerAdUnitId() !== null
}

/** True when rewarded may attempt to load (unit id present). */
export function isRewardedConfigured(): boolean {
	return resolveRewardedAdUnitId() !== null
}
