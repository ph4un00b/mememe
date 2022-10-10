import * as R from 'react'
import * as T from 'three'
import * as L from 'leva'
import * as F from '@react-three/fiber'
import { useColoritos } from '@/utils/coloritos'
import * as browser from '@/utils/browser'
import { florControls } from './flor.controls'
// @ts-ignore
import vertexShader from './flor.vertex.glsl'
import { fragmentShader } from './flor.frag'
import { florAttributes } from './flor.attr'
import { useMotions } from './flor.motion'
import { useDebugBeats, useDebugParticles } from '@/helpers/store'
import { useAudioPosition } from 'react-use-audio-player'

export default function FlorScene() {
    let adjustedParticles = R.useRef(browser.isMobile() ? 20_000 : 70_000)
    const geometry = R.useRef<T.BufferGeometry>(null!)
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
    ] = L.useControls(() => florControls(adjustedParticles))

    const { gl, viewport, size } = F.useThree()
    /** @link https://github.com/pmndrs/react-three-fiber/discussions/1012 */
    // gl.getPixelRatio()
    // viewport -> size in three units
    // size -> size in pixels

    const shader = R.useMemo(
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

    R.useLayoutEffect(() => {
        if (points.current) {
            geometry.current.dispose()
            shader.dispose()
            // scene.remove(points.current);
        }
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    const [[, niceColors]] = useColoritos({ quantity: 2 })

    const arrays = R.useMemo(() => {
        return florAttributes(
            particles,
            niceColors,
            leverCrazy,
            leverR,
            leverD,
            leverE,
            leverR2
        )
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    F.useFrame(({ clock }) => {
        const time = clock.getElapsedTime()
        geometry.current.attributes.position.needsUpdate = true
        points.current.rotation.y = time * 0.2
        shader.uniforms.uTime.value = time
    })

    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()

    const { camera } = F.useThree()

    const { position } = useAudioPosition({
        highRefreshRate: true,
    })

    useMotions(
        { type: 'beats' },
        function leavingCallback({ next }) {
            const newParticles = 0.5 * adjustedParticles.current

            // changeDebugBeats(camera.position.z)
            Lset({ particles: newParticles })
            Lset({ leverCrazy: 2 * 0.45 + Math.random() })
        },
        function enterCallback({ chunk, current }) {
            if (chunk.confidence >= 0.4) {

                const newParticles = Math.floor(
                    Math.random() * 0.8 * adjustedParticles.current
                )

                // changeDebugParticles(newParticles)
                Lset({ particles: newParticles })
                Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
            }


        },
        function frameCallback({ chunk, state, current }) {
            if (chunk.confidence < 0.4) {
                points.current.rotateX(0.01)
                points.current.rotateY(0.01)
            }

            if (chunk.confidence < 0.4) {
                camera.rotateZ(state.clock.elapsedTime * 0.01)
            }
        }
    )

    const group = R.useRef(null!)
    useMotions(
        { type: 'sections' },
        function beforeLeaveCallback({ next, current }) {
            console.log('beforeLeaveCallback', current)
        },
        function enterCallback({ chunk, state, current }) {
            console.log('enterCallback', current)
        },
        function frameCallback({ chunk, state, current, event }) {
            const [index] = current
            // changeDebugBeats(camera.position.z)

            if (index == 0 && event == 'entering') {
                console.log(event)
                /** acercarce */
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * 0.05
                )
            }

            if (index == 1 && event == 'leaving') {
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * 0.1
                )
            }

            if (index >= 1 && index < 8 && event == 'entering') {
                const velocity = mapRange(index, { iMin: 0, iMax: 7 }, { oMin: 0.1, oMax: 1 })
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * velocity
                )
                camera.position.x = Math.sin(
                    camera.position.x + state.clock.elapsedTime * +velocity
                )
            }

            if (index >= 1 && index < 8 && event == 'leaving') {
                const velocity = mapRange(index, { iMin: 0, iMax: 7 }, { oMin: 0.1, oMax: 1 })
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * velocity
                )
                camera.position.x = Math.sin(
                    camera.position.x + state.clock.elapsedTime * -velocity
                )
            }

            if (index == 8 && event == 'entering') {
                // console.log('alejarse')
                group.current.rotateX(state.clock.elapsedTime * 0.0001)
                camera.rotateZ(state.clock.elapsedTime * 0.5)
            }
            // if (index == 9 && event == 'leaving') {
            //     console.log('acercarse')
            //     /** acercarse come back*/
            //     camera.position.z = camera.position.z + (state.clock.elapsedTime * 0.046)
            // }

            /** high and bz rebota menos al final
             */

            if (index >= 9 && index < 12 && event == 'entering') {
                const velocity = 2 - mapRange(index, { iMin: 9, iMax: 12 }, { oMin: 0.1, oMax: 2 })
                // changeDebugBeats(velocity)
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * velocity
                )
                // camera.position.x = Math.sin(
                //     camera.position.x + state.clock.elapsedTime * +velocity
                // )
            }

            if (index > 9 && index <= 12 && event == 'leaving') {
                const velocity = 2 - mapRange(index, { iMin: 9, iMax: 12 }, { oMin: 0.9, oMax: 2 })
                // changeDebugBeats(velocity)
                camera.position.z = Math.cos(
                    camera.position.z + state.clock.elapsedTime * velocity
                )
                // camera.position.x = Math.sin(
                //     camera.position.x + state.clock.elapsedTime * -velocity
                // )
            }
        }
    )

    return (
        <group ref={group}>
            <points
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                ref={points}
                // castShadow={true}
                material={shader}
            >
                <bufferGeometry ref={geometry}>
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
        </group>
    )
}

function mapRange(
    value: number,
    { iMin: inputMin, iMax: inputMax }: { iMin: number; iMax: number },
    { oMin: outputMin, oMax: outputMax }: { oMin: number; oMax: number },
    clamp = false,
) {
    /** @link https://openframeworks.cc/documentation/math/ofMath/#show_ofMap */
    if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
        return outputMin;
    } else {
        let outVal =
            ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
            outputMin;
        if (clamp) {
            if (outputMax < outputMin) {
                if (outVal < outputMax) outVal = outputMax;
                else if (outVal > outputMin) outVal = outputMin;
            } else {
                if (outVal > outputMax) outVal = outputMax;
                else if (outVal < outputMin) outVal = outputMin;
            }
        }
        return outVal;
    }
}