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
import { useSceneMotions } from './flor.effects'

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

    const group = R.useRef<T.Group>(null!)
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

    useSceneMotions(
        geometry,
        points,
        shader,
        Lset,
        bigSize,
        tier,
        smallSize,
        group
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

