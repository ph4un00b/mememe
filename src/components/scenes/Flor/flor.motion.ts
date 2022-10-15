/* eslint-disable react-hooks/rules-of-hooks */
import * as R from 'react'
import * as F from '@react-three/fiber'
import {
    useAudioStatus,
    useMediaPlayer,
    useSeekPosition,
    useSongPosition,
} from '@/helpers/store'
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
    let style = Style.base.join(';') + ';'
    style += extra.join(';') // Add any additional styles
    // eslint-disable-next-line no-console
    console.log(`%c${text}`, style)
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
    onUpdateCallback: (params: ParamsProps) => void
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
    const [trackChanged] = useMediaPlayer()
    const cChunk = R.useRef<[number, Beat | Section]>([0, analysis[type][0]])

    const prevTime = R.useRef(0)
    const prevPosition = R.useRef(0)
    const pos = R.useRef(0)

    /**
     * simplest solution in my mind at the moment
     * to have high rate timing for animations,
     * i might find something better afterwards,
     * this seems to be issuing more than needed
     * i might refactor this out of this context
     * in order to run it once
     * and *respect the clock!* (magnolia ref) XP
     */
    F.useFrame((state) => {
        if (!(songPosition > 0) || !songPlaying) return
        if (prevPosition.current == songPosition) {
            const delta = state.clock.elapsedTime - prevTime.current
            pos.current += delta
        }
        prevPosition.current = songPosition
        // todo: research if i can get a better delta
        prevTime.current = state.clock.elapsedTime
    })

    R.useEffect(() => {
        const index = getChunkIdx({
            songPosition: pos.current,
            type,
        })
        cChunk.current = [index, analysis[type][index]]
        /** the intention is to force enterCallback
         * @todo find a better way?
         */
        // inMotion.current = false
    }, [seekedPosition])

    R.useLayoutEffect(() => {
        if (songPosition > 0) return
        cChunk.current = [0, analysis[type][0]]
    }, [trackChanged])

    F.useFrame((state) => {
        // if (type != 'beats') return
        // console.log({ curr: currentChunk.current })
        // console.log({ songPosition })
        // console.log({ motion: inMotion.current })
        if (!(pos.current > 0) || !songPlaying) {
            return
        }

        let [, chunk] = cChunk.current
        if (!chunk /** was last chunk */) {
            onUpdateCallback({
                chunk,
                state,
                current: cChunk.current,
                event: 'ended',
            })
        }
        if (!chunk /** was last chunk */) return

        let chunkEnd = chunk.start + chunk.duration
        let slice = chunk.duration / 5 /** can be whatever */

        if (!inMotion.current) {
            if (pos.current > chunk.start && pos.current < chunkEnd) {
                inMotion.current = true
                logChunk(type, cChunk)
                enterCallback({ chunk: chunk, state, current: cChunk.current })
            }
        } else {
            const threshold = chunkEnd - 2 * slice
            if (pos.current > threshold) {
                const idx = getChunkIdx({
                    songPosition: pos.current,
                    type,
                })
                cChunk.current = [idx + 1, analysis[type][idx + 1]]
                beforeLeaveCallback({
                    next: idx + 1,
                    chunk,
                    state,
                    current: cChunk.current,
                })
                inMotion.current = false
            }
        }

        onUpdateCallback({
            chunk: chunk,
            state,
            current: cChunk.current,
            event: inMotion.current ? 'entering' : 'leaving',
        })
    })
}

function logChunk(
    type: string,
    currentChunk: R.MutableRefObject<[number, Beat | Section]>
) {
    log(
        `${type} - ${currentChunk.current[0]}`,
        styles[currentChunk.current[0] % 3]
    )
}

function getChunkIdx({
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
