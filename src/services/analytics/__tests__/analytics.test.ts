import {
  AppMetricaAnalyticsService,
  assertNoRawDimensionParams,
  bucketOpeningCount,
  bucketResultRolls,
  bucketWallCount,
  createAnalyticsService,
  hasConfiguredAppMetricaKey,
  mapPatternForAnalytics,
  mapRollPresetForAnalytics,
  NoopAnalyticsService,
  PLACEHOLDER_API_KEY,
  RecordingAnalyticsService,
  SafeAnalyticsService,
  setAnalyticsService,
  type AnalyticsService,
} from '@/services/analytics'
import {
  initializeAppServices,
  resetAppServicesInitializationForTests,
} from '@/services'

describe('analytics property mappers', () => {
  it('maps pattern and roll ids without raw dimensions', () => {
    expect(mapPatternForAnalytics('half-drop')).toBe('half_drop')
    expect(mapPatternForAnalytics('straight')).toBe('straight')
    expect(mapPatternForAnalytics(undefined)).toBe('free')
    expect(mapRollPresetForAnalytics('wide-1060')).toBe('preset_106')
    expect(mapRollPresetForAnalytics('narrow-530')).toBe('preset_053')
    expect(mapRollPresetForAnalytics('custom')).toBe('custom')
  })

  it('buckets counts for privacy-safe telemetry', () => {
    expect(bucketWallCount(1)).toBe('1_2')
    expect(bucketWallCount(4)).toBe('3_4')
    expect(bucketWallCount(9)).toBe('5_plus')
    expect(bucketOpeningCount(0)).toBe('0')
    expect(bucketOpeningCount(3)).toBe('3_plus')
    expect(bucketResultRolls(1)).toBe('1')
    expect(bucketResultRolls(4)).toBe('3_5')
    expect(bucketResultRolls(12)).toBe('11_plus')
  })

  it('rejects dimension-like analytics keys in the safety helper', () => {
    expect(() => assertNoRawDimensionParams({ result_roll_bucket: '1' })).not.toThrow()
    expect(() => assertNoRawDimensionParams({ room_length: 4 })).toThrow(/Unsafe/)
    expect(() => assertNoRawDimensionParams({ wall_height_mm: 2700 })).toThrow(/Unsafe/)
  })
})

describe('SafeAnalyticsService', () => {
  it('swallows provider failures so product flows continue', () => {
    const exploding: AnalyticsService = {
      initialize: () => {
        throw new Error('activate failed')
      },
      track: () => {
        throw new Error('track failed')
      },
      screen: () => {
        throw new Error('screen failed')
      },
      setEnabled: () => {
        throw new Error('setEnabled failed')
      },
    }

    const safe = new SafeAnalyticsService(exploding)
    expect(() => safe.initialize()).not.toThrow()
    expect(() => safe.track('app_open')).not.toThrow()
    expect(() => safe.screen('quick_calculator')).not.toThrow()
    expect(() => safe.setEnabled(false)).not.toThrow()
  })
})

describe('product event instrumentation contract', () => {
  beforeEach(() => {
    resetAppServicesInitializationForTests()
  })

  afterEach(() => {
    setAnalyticsService(createAnalyticsService())
    resetAppServicesInitializationForTests()
  })

  it('initializes once and records the privacy-safe product taxonomy', () => {
    const recording = new RecordingAnalyticsService()
    setAnalyticsService(new SafeAnalyticsService(recording))
    initializeAppServices()
    initializeAppServices()

    expect(recording.getInitializeCount()).toBe(1)
    expect(recording.trackedNames()).toEqual(['app_open'])

    recording.screen('quick_calculator')
    recording.track('quick_calculation_completed', {
      pattern: 'free',
      roll: 'preset_106',
      result_roll_bucket: bucketResultRolls(5),
    })
    recording.track('quick_calculation_failed', { error_category: 'validation' })
    recording.track('pattern_refinement_opened', { mode: 'quick' })
    recording.track('pattern_calculation_completed', {
      mode: 'quick',
      pattern: 'straight',
      result_roll_bucket: '3_5',
    })
    recording.track('pattern_calculation_blocked', {
      mode: 'quick',
      pattern: 'half_drop',
      block_reason: 'half_drop',
    })
    recording.track('quick_to_precise', { wall_count_bucket: '3_4' })
    recording.screen('precise_calculator')
    recording.track('precise_opened', {
      source: 'quick_entry',
      wall_count_bucket: '3_4',
    })
    recording.track('opening_added', {
      opening_type: 'door',
      opening_count_bucket: '1',
    })
    recording.track('opening_removed', {
      opening_type: 'window',
      opening_count_bucket: '0',
    })
    recording.track('precise_calculation_completed', {
      pattern: 'free',
      roll: 'preset_106',
      has_openings: true,
      wall_count_bucket: '3_4',
      opening_count_bucket: '1',
      result_roll_bucket: '6_10',
    })
    recording.track('precise_calculation_failed', {
      error_category: 'unsupported',
      has_openings: true,
    })
    recording.track('pattern_calculation_blocked', {
      mode: 'precise',
      pattern: 'straight',
      block_reason: 'straight_with_openings',
    })
    recording.track('explanation_opened', { mode: 'precise' })
    recording.track('precise_to_quick')
    recording.track('share_opened', {
      mode: 'quick',
      pattern: 'free',
      has_openings: false,
    })
    recording.track('text_share_sheet_opened', {
      mode: 'quick',
      pattern: 'free',
    })
    recording.track('pdf_generation_started', {
      mode: 'precise',
      pattern: 'straight',
      has_openings: true,
    })
    recording.track('pdf_generation_completed', {
      mode: 'precise',
      pattern: 'straight',
      has_openings: true,
    })
    recording.track('pdf_generation_failed', {
      mode: 'precise',
      pattern: 'free',
      error_category: 'calculation',
    })
    recording.track('pdf_share_sheet_opened', {
      mode: 'precise',
      pattern: 'straight',
    })

    for (const call of recording.calls) {
      if (call.kind === 'track') {
        assertNoRawDimensionParams(call.params as Record<string, unknown> | undefined)
      }
    }

    expect(recording.trackedNames()).toEqual(expect.arrayContaining([
      'app_open',
      'quick_calculation_completed',
      'precise_calculation_completed',
      'pattern_calculation_blocked',
      'opening_added',
      'explanation_opened',
      'precise_to_quick',
      'share_opened',
      'pdf_generation_completed',
      'pdf_share_sheet_opened',
    ]))
    expect(recording.trackedNames()).not.toContain('share_completed')
    expect(recording.calls.filter((call) => call.kind === 'screen')).toEqual([
      { kind: 'screen', name: 'quick_calculator' },
      { kind: 'screen', name: 'precise_calculator' },
    ])
  })
})

describe('createAnalyticsService', () => {
  it('uses noop under Jest so tests never hit the native SDK', () => {
    const service = createAnalyticsService()
    expect(() => service.initialize()).not.toThrow()
    expect(() => service.track('app_open')).not.toThrow()
  })

  it('treats placeholder API keys as unconfigured', () => {
    expect(hasConfiguredAppMetricaKey('')).toBe(false)
    expect(hasConfiguredAppMetricaKey(PLACEHOLDER_API_KEY)).toBe(false)
    expect(hasConfiguredAppMetricaKey('real-key-from-console')).toBe(true)
  })
})

describe('AppMetricaAnalyticsService', () => {
  it('activates once and reports events through an injected SDK bridge', () => {
    const activate = jest.fn()
    const reportEvent = jest.fn()
    const setDataSendingEnabled = jest.fn()

    const service = new AppMetricaAnalyticsService('test-api-key', () => ({
      activate,
      reportEvent,
      setDataSendingEnabled,
    }))

    service.initialize()
    service.initialize()
    service.track('quick_calculation_completed', {
      pattern: 'free',
      roll: 'preset_106',
      result_roll_bucket: '1',
    })
    service.screen('quick_calculator')
    service.setEnabled(false)

    expect(activate).toHaveBeenCalledTimes(1)
    expect(activate).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'test-api-key',
      locationTracking: false,
      advIdentifiersTracking: false,
    }))
    expect(reportEvent).toHaveBeenCalledWith(
      'quick_calculation_completed',
      expect.objectContaining({ pattern: 'free' }),
    )
    expect(reportEvent).toHaveBeenCalledWith('screen_view', { screen: 'quick_calculator' })
    expect(setDataSendingEnabled).toHaveBeenCalledWith(false)
    expect(service.isActivated()).toBe(true)
  })

  it('stays usable when the native module loader returns null', () => {
    const service = new AppMetricaAnalyticsService('test-api-key', () => null)
    expect(() => {
      service.initialize()
      service.track('app_open')
      service.screen('precise_calculator')
    }).not.toThrow()
    expect(service.isActivated()).toBe(false)
  })
})

describe('NoopAnalyticsService', () => {
  it('never throws for the full API surface', () => {
    const noop = new NoopAnalyticsService()
    expect(() => {
      noop.initialize()
      noop.track('app_open')
      noop.screen('quick_calculator')
      noop.setEnabled(false)
    }).not.toThrow()
  })
})
