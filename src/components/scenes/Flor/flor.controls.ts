import { MutableRefObject } from 'react'
import * as R from 'react'
import * as browser from '@/utils/browser'

export function florControls(adjusted_particles: MutableRefObject<number>): {
    leverA: { value: number; min: number; max: number; step: number }
    offset: { value: number; min: number; max: number; step: number }
    leverC: { value: number; min: number; max: number; step: number }
    leverD: { value: number; min: number; max: number; step: number }
    leverE: { value: number; min: number; max: number; step: number }
    leverCrazy: { value: number; min: number; max: number; step: number }
    leverR: { value: number; min: number; max: number; step: number }
    leverR2: { value: number; min: number; max: number; strep: number }
    particles: { value: number; min: number; max: number }
} {
    return {
        leverA: {
            value: 0.65,
            min: 0,
            max: browser.isMobile() ? 0.65 : 70_000,
            step: 0.01,
        },
        offset: { value: 0.0, min: 0, max: 1, step: 0.01 },
        leverC: { value: 1, min: 1, max: 20, step: 1 },
        leverD: { value: 17, min: 0, max: 20, step: 1 },
        leverE: { value: 1.68, min: 0, max: 2, step: 0.001 },
        leverCrazy: { value: 0.45, min: 0.01, max: 2, step: 0.01 },
        leverR: { value: 2.0, min: 0, max: 2, step: 0.001 },
        leverR2: { value: 10, min: 1, max: 10, strep: 0.001 },
        particles: {
            value: adjusted_particles.current,
            min: 0,
            max: adjusted_particles.current,
        },
    }
}
