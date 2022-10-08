/* eslint-disable react-hooks/rules-of-hooks */
import * as R from 'react'
import * as F from '@react-three/fiber'
import * as T from 'three'
import { useDebugBeats, useDebugParticles, useDebugSections, useDebugSegments } from '@/helpers/store'
import { useAudioPosition } from 'react-use-audio-player'
import florecerData from '../../../music/florecer.json'

const Style = {
    base: [
        'color: #fff',
        'background-color: #444',
        'padding: 2px 4px',
        'border-radius: 2px',
    ],
    warning: ['color: #eee', 'background-color: red'],
    success: ['background-color: green'],
}

const styles = [Style.base, Style.warning, Style.success]
let beat = 0
let segment = 0
let section = 0

const log = (text, extra = []) => {
    let style = Style.base.join(';') + ';'
    style += extra.join(';') // Add any additional styles
    console.log(`%c${text}`, style)
}

let data = florecerData as MusicAnalysis

export function useMotions(
    adjusted_particles: R.MutableRefObject<number>,
    Lset: (value: {
        leverA?: number
        offset?: number
        leverC?: number
        particles?: number
        leverCrazy?: number
        leverD?: number
        leverE?: number
        leverR?: number
        leverR2?: number
    }) => void,
    points: R.MutableRefObject<
        T.Points<T.BufferGeometry, T.Material | T.Material[]>
    >
) {
    const { percentComplete, duration, seek, position } = useAudioPosition({
        highRefreshRate: true,
    })

    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()

    const { camera } = F.useThree()

    F.useFrame((state) => {
        if (!(position > 0) /** started */) {
            return
        }
        // wtf nice ( •_•)>⌐■-■
        camera.position.z = Math.cos(
            camera.position.z + state.clock.elapsedTime * 0.1
        )
        camera.position.x = Math.sin(
            camera.position.x + state.clock.elapsedTime * 0.1
        )
    })

    const inBeatEffect = R.useRef(false)

    F.useFrame((state) => {
        if (!(position > 0) /** started */) {
            return
        }

        let currentBeatDuration = data.beats[0].start + data.beats[0].duration
        let beatDelta = data.beats[0].duration / 5 /** can be whatever */

        if (!inBeatEffect.current) {
            if (position > data.beats[0].start && position < currentBeatDuration) {
                // log('beat', styles[beat % 3])
                // console.log({ start: data.beats[0].start, delta: beatDelta, next: data.beats[0].start + data.beats[0].duration })
                inBeatEffect.current = true
                // changeDebugBeats(beat++)
                changeDebugBeats(data.beats[0].confidence)
                // console.log({ particles: adjusted_particles.current })

                if (data.beats[0].confidence >= 0.4) {
                    const newParticles = Math.floor(
                        Math.random() * 0.2 * adjusted_particles.current
                    )
                    changeDebugParticles(newParticles)
                    Lset({ particles: newParticles })
                    Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
                }

                if (data.beats[0].confidence < 0.4) {
                    points.current.rotateX(0.5)
                    points.current.rotateY(0.5)
                }
            }
        }

        if (data.beats[0].confidence < 0.4) {
            camera.rotateZ(state.clock.elapsedTime * 0.5)
        }

        if (inBeatEffect.current) {
            if (position > currentBeatDuration - 2 * beatDelta) {
                inBeatEffect.current = false
                const newParticles = 1 * adjusted_particles.current
                changeDebugParticles(newParticles)
                Lset({ particles: newParticles })
                Lset({ leverCrazy: 2 * 0.45 + Math.random() })

                data.beats.splice(0, 1)
            }
        }
    })

    const inSectionEffect = R.useRef(false)
    const [, changeDebugSections] = useDebugSections()
    F.useFrame((state) => {
        if (!(position > 0) /** started */) return

        let cSectionDuration =
            data.sections[0].start + data.sections[0].duration
        let sectionDelta = data.sections[0].duration / 5 /** can be whatever */

        if (!inSectionEffect.current) {
            if (
                position > data.sections[0].start &&
                position < cSectionDuration
            ) {
                log('sections', styles[section % 3])
                changeDebugSections(data.sections[0].confidence)
                console.log({
                    start: data.sections[0].start,
                    delta: sectionDelta,
                    next: data.sections[0].start + data.sections[0].duration,
                })
                inSectionEffect.current = true
                section++
            }
        }

        if (inSectionEffect.current) {
            if (position > cSectionDuration - 2 * sectionDelta) {
                inSectionEffect.current = false
                data.sections.splice(0, 1)
            }
        }
    })


    // const inSegmentEffect = R.useRef(false)
    // const [, changeDebugSegments] = useDebugSegments()
    // F.useFrame((state) => {
    //     if (!(position > 0) /** started */) return

    //     let currentSegmentDuration =
    //         data.segments[0].start + data.segments[0].duration
    //     let segmentDelta = data.segments[0].duration / 5 /** can be whatever */

    //     if (!inSegmentEffect.current) {
    //         if (
    //             position > data.segments[0].start &&
    //             position < currentSegmentDuration
    //         ) {
    //             log('segments', styles[segment % 3])
    //             changeDebugSegments(data.segments[0].confidence)
    //             console.log({
    //                 start: data.segments[0].start,
    //                 delta: segmentDelta,
    //                 next: data.segments[0].start + data.segments[0].duration,
    //             })
    //             inSegmentEffect.current = true
    //             segment++
    //         }
    //     }

    //     if (inSegmentEffect.current) {
    //         if (position > currentSegmentDuration - 2 * segmentDelta) {
    //             inSegmentEffect.current = false
    //             data.segments.splice(0, 1)
    //         }
    //     }
    // })
}

// F.useFrame((state) => {
//     if (!(position > 0) /** started */) return

//     let currentBeatDuration = data.bars[0].start + data.bars[0].duration
//     let beatDelta = data.bars[0].duration / 5 /** can be whatever */
//     // console.log({ start: data.beats[0].start, delta: beatDelta, next: data.beats[0].start + data.beats[0].duration })
//     // console.log(position)

//     if (!inEffect.current) {
//         if (position > data.bars[0].start && position < currentBeatDuration) {
//             log('bars', styles[beat % 3])
//             inEffect.current = true
//             beat++
//         }
//     }

//     if (inEffect.current) {
//         if (position > currentBeatDuration - 2 * beatDelta) {
//             inEffect.current = false
//             data.bars.splice(0, 1)
//         }
//     }
// })

// F.useFrame((state) => {
//     if (!(position > 0) /** started */) return

//     let currentBeatDuration = data.sections[0].start + data.sections[0].duration
//     let beatDelta = data.sections[0].duration / 5 /** can be whatever */
//     // console.log(position)

//     if (!inEffect.current) {
//         if (position > data.sections[0].start && position < currentBeatDuration) {
//             log('sections', styles[beat % 3])
//             console.log({ start: data.sections[0].start, next: data.sections[0].start + data.sections[0].duration })
//             inEffect.current = true
//             beat++
//         }
//     }

//     if (inEffect.current) {
//         if (position > currentBeatDuration - 2 * beatDelta) {
//             inEffect.current = false
//             data.sections.splice(0, 1)
//         }
//     }
// })

// F.useFrame((state) => {
//     if (!(position > 0) /** started */) return

//     let currentBeatDuration = data.tatums[0].start + data.tatums[0].duration
//     let beatDelta = data.tatums[0].duration / 5 /** can be whatever */
//     // console.log(position)

//     if (!inEffect.current) {
//         if (position > data.tatums[0].start && position < currentBeatDuration) {
//             log('tatums', styles[beat % 3])
//             console.log({ start: data.tatums[0].start, next: data.tatums[0].start + data.sections[0].duration })
//             inEffect.current = true
//             beat++
//         }
//     }

//     if (inEffect.current) {
//         if (position > currentBeatDuration - 2 * beatDelta) {
//             inEffect.current = false
//             data.tatums.splice(0, 1)
//         }
//     }
// })

export interface MusicAnalysis {
    meta: Meta
    track: Track
    bars: Bar[]
    beats: Beat[]
    sections: Section[]
    segments: Segment[]
    tatums: Tatum[]
}

export interface Meta {
    analyzer_version: string
    platform: string
    detailed_status: string
    status_code: number
    timestamp: number
    analysis_time: number
    input_process: string
}

export interface Track {
    num_samples: number
    duration: number
    sample_md5: string
    offset_seconds: number
    window_seconds: number
    analysis_sample_rate: number
    analysis_channels: number
    end_of_fade_in: number
    start_of_fade_out: number
    loudness: number
    tempo: number
    tempo_confidence: number
    time_signature: number
    time_signature_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    codestring: string
    code_version: number
    echoprintstring: string
    echoprint_version: number
    synchstring: string
    synch_version: number
    rhythmstring: string
    rhythm_version: number
}

export interface Bar {
    start: number
    duration: number
    confidence: number
}

export interface Beat {
    start: number
    duration: number
    confidence: number
}

export interface Section {
    start: number
    duration: number
    confidence: number
    loudness: number
    tempo: number
    tempo_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    time_signature: number
    time_signature_confidence: number
}

export interface Segment {
    start: number
    duration: number
    confidence: number
    loudness_start: number
    loudness_max_time: number
    loudness_max: number
    loudness_end: number
    pitches: number[]
    timbre: number[]
}

export interface Tatum {
    start: number
    duration: number
    confidence: number
}
