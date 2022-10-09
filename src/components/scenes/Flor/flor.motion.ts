/* eslint-disable react-hooks/rules-of-hooks */
import * as R from 'react'
import * as F from '@react-three/fiber'
import {
    useDebugBeats,
    useDebugParticles,
    useDebugSections,
    useDebugSegments,
    useSongPosition,
} from '@/helpers/store'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'
import florecerData from '../../../music/florecer.json'

const Style = {
    base: [
        'color: #fff',
        'background-color: #444',
        'padding: 2px 4px',
        'border-radius: 2px',
    ],
    warning: ['color: #eee', 'background-color: #aa0000'],
    success: ['background-color: #00bb88'],
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
    chunk: Beat | Section
    state: F.RootState
}

export function useMotions(
    { type }: { type: 'beats' | 'sections' },
    inactiveCallback: (params: ParamsProps) => void,
    activeCallback: (params: ParamsProps) => void,
    frameCallback: (params: ParamsProps) => void,
) {
    // let data = R.useRef<MusicAnalysis>(window.structuredClone(florecerData))
    let analysis = R.useMemo(
        () => window.structuredClone(florecerData) as MusicAnalysis,
        []
    )
    let currentChunk = R.useRef(analysis.beats[0])
    const { position } = useAudioPosition({
        highRefreshRate: true,
    })

    const inMotion = R.useRef(false)
    const { playing } = useAudioPlayer()
    const [songPosition] = useSongPosition()

    R.useEffect(() => {
        const index = nextChunkIndex({ songPosition: position, type })
        currentChunk.current = analysis[type][index]
    }, [songPosition])

    F.useFrame((state) => {
        if (!(position > 0) /** started */ || !playing) {
            return
        }

        let cChunk = currentChunk.current
        let cEnd = cChunk.start + cChunk.duration
        let cDelta = cChunk.duration / 5 /** can be whatever */
        // log(
        //     `frame -ENTER ${beat} - start ${cBeat.start} - end ${currentBeatDuration}`,
        //     styles[1 % 3]
        // )

        if (!inMotion.current) {
            // log(`frame -!inBeatEffect.current - pos: ${position}`, styles[2])
            if (position > cChunk.start && position < cEnd) {
                log(type, styles[chunkCounter % 3])
                // console.log({ start: currentBeat.start, delta: beatDelta, next: currentBeat.start + currentBeat.duration })
                inMotion.current = true
                chunkCounter++
                // changeDebugBeats(currentBeat.confidence)
                // todo: better name
                activeCallback({ chunk: cChunk, state })
            }
        }

        frameCallback({ chunk: cChunk, state })

        if (inMotion.current) {
            // log('frame -inBeatEffect.current', styles[3 % 3])
            if (position > cEnd - 2 * cDelta) {
                // todo: better name
                const index = nextChunkIndex({ songPosition: position, type })
                currentChunk.current = analysis[type][index]

                inactiveCallback({ next: index, chunk: cChunk, state })
                inMotion.current = false
            }
        }

        // log(`frame -END ${beat}`, styles[4 % 3])
    })
}

function nextChunkIndex({
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
