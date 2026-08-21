import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { t } from '@/i18n'
import { getAdService } from '@/services/ads'
import { colors, radii, spacing, typography } from '@/theme'

/**
 * Development-only rewarded verification control.
 * Tree-shaken from production UI via `__DEV__` gate at the call site.
 */
export function DevRewardedTestButton() {
	const strings = t().wallpaper.adsDev
	const [busy, setBusy] = useState(false)

	if (!__DEV__) {
		return null
	}

	const handlePress = async () => {
		if (busy) {
			return
		}
		setBusy(true)
		try {
			const result = await getAdService().showRewarded('dev_rewarded_test')
			if (result.completed && result.rewardGranted) {
				Alert.alert(strings.rewardedEarned)
			} else if (result.completed) {
				Alert.alert(strings.rewardedClosed)
			} else {
				Alert.alert(strings.rewardedUnavailable)
			}
		} finally {
			setBusy(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.hint}>{strings.rewardedTestHint}</Text>
			<Pressable
				accessibilityRole="button"
				disabled={busy}
				onPress={() => {
					void handlePress()
				}}
				style={({ pressed }) => [
					styles.button,
					pressed && styles.pressed,
					busy && styles.busy,
				]}
			>
				<Text style={styles.label}>{strings.rewardedTestButton}</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: spacing.lg,
		opacity: 0.85,
	},
	hint: {
		...typography.caption,
		color: colors.textSecondary,
		marginBottom: spacing.xs,
	},
	button: {
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: radii.md,
		borderWidth: 1,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	pressed: {
		opacity: 0.7,
	},
	busy: {
		opacity: 0.5,
	},
	label: {
		...typography.caption,
		color: colors.textSecondary,
	},
})
