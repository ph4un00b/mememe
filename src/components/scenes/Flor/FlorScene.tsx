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

    useMotions(adjustedParticles, Lset, points)

    return (
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
    )
}

