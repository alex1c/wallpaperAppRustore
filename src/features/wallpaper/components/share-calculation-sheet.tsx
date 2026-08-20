import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import type { CalculationReportModel } from '@/features/wallpaper/report'
import {
	formatCalculationPdfHtml,
	formatCalculationTextReport,
} from '@/features/wallpaper/report'
import { getAnalyticsService, getShareService } from '@/services'
import type { ModeAnalyticsValue, PatternAnalyticsValue } from '@/services/analytics'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

export interface ShareCalculationSheetProps {
	visible: boolean
	report: CalculationReportModel | null
	onClose: () => void
}

/**
 * Human-first share chooser: text result or detailed PDF via system Share Sheet.
 */
export function ShareCalculationSheet({
	visible,
	report,
	onClose,
}: ShareCalculationSheetProps) {
	const strings = t().wallpaper.share
	const [busy, setBusy] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const analyticsContext = report
		? {
			mode: report.mode as ModeAnalyticsValue,
			pattern: mapPattern(report.patternKind),
			has_openings: report.hasOpenings,
		}
		: null

	const handleClose = () => {
		if (busy) {
			return
		}
		setErrorMessage(null)
		onClose()
	}

	const handleShareText = async () => {
		if (!report || !analyticsContext || busy) {
			return
		}

		setErrorMessage(null)
		setBusy(true)

		try {
			const message = formatCalculationTextReport(report)
			const outcome = await getShareService().shareText(message)
			if (outcome.status === 'failed') {
				setErrorMessage(strings.errors.generic)
				return
			}
			if (outcome.status === 'unavailable') {
				setErrorMessage(strings.errors.unavailable)
				return
			}

			// A cancelled or shared result means the native sheet was presented;
			// failed/unavailable results above do not prove that it opened.
			getAnalyticsService().track('text_share_sheet_opened', {
				mode: analyticsContext.mode,
				pattern: analyticsContext.pattern,
			})

			onClose()
		} catch {
			setErrorMessage(strings.errors.generic)
		} finally {
			setBusy(false)
		}
	}

	const handleSharePdf = async () => {
		if (!report || !analyticsContext || busy) {
			return
		}

		setErrorMessage(null)
		setBusy(true)

		const analytics = getAnalyticsService()
		const mode = analyticsContext.mode
		const pattern = analyticsContext.pattern
		const hasOpenings = analyticsContext.has_openings

		analytics.track('pdf_generation_started', {
			mode,
			pattern,
			has_openings: hasOpenings,
		})

		// Close the Modal first — expo-print uses a WebView that can hang
		// while another full-screen Modal is still presented on Android.
		onClose()
		await new Promise((resolve) => setTimeout(resolve, 350))

		let generationCompleted = false
		try {
			const html = formatCalculationPdfHtml(report)
			const fileName = buildPdfFileName()
			const generated = await getShareService().generatePdfFromHtml(html, fileName)

			if (generated.status !== 'ok') {
				analytics.track('pdf_generation_failed', {
					mode,
					pattern,
					error_category: 'technical',
				})
				Alert.alert(strings.sheetTitle, strings.errors.pdfFailed)
				return
			}

			analytics.track('pdf_generation_completed', {
				mode,
				pattern,
				has_openings: hasOpenings,
			})
			generationCompleted = true

			const outcome = await getShareService().sharePdf(generated.uri)
			if (outcome.status === 'failed') {
				Alert.alert(strings.sheetTitle, strings.errors.generic)
				return
			}
			if (outcome.status === 'unavailable') {
				Alert.alert(strings.sheetTitle, strings.errors.unavailable)
				return
			}

			// A successful or cancelled share call indicates the OS sheet was
			// reached; unavailable/failed outcomes above do not.
			analytics.track('pdf_share_sheet_opened', {
				mode,
				pattern,
			})
		} catch {
			if (!generationCompleted) {
				analytics.track('pdf_generation_failed', {
					mode,
					pattern,
					error_category: 'technical',
				})
			}
			Alert.alert(
				strings.sheetTitle,
				generationCompleted ? strings.errors.generic : strings.errors.pdfFailed,
			)
		} finally {
			setBusy(false)
		}
	}

	return (
		<Modal
			animationType="slide"
			onRequestClose={handleClose}
			transparent
			visible={visible}
		>
			<View style={styles.backdrop}>
				<Pressable
					accessibilityRole="button"
					onPress={handleClose}
					style={StyleSheet.absoluteFill}
				/>
				<View style={styles.sheet}>
					<Text accessibilityRole="header" style={styles.title}>
						{strings.sheetTitle}
					</Text>

					<Pressable
						accessibilityRole="button"
						disabled={busy || !report}
						onPress={() => {
							void handleShareText()
						}}
						style={({ pressed }) => [
							styles.action,
							pressed && styles.pressed,
							busy && styles.disabled,
						]}
					>
						<Text style={styles.actionTitle}>{strings.textAction}</Text>
						<Text style={styles.actionHint}>{strings.textActionHint}</Text>
					</Pressable>

					<Pressable
						accessibilityRole="button"
						disabled={busy || !report}
						onPress={() => {
							void handleSharePdf()
						}}
						style={({ pressed }) => [
							styles.action,
							pressed && styles.pressed,
							busy && styles.disabled,
						]}
					>
						<Text style={styles.actionTitle}>{strings.pdfAction}</Text>
						<Text style={styles.actionHint}>{strings.pdfActionHint}</Text>
					</Pressable>

					{busy ? (
						<View style={styles.busyRow}>
							<ActivityIndicator color={colors.accent} />
							<Text style={styles.busyLabel}>{strings.status.generatingPdf}</Text>
						</View>
					) : null}

					{errorMessage ? (
						<Text style={styles.error}>{errorMessage}</Text>
					) : null}

					<Pressable
						accessibilityRole="button"
						disabled={busy}
						onPress={handleClose}
						style={({ pressed }) => [
							styles.cancel,
							pressed && styles.pressed,
						]}
					>
						<Text style={styles.cancelLabel}>{strings.cancel}</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	)
}

function mapPattern(
	kind: CalculationReportModel['patternKind'],
): PatternAnalyticsValue {
	if (kind === 'straight') {
		return 'straight'
	}
	if (kind === 'free') {
		return 'free'
	}
	return 'free'
}

function buildPdfFileName(): string {
	const now = new Date()
	const yyyy = now.getFullYear()
	const mm = String(now.getMonth() + 1).padStart(2, '0')
	const dd = String(now.getDate()).padStart(2, '0')
	return `wallpaper-calculation-${yyyy}-${mm}-${dd}`
}

const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: 'rgba(26, 29, 38, 0.45)',
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: colors.surface,
		borderTopLeftRadius: radii.lg,
		borderTopRightRadius: radii.lg,
		paddingBottom: spacing.xl,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
	},
	title: {
		...typography.subtitle,
		color: colors.textPrimary,
		marginBottom: spacing.md,
	},
	action: {
		backgroundColor: colors.background,
		borderColor: colors.border,
		borderRadius: radii.md,
		borderWidth: 1,
		marginBottom: spacing.sm,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
	},
	actionTitle: {
		...typography.subtitle,
		color: colors.textPrimary,
	},
	actionHint: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	cancel: {
		alignItems: 'center',
		marginTop: spacing.sm,
		paddingVertical: spacing.md,
	},
	cancelLabel: {
		...typography.body,
		color: colors.textSecondary,
	},
	busyRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	busyLabel: {
		...typography.caption,
		color: colors.textSecondary,
	},
	error: {
		...typography.caption,
		color: colors.error,
		marginTop: spacing.sm,
	},
	pressed: {
		opacity: 0.85,
	},
	disabled: {
		opacity: 0.6,
	},
})
