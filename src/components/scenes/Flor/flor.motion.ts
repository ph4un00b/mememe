/* eslint-disable react-hooks/rules-of-hooks */
import * as R from 'react'
import * as F from '@react-three/fiber'
import {
    useAudioStatus,
    useSeekPosition,
    useSongPosition,
} from '@/helpers/store'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'
import florecerData from '../../../music/florecer.json'
import clone from 'lodash.clone'
import * as X from 'next-axiom'

const Style = {
    base: [
        'color: #fff',
        'background-color: #444',
        'padding: 2px 4px',
        'border-radius: 2px',
    ],
    warning: ['color: #eee', 'background-color: #aa0000'],
    success: ['background-color: #00bb44'],
    seek: ['background-color: #ff44ff'],
}

const styles = [Style.base, Style.warning, Style.success]
let chunkCounter = 0

const log = (text, extra = []) => {
    return
}

type ParamsProps = {
  /** @todo make always available?*/ next?: number
    current?: [number, Beat | Section]
    chunk: Beat | Section
    state: F.RootState
    event?: 'entering' | 'leaving' | 'ended'
}

export function useMotions(
    { type }: { type: 'beats' | 'sections' },
    beforeLeaveCallback: (params: ParamsProps) => void,
    enterCallback: (params: ParamsProps) => void,
    frameCallback: (params: ParamsProps) => void
) {
    // let data = R.useRef<MusicAnalysis>(window.structuredClone(florecerData))
    let analysis = R.useMemo(() => {
        if ('structuredClone' in window) {
            return window.structuredClone(florecerData) as MusicAnalysis
        }
        /** mostly ios fallback */
        X.log.error('🌸', {
            sopa: '📛falling from structuredClone',
            agent: window.navigator.userAgent,
        })
        return clone(florecerData) as MusicAnalysis
    }, [])

    const inMotion = R.useRef(false)
    const [seekedPosition] = useSeekPosition()
    const [songPlaying] = useAudioStatus()
    const [songPosition] = useSongPosition()
    let currentChunk = R.useRef<[number, Beat | Section]>([0, analysis[type][0]])

    R.useEffect(() => {
        const index = currentChunkIndex({ songPosition, type })
        currentChunk.current = [index, analysis[type][index]]
        /** the intention is to force enterCallback
         * @todo find a better way?
         */
        // inMotion.current = false
    }, [seekedPosition])

    F.useFrame((state) => {
        // console.log({ songPlaying, songPosition })
        if (!(songPosition > 0) || !songPlaying) {
            return
        }
        let [, cChunk] = currentChunk.current
        if (!cChunk /** was last chunk */) {
            frameCallback({
                chunk: cChunk,
                state,
                current: currentChunk.current,
                event: 'ended',
            })
        }
        if (!cChunk /** was last chunk */) return

        let cEnd = cChunk.start + cChunk.duration
        let cDelta = cChunk.duration / 5 /** can be whatever */

        if (!inMotion.current) {
            if (songPosition > cChunk.start && songPosition < cEnd) {
                inMotion.current = true
                log(
                    `${type} - ${currentChunk.current[0]}`,
                    styles[currentChunk.current[0] % 3]
                )

                enterCallback({ chunk: cChunk, state, current: currentChunk.current })
            }
        } else {
            const threshold = cEnd - 2 * cDelta
            if (songPosition > threshold) {
                const index = currentChunkIndex({ songPosition, type })
                currentChunk.current = [index + 1, analysis[type][index + 1]]
                beforeLeaveCallback({
                    next: index + 1,
                    chunk: cChunk,
                    state,
                    current: currentChunk.current,
                })
                inMotion.current = false
            }
        }

        frameCallback({
            chunk: cChunk,
            state,
            current: currentChunk.current,
            event: inMotion.current ? 'entering' : 'leaving',
        })
    })
}

function currentChunkIndex({
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
        if (songPosition < endChunk) {
            // return idx + 1
            return idx
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
