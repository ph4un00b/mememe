import * as R from 'react'
import * as T from 'three'
import * as L from 'leva'
import * as F from '@react-three/fiber'
import { createColorsArray, useColoritos } from '@/utils/coloritos'
// @ts-ignore
import vertexShader from './flor.vertex.glsl'
import { fragmentShader } from './flor.frag'
import { florAttributes } from './flor.attr'
import { useMotions } from './flor.motion'
import {
    useDebugBeats,
    useDebugParticles,
    useTriggerChangeColor,
} from '@/helpers/store'
import { useAudioPosition } from 'react-use-audio-player'
import { useInterval } from '@/utils/hooks'

export default function FlorScene({
    maxParticles,
    smallParticles,
    smallSize,
    bigSize,
    tier,
}: {
    maxParticles: number
    smallParticles: number
    smallSize: number
    bigSize: number
    tier: 'low' | 'mid' | 'high'
}) {
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
            // rotateZ,
            // rotateX,
            // rotateY
        },
        Lset,
    ] = L.useControls(() => ({
        leverA: {
            value: bigSize,
            min: 0,
            max: bigSize,
            step: 0.01,
        },
        offset: { value: 0.0, min: 0, max: 1, step: 0.01 },
        leverC: { value: 1, min: 1, max: 20, step: 1 },
        leverD: { value: 2, min: 1, max: 20, step: 1 },
        leverE: { value: 1.68, min: 0, max: 2, step: 0.001 },
        leverCrazy: { value: 0.45, min: 0.01, max: 0.7, step: 0.01 },
        leverR: { value: 2.0, min: 0, max: 2, step: 0.001 },
        leverR2: { value: 10, min: 1, max: 10, strep: 0.001 },
        // rotateZ: { value: 0, min: -0.5, max: 0.5, strep: 0.001 },
        // rotateX: { value: 0, min: -0.5, max: 0.5, strep: 0.001 },
        // rotateY: { value: 0, min: -0.5, max: 0.5, strep: 0.001 },
        particles: {
            value: maxParticles,
            min: 0,
            max: maxParticles,
        },
    }))

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

    // const [[, niceColors]] = useColoritos({ quantity: 2 })
    const [niceColors, setColors] = R.useState(['#bb0000', '#00ff00'])

    // useInterval(() => {
    //     // console.log(niceColors)
    //     setColors(createColorsArray(2, Math.floor(Math.random() * 800)))
    // }, 1000)

    const [colorChangeRequested] = useTriggerChangeColor()
    R.useLayoutEffect(() => {
        setColors(createColorsArray(2, Math.floor(Math.random() * 800)))
    }, [colorChangeRequested])

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
    }, [
        particles,
        offset,
        leverC,
        leverCrazy,
        leverD,
        leverE,
        leverR,
        leverR2,
        colorChangeRequested,
    ])

    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()

    const { camera } = F.useThree()

    const { position, percentComplete } = useAudioPosition({
        highRefreshRate: true,
    })

    F.useFrame(({ clock }) => {
        const time = clock.getElapsedTime()
        geometry.current.attributes.position.needsUpdate = true
        geometry.current.attributes.color.needsUpdate = true
        points.current.rotation.y = time * 0.2
        shader.uniforms.uTime.value = time

        // group.current.rotateX(clock.elapsedTime * rotateX)
        // // efecto mariposa
        // group.current.rotateY(clock.elapsedTime * rotateY)
        // group.current.rotateZ(clock.elapsedTime * rotateZ)

        // camera.rotateZ(clock.elapsedTime * rotateZ)
        // camera.rotateX(clock.elapsedTime * rotateX)
        // camera.rotateY(clock.elapsedTime * rotateY)

        // camera.translateX(rotateX)
        // // Y effect
        // camera.translateY(rotateY)
        // // soft acercarse effect
        // camera.translateZ(rotateZ)

        // // distorsion
        // group.current.translateX(rotateX)
        // // Y effect
        // group.current.translateY(rotateY)
        // // distorsion
        // group.current.translateZ(rotateZ)

        // distorsion
        // points.current.rotateX(rotateX)
        // points.current.rotateY(rotateY)
        // points.current.rotateZ(rotateZ)

        // points.current.translateX(rotateX)
        // points.current.translateY(rotateY)
        // // cool effect
        // points.current.translateZ(rotateZ)
    })

    const currentSection = R.useRef(0)

    F.useFrame(({ clock }) => {
        if (percentComplete >= 100) return
        // camera.position.z = Math.cos(
        //     // despues incrementar a 1
        //     camera.position.z + clock.elapsedTime * +2
        // )
        // camera.position.y = Math.sin(
        //     // 1. incrementar a 1
        //     camera.position.x + clock.elapsedTime * -2
        // )

        // [0, 8] [8, 11] -> [1,9] [9, 12] -> [0.1, 2] [2, 0.1]
        if (currentSection.current >= 0 && currentSection.current < 8) {
            // we can precalculate this below if needed
            const val = mapRange(
                currentSection.current,
                { iMin: 0, iMax: 8 },
                {
                    oMin: 0.1,
                    oMax: 0.8,
                }
            )

            camera.position.z = Math.cos(
                // despues incrementar a 1
                camera.position.z + clock.elapsedTime * +val
            )
            camera.position.y = Math.sin(
                // 1. incrementar a 1
                camera.position.x + clock.elapsedTime * -val
            )
        }

        if (currentSection.current >= 8 && currentSection.current < 11) {
            // we can precalculate this below if needed
            const val =
                1.5 -
                mapRange(
                    currentSection.current,
                    { iMin: 8, iMax: 11 },
                    {
                        oMin: 0.1,
                        oMax: 1.5,
                    }
                )

            camera.position.z = Math.cos(
                // despues incrementar a 1
                camera.position.z + clock.elapsedTime * +val
            )
            camera.position.y = Math.sin(
                // 1. incrementar a 1
                camera.position.x + clock.elapsedTime * +val
            )
        }
    })

    F.useFrame(({ clock }) => {
        if (percentComplete >= 100) return
        camera.rotateZ(clock.elapsedTime * 0.1)
    })

    useMotions(
        { type: 'beats' },
        function leavingCallback({ next }) {
            // changeDebugBeats(camera.position.z)
            // Lset({ particles: newParticles })
            Lset({ leverA: bigSize })

            if (tier == 'low') {
                Lset({ leverCrazy: 0.3 })
            } else {
                Lset({ leverCrazy: 0.5 * 0.45 + Math.random() })
            }
        },
        function enterCallback({ chunk, current }) {
            if (chunk.confidence >= 0.4) {
                // changeDebugParticles(newParticles)
                // Lset({ particles: adjustedParticles.current })
                Lset({ leverA: smallSize })

                if (tier == 'low') {
                    Lset({ leverCrazy: 0.2 })
                } else if (tier == 'mid') {
                    Lset({ leverCrazy: 0.25 })
                } else {
                    Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
                }
            }

            if (currentSection.current == 8) {
                // try group
                if (chunk.confidence < 0.4) {
                    Lset({ leverD: Math.floor(1 + Math.random() * 8) })
                    //     camera.rotateZ(state.clock.elapsedTime * 0.1)
                }
            }
        },
        function frameCallback({ chunk, state, current }) { }
    )

    const group = R.useRef<T.Group>(null!)
    useMotions(
        { type: 'sections' },
        function beforeLeaveCallback({ next, current }) { },
        function enterCallback({ chunk, state, current }) { },
        function frameCallback({ chunk, state, current, event }) {
            const [index] = current

            if (index >= 0 && index < 8 && event == 'entering') {
                const velocity = mapRange(
                    index,
                    { iMin: 0, iMax: 7 },
                    {
                        oMin: 0.1,
                        oMax: 0.6,
                    }
                )

                Lset({ leverD: index + 1 })
            }

            if (index >= 0 && index < 8 && event == 'leaving') {
                const velocity = mapRange(
                    index,
                    { iMin: 0, iMax: 7 },
                    {
                        oMin: 0.1,
                        oMax: 0.6,
                    }
                )
            }

            if (index == 8 && event == 'entering') {
                currentSection.current = 8
                group.current.rotateX(state.clock.elapsedTime * 0.00007)
            }

            // console.log(group.current.set)
            // if (index == 9 && event == 'leaving') {
            //     console.log('acercarse')
            //     /** acercarse come back*/
            //     camera.position.z = camera.position.z + (state.clock.elapsedTime * 0.046)
            // }

            /** high and bz rebota menos al final
             */

            if (index >= 9 && index < 12 && event == 'entering') {
                group.current.rotation.set(0, 0, 0)

                const velocity =
                    2 - mapRange(index, { iMin: 9, iMax: 12 }, { oMin: 0.1, oMax: 2 })

                Lset({ leverD: index + 5 })
            }

            if (index > 9 && index <= 12 && event == 'leaving') {
                const velocity =
                    2 - mapRange(index, { iMin: 9, iMax: 12 }, { oMin: 0.9, oMax: 2 })
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
