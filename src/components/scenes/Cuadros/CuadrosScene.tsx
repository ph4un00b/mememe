/* eslint-disable no-var */
import * as T from 'three'
import * as React from 'react'
import {
    Canvas,
    extend,
    Object3DNode,
    useFrame,
    useThree,
} from '@react-three/fiber'
import { useControls } from 'leva'
import { MeshLine, MeshLineMaterial } from 'meshline'

import * as meshLine from 'meshline'
import { useEventListener } from '@/utils/hooks'
import { log } from 'next-axiom'

extend(meshLine)

declare module '@react-three/fiber' {
    interface ThreeElements {
        meshLine: Object3DNode<meshLine.MeshLine, typeof meshLine.MeshLine>
        meshLineMaterial: Object3DNode<
            meshLine.MeshLineMaterial,
            typeof meshLine.MeshLineMaterial
        >
    }
}

let Drums: HTMLAudioElement
let Music: HTMLAudioElement
let audioContext: AudioContext,
    audioData: Uint8Array,
    sourceNode: AudioBufferSourceNode,
    soundAnalyzer: AnalyserNode

// export default function () {
//     const { cw, ch } = useCanvas();
//     const { x, y, z, segmentos, triggerX, triggerY } = useControls(controls);

//     React.useEffect(() => {
//         return () => console.log("bye");
//     });
//     return (
//         <Canvas
//             dpr={[dpr.min, dpr.max]}
//             style={{
//                 width: cw + "px",
//                 height: ch + "px",
//                 backgroundColor: "black",
//             }}
//         >
//             <OC enableDamping makeDefault />
//             <MemoContainerGrid
//                 x={x}
//                 y={y}
//                 z={z}
//                 translateX={triggerX}
//                 translateY={triggerY}
//             >
//                 <MemoGrid segmentos={segmentos} />
//             </MemoContainerGrid>
//             <axesHelper args={[4]} />
//         </Canvas>
//     );
// }

export let MemoContainerGrid = React.memo(ContainerGrid)
function ContainerGrid({
    children,
    x,
    y,
    z,
    translateX,
    translateY,
}: {
    children: React.ReactNode
    x: number
    y: number
    z: number
    translateX: number
    translateY: number
}) {

    const playing = React.useRef(false)
    useEventListener('click', async (e: any) => {
        // ctrl + space
        // if (e.ctrlKey && e.keyCode == 32) {
        if (!audioContext) {
            await createAudio()
            sourceNode.start()
            // Music = createSimpleAudio("nachas2.mp3");
        }
        else {
            if (audioContext.state == 'suspended') {
                await audioContext.resume();
                // sourceNode.start(0)
            }
        }

        log.debug('audio', { audioContext, state: audioContext.state })
        // !audioContext.star ? sourceNode.pause() : sourceNode.play();
        // audioContext.state
        if (audioContext.state === 'running' && playing.current == false) {
            playing.current = true
            // audioContext.resume().then(() => {
            // sourceNode.start()
            // })
        } else {
            playing.current = false
            await audioContext.suspend();
            // sourceNode.s
        }

        // else {
        //     // audioContext.suspend().then(() => {

        //     sourceNode.stop()
        //     // })
        // }
        // !Drums.paused ? Drums.pause() : Drums.play();
        // }
    })

    useEventListener('dblclick', () => {
        // todo: verify on safari!
        if (!document.fullscreenElement) {
            document.querySelector('canvas')!.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    })

    useFrame(() => {
        geometry.translate(
            Math.floor(Math.random() * translateX),
            Math.floor(Math.random() * translateY),
            0
        )
    })

    return (
        <>
            <group position={[x, y, z]}>{children}</group>
        </>
    )
}

let MemoSquare = React.memo(Square2D)
function Square2D({
    x = 0,
    y = 0,
    z = 0,
    square_translate_x = 0,
    square_translate_y = 0,
    stroke = 0.1,
    scale = 1,
}: {
    x?: number
    y?: number
    z?: number
    square_translate_x?: number
    square_translate_y?: number
    stroke?: number
    scale?: number
}) {
    const strokes = [stroke, stroke, stroke, 0.01, 0.15, 0.2, 0.35, 0.02, 0.03]
    useFrame(() => {
        material.lineWidth = strokes[Math.floor(Math.random() * 9)]
    })

    return (
        <mesh
            scale={scale}
            position={[
                x + Math.floor(1 + Math.random() * square_translate_x),
                y + Math.floor(1 + Math.random() * square_translate_y),
                z,
            ]}
            args={[geometry, material]}
        >
            {/* <meshLine attach="
               geometry" points={points} />
            <meshLineMaterial
              attach="material"
              args={[materialArgs]}
            /> */}
        </mesh>
    )
}

let dpr = { min: 1, max: 2 }

let controls = {
    containerSize: {
        value: 30,
        min: 1,
        max: 30,
        step: 1,
    },
    segmentos: {
        value: 2,
        min: 1,
        max: 30,
        step: 1,
    },
    x: {
        value: -17,
        min: -30,
        max: 30,
        step: 1,
    },
    y: {
        value: -16,
        min: -30,
        max: 30,
        step: 1,
    },
    z: {
        value: -17,
        min: -50,
        max: 50,
        step: 1,
    },
    triggerX: {
        value: 0,
        min: -30,
        max: 30,
        step: 1,
    },
    triggerY: {
        value: 0,
        min: -30,
        max: 30,
        step: 1,
    },
}

export let MemoGrid = React.memo(GridCubeMeshLines)
function GridCubeMeshLines({ segmentos = 15 }) {
    const size = React.useRef(1 /** zero will cause errors on render */)
    size.current = Math.floor(1 + Math.random() * segmentos)
    const [, rerender] = React.useState({})

    const { square_x, square_y, stroke, scale } = useControls({
        scale: {
            value: 1,
            min: 1,
            max: 10,
            step: 0.1,
        },
        stroke: {
            value: 0.2,
            min: 0.01,
            max: 0.5,
            step: 0.01,
        },
        square_x: {
            value: 0,
            min: -10,
            max: 10,
            step: 0.001,
        },
        square_y: {
            value: 0,
            min: -10,
            max: 10,
            step: 0.001,
        },
    })

    useFrame(() => {
        geometry.setGeometry(
            // @ts-ignore
            createSquareGeometry({ size: size.current, scale }),
            (p) => 1,
        )
        drawWithAudio()
        rerender({}) // best way to do this?
    })

    return (
        <>
            {createRange(size).map((col) => {
                return (
                    <React.Fragment key={col}>
                        {createRange(size).map((row) => {
                            return (
                                <MemoSquare
                                    key={col + row}
                                    x={(col * 30 * scale) / size.current}
                                    y={(row * 30 * scale) / size.current}
                                    square_translate_x={square_x}
                                    square_translate_y={square_y}
                                    stroke={stroke}
                                    scale={scale}
                                />
                            )
                        })}
                    </React.Fragment>
                )
            })}
        </>
    )
}

let line = new MeshLine()
line.setGeometry(
    createSquareGeometry({}) as unknown as T.BufferGeometry,
    () => 1
)
var geometry = line.geometry

let materialArgs: {
    lineWidth?: number,
    map?: T.Texture,
    useMap?: number,
    alphaMap?: T.Texture,
    useAlphaMap?: number,
    color?: string | T.Color | number,
    opacity?: number,
    resolution: T.Vector2, // required???????????
    sizeAttenuation?: number,
    dashArray?: number,
    dashOffset?: number,
    dashRatio?: number,
    useDash?: number,
    visibility?: number,
    alphaTest?: number,
    repeat?: T.Vector2,
    transparent: boolean
} = {
    transparent: false,
    resolution: new T.Vector2(1, 1),
    lineWidth: 0.1,
    color: new T.Color(0xff0000),
    dashArray: 1, // always has to be the double of the line
    dashOffset: 0, // start the dash at zero
    dashRatio: 0.75, // visible length range min: 0.99, max: 0.5
}

var material = new MeshLineMaterial(materialArgs)

function drawWithAudio() {
    if (soundAnalyzer) {
        soundAnalyzer.getByteFrequencyData(audioData)

        let avg = 0
        // fetch human frequencies only
        for (let frequency = 4; frequency < 65; frequency++) {
            avg += audioData[frequency]
        }
        const val = Math.floor(avg / 60)
        const sound = mapRange(
            val,
            { iMin: 0, iMax: 256 },
            {
                oMin: 0,
                oMax: 1,
            }
        )

        if (sound > 0.4) {
            ; (material as unknown as T.MeshStandardMaterial).color.set(0x00ffff)
        }
        if (sound < 0.4) {
            ; (material as unknown as T.MeshStandardMaterial).color.set(0x000000)
        }
    }
}

function createRange(size: React.MutableRefObject<number>) {
    // 1x1, 30
    // 2x2 15
    // 3x3, 10
    // 4x4, 7.5
    return Array.from({ length: size.current }, (_, i) => i)
}

function mapRange(
    value: number,
    { iMin: inputMin, iMax: inputMax }: { iMin: number; iMax: number },
    { oMin: outputMin, oMax: outputMax }: { oMin: number; oMax: number },
    clamp = false
) {
    /** @link https://openframeworks.cc/documentation/math/ofMath/#show_ofMap */
    if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
        return outputMin
    } else {
        let outVal =
            ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
            outputMin
        if (clamp) {
            if (outputMax < outputMin) {
                if (outVal < outputMax) outVal = outputMax
                else if (outVal > outputMin) outVal = outputMin
            } else {
                if (outVal > outputMax) outVal = outputMax
                else if (outVal < outputMin) outVal = outputMin
            }
        }
        return outVal
    }
}

async function createAudio() {
    let baseUrl = 'https://ph4un00b.github.io/data'

    audioContext = new AudioContext({ sampleRate: 44100 })
    const response = await fetch(`${baseUrl}/casa/source.mus`)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    console.log('create audio')
    // Drums = document.createElement("audio");
    // Drums.src = `${baseUrl}/casa/source.mus`;
    // audioContext = new AudioContext({ sampleRate: 44100 });

    sourceNode = audioContext.createBufferSource()
    // @ts-ignore
    sourceNode.buffer = audioBuffer
    sourceNode.connect(audioContext.destination)
    // sampleSource.start(0);

    // sourceNode = audioContext.createMediaElementSource(Drums);
    // sourceNode.connect(audioContext.destination);

    soundAnalyzer = audioContext.createAnalyser()
    soundAnalyzer.fftSize = 256
    soundAnalyzer.smoothingTimeConstant = 0.8
    sourceNode.connect(soundAnalyzer)

    audioData = new Uint8Array(soundAnalyzer.frequencyBinCount)
}

// function createSimpleAudio(track: string) {
//     const audio = document.createElement('audio')
//     audio.src = `audio/${track}`
//     audioContext = new AudioContext()

//     sourceNode = audioContext.createMediaElementSource(audio)
//     sourceNode.connect(audioContext.destination)

//     return audio
// }

/** @link https://abarrafato.medium.com/building-a-real-time-spectrum-analyzer-plot-using-html5-canvas-web-audio-api-react-46a495a06cbf */
function frequencyToXAxis(frequency: number) {
    const minF = Math.log(20) / Math.log(10)
    const maxF = Math.log(20000) / Math.log(10)

    let range = maxF - minF
    let xAxis = ((Math.log(frequency) / Math.log(10) - minF) / range) * 945
    return xAxis
}
function createSquareGeometry({
    size = 30,
}: {
    size?: number
}): T.BufferGeometry | number[] {
    const i /** unit */ = 30 / size
    const points = [
        ...[0, 0, 0],
        ...[0, i, 0],
        ...[0, i, 0],
        ...[i, i, 0],
        ...[i, i, 0],
        ...[i, 0, 0],
        ...[i, 0, 0],
        ...[0, 0, 0],
    ]

    return points
}
