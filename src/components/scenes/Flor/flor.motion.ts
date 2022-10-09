/* eslint-disable react-hooks/rules-of-hooks */
import * as R from 'react'
import * as F from '@react-three/fiber'
import * as T from 'three'
import {
    useDebugBeats,
    useDebugParticles,
    useDebugSections,
    useDebugSegments,
    useSongPosition,
} from '@/helpers/store'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'
import florecerData from '../../../music/florecer.json'
import { useEventListener } from '@/utils/hooks'

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
    // eslint-disable-next-line no-console
    console.log(`%c${text}`, style)
}

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
    // let data = R.useRef<MusicAnalysis>(window.structuredClone(florecerData))
    let analysis = R.useMemo(
        () => window.structuredClone(florecerData) as MusicAnalysis,
        []
    )
    let currentBeat = R.useRef(analysis.beats[0])

    const { percentComplete, duration, seek, position } = useAudioPosition({
        highRefreshRate: true,
    })


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
    const { playing } = useAudioPlayer()

    const [songPosition] = useSongPosition()
    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()

    R.useEffect(() => {
        const next = nextChunk({ songPosition: position, type: 'beats' })
        currentBeat.current = analysis['beats'][next]
    }, [songPosition])

    F.useFrame((state) => {
        if (!(position > 0) /** started */ || !playing) {
            return
        }

        let cBeat = currentBeat.current
        let currentBeatDuration = cBeat.start + cBeat.duration
        let beatDelta = cBeat.duration / 5 /** can be whatever */
        // log(
        //     `frame -ENTER ${beat} - start ${cBeat.start} - end ${currentBeatDuration}`,
        //     styles[1 % 3]
        // )

        if (!inBeatEffect.current) {
            // log(`frame -!inBeatEffect.current - pos: ${position}`, styles[2])
            if (position > cBeat.start && position < currentBeatDuration) {
                log('beat', styles[beat % 3])
                // console.log({ start: currentBeat.start, delta: beatDelta, next: currentBeat.start + currentBeat.duration })
                inBeatEffect.current = true
                beat++
                // changeDebugBeats(currentBeat.confidence)

                if (cBeat.confidence >= 0.4) {
                    const newParticles = Math.floor(
                        Math.random() * 0.2 * adjusted_particles.current
                    )
                    changeDebugParticles(newParticles)
                    Lset({ particles: newParticles })
                    Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
                }

                if (cBeat.confidence < 0.4) {
                    points.current.rotateX(0.5)
                    points.current.rotateY(0.5)
                }
            }
        }

        if (cBeat.confidence < 0.4) {
            camera.rotateZ(state.clock.elapsedTime * 0.5)
        }

        if (inBeatEffect.current) {
            // log('frame -inBeatEffect.current', styles[3 % 3])
            if (position > currentBeatDuration - 2 * beatDelta) {
                const newParticles = 1 * adjusted_particles.current
                changeDebugParticles(newParticles)
                Lset({ particles: newParticles })
                Lset({ leverCrazy: 2 * 0.45 + Math.random() })

                const next = nextChunk({ songPosition: position, type: 'beats' })
                currentBeat.current = analysis['beats'][next]

                changeDebugBeats(next)
                inBeatEffect.current = false
            }
        }

        // log(`frame -END ${beat}`, styles[4 % 3])
    })
}

function nextChunk({
    songPosition,
    type,
}: {
    songPosition: number
    type: 'beats' | 'sections'
}): number {
    const dataList = florecerData[type]
    for (let idx = 0; idx < dataList.length; idx++) {
        const chunk = dataList[idx]
        let endChunk = chunk.start + chunk.duration
        // if (songPosition > beat.start && position < endBeat) {
        if (songPosition < endChunk) {
            return idx + 1
        } else {
            // console.log(beat.start)
            continue
        }
    }
}

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
