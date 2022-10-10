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

    F.useFrame((state) => {
        if (!(position > 0) /** started */) {
            return
        }


        // camera.position.x = Math.sin(
        //     camera.position.x + state.clock.elapsedTime * 0.1
        // )
    })

    // useMotions(
    //     { type: 'beats' },
    //     function leavingCallback({ next }) {
    //         const newParticles = 1 * adjustedParticles.current
    //         // changeDebugParticles(newParticles)
    //         changeDebugBeats(camera.position.z)
    //         // Lset({ particles: newParticles })
    //         // Lset({ leverCrazy: 2 * 0.45 + Math.random() })
    //     },
    //     function enterCallback({ chunk, current }) {
    //         console.log('frame', current)
    //         if (chunk.confidence >= 0.4) {
    //             // const newParticles = Math.floor(
    //             //     Math.random() * 0.2 * adjustedParticles.current
    //             // )

    //             // changeDebugParticles(newParticles)
    //             // Lset({ particles: newParticles })
    //             // Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
    //         }

    //         if (chunk.confidence < 0.4) {
    //             // points.current.rotateX(0.5)
    //             // points.current.rotateY(0.5)
    //         }
    //     },
    //     function frameCallback({ chunk, state, current }) {
    //         if (chunk.confidence < 0.4) {
    //             // camera.rotateZ(state.clock.elapsedTime * 0.5)
    //         }
    //     }
    // )

    useMotions(
        { type: 'sections' },
        function leavingCallback({ next, current }) {
            console.log('leavingCallback', current)
        },
        function enterCallback({ chunk, state, current }) {

            console.log('enterCallback', current)

        },
        function frameCallback({ chunk, state, current }) {
            const [index] = current
            changeDebugBeats(camera.position.z)

            // wtf nice ( •_•)>⌐■-■
            camera.position.z = Math.cos(
                // camera.position.z + state.clock.elapsedTime * 0.1
                camera.position.z + state.clock.elapsedTime * index
            )
            // console.log('frameCallback', current)
        }
    )

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
