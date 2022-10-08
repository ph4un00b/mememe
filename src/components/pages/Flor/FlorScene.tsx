import * as R from 'react'
import * as T from 'three'
import * as L from 'leva'
import * as F from '@react-three/fiber'
import { useColoritos } from '@/utils/coloritos'
import { useAudioPosition } from 'react-use-audio-player'
import * as browser from '@/utils/browser'

import florecerData from '../../../music/florecer.json'
import { useDebugBeats, useDebugParticles } from '@/helpers/store'
import { florControls } from './flor.controls'
// @ts-ignore
import vertexShader from './flor.vertex.glsl'
import { fragmentShader } from './flor.frag'
let data = florecerData as MusicAnalysis
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

const log = (text, extra = []) => {
    let style = Style.base.join(';') + ';'
    style += extra.join(';') // Add any additional styles
    console.log(`%c${text}`, style)
}

export default function FlorScene() {
    let adjusted_particles = R.useRef(browser.isMobile() ? 20_000 : 100_000)
    const geo = R.useRef<T.BufferGeometry>(null!)
    const points = R.useRef<T.Points>(null!)

    const [
        {
            leverA,
            offset,
            leverC,
            particles,
            leverCrazy,
            leverD,
            leverE,
            leverR,
            leverR2,
        },
        Lset,
    ] = L.useControls(() => florControls(adjusted_particles))

    const { gl, viewport, size } = F.useThree()
    /** @link https://github.com/pmndrs/react-three-fiber/discussions/1012 */
    // gl.getPixelRatio()
    // viewport -> size in three units
    // size -> size in pixels

    const mat = R.useMemo(
        () =>
            new T.ShaderMaterial({
                depthWrite: false,
                vertexColors: true,
                blending: T.AdditiveBlending,
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uSize: { value: 20 * leverA * gl.getPixelRatio() },
                },
            }),
        [leverA /** color */]
    )

    // const { scene } = useThree();
    R.useLayoutEffect(() => {
        if (points.current) {
            geo.current.dispose()
            mat.dispose()
            // scene.remove(points.current);
        }
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    const [[, niceColors]] = useColoritos({ quantity: 2 })
    // console.log({ colors });

    const arrays = R.useMemo(() => {
        const positions = new Float32Array(particles * 3)
        const colors = new Float32Array(particles * 3)
        // recreating PointMaterial size as scale
        const scales = new Float32Array(particles * 3 /** in xyz */)
        const randomness = new Float32Array(
            particles * 1 /** just need 1 dimension */
        )

        const colorIn = new T.Color(niceColors[0])
        // const colorOut = new T.Color(niceColors[1 + Math.floor(Math.random() * 4)]);
        const colorOut = new T.Color(niceColors[2])

        for (let i = 0; i < particles; i++) {
            const xyz = i * 3
            const [x, y, z] = [xyz, xyz + 1, xyz + 2]
            const random_leverCrazy = Math.random() * leverCrazy
            const random_noise = Math.random() * leverR
            const ramaAngle = ((i % leverD) / leverD) * Math.PI * 2
            const curveAngle = random_leverCrazy * leverE
            const angle = ramaAngle + curveAngle

            const [rx, ry, rz] = [
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
            ]

            randomness: {
                // randomness[x] = rx
                // randomness[y] = ry
                // randomness[z] = rz
                randomness[x] = 0
                randomness[y] = 0
                randomness[z] = 0
            }

            // positions[x] = Math.cos(angle) * random_leverCrazy + rx;
            positions[x] = Math.cos(angle) * random_leverCrazy
            // positions[y] = ry;
            positions[y] = 0
            // positions[z] = Math.sin(angle) * random_leverCrazy + rz;
            positions[z] = Math.sin(angle) * random_leverCrazy

            fusion_colors: {
                const mixedColor = colorIn.clone()
                mixedColor.lerp(colorOut, random_leverCrazy / leverCrazy)
                colors[x] = mixedColor.r
                colors[y] = mixedColor.g
                colors[z] = mixedColor.b
            }

            scales: {
                scales[i] = Math.random()
            }
        }
        return [positions, colors, scales, randomness] as const
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    F.useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        geo.current.attributes.position.needsUpdate = true
        points.current.rotation.y = t * 0.2

        /** uniforms */
        mat.uniforms.uTime.value = t
    })

    const { percentComplete, duration, seek, position } = useAudioPosition({
        highRefreshRate: true,
    })

    const inEffect = R.useRef(false)
    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()

    const { camera } = F.useThree()

    F.useFrame((state) => {
        if (!(position > 0) /** started */) return
        // wtf nice ( •_•)>⌐■-■
        camera.position.z = Math.cos(
            camera.position.z + state.clock.elapsedTime * 0.1
        )
        camera.position.x = Math.sin(
            camera.position.x + state.clock.elapsedTime * 0.1
        )
    })

    F.useFrame((state) => {
        if (!(position > 0) /** started */) return

        let currentBeatDuration = data.beats[0].start + data.beats[0].duration
        let beatDelta = data.beats[0].duration / 5 /** can be whatever */

        if (!inEffect.current) {
            if (position > data.beats[0].start && position < currentBeatDuration) {
                log('beat', styles[beat % 3])
                // console.log({ start: data.beats[0].start, delta: beatDelta, next: data.beats[0].start + data.beats[0].duration })
                inEffect.current = true
                // changeDebugBeats(beat++)
                changeDebugBeats(data.beats[0].confidence)
                console.log({ particles: adjusted_particles.current })

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

        if (inEffect.current) {
            if (position > currentBeatDuration - 2 * beatDelta) {
                inEffect.current = false
                const newParticles = 1 * adjusted_particles.current
                changeDebugParticles(newParticles)
                Lset({ particles: newParticles })
                Lset({ leverCrazy: 2 * 0.45 + Math.random() })

                data.beats.splice(0, 1)
            }
        }
    })

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

    return (
        <points
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            ref={points}
            // castShadow={true}
            material={mat}
        >
            <bufferGeometry ref={geo}>
                <bufferAttribute
                    attach='attributes-position'
                    array={arrays[0]}
                    count={arrays[0].length / 3}
                    itemSize={3}
                />
                <bufferAttribute
                    attach='attributes-color'
                    array={arrays[1]}
                    count={arrays[1].length / 3}
                    itemSize={3}
                />
                <bufferAttribute
                    attach='attributes-aScale'
                    array={arrays[2]}
                    count={arrays[2].length}
                    itemSize={1}
                />
                <bufferAttribute
                    attach='attributes-aRandomness'
                    array={arrays[3]}
                    count={arrays[3].length}
                    itemSize={3}
                />
            </bufferGeometry>
        </points>
    )
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
