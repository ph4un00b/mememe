/* eslint-disable no-console */
import * as D from '@react-three/drei'
import * as F from '@react-three/fiber'
import * as R from 'react'
import * as X from 'next-axiom'
import dynamic from 'next/dynamic'
import FlorScene from '@/components/scenes/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva'
import * as hooks from '@/utils/hooks'
import * as browser from '@/utils/browser'
import {
    useAudioStatus,
    useDebugBeats,
    useDebugParticles,
    useDebugSections,
    useGlobalColors,
    useMediaPlayer,
    usePlayerPortals,
    useSeekPosition,
    useSongPosition,
    useTriggerChangeColor,
} from '@/helpers/store'
import { IfFeatureEnabled } from '@growthbook/growthbook-react'
import florecerData from '../music/florecer.json'
import { baseUrl } from '@/utils/external'
import ReactDOM from 'react-dom'

// const Box = dynamic(() => import('@/components/canvas/Box'), {
//     ssr: false,
// })

const isSSR = typeof window === 'undefined'
function Page(props) {
    const [collapsed, setCollapsed] = R.useState(true)

    hooks.useTimeout(() => {
        if (browser.isMobile()) X.log.debug('🌸', { sopa: 'mobile' })
        if (browser.isMobile()) return
        setCollapsed(!true)
    }, 3210)

    const [, changeTrack] = useMediaPlayer()

    R.useLayoutEffect(() => {
        changeTrack(`${baseUrl}/florecer/source.mus`)
    }, [])

    const [portalOut] = usePlayerPortals()

    return (
        <>
            <ColorPortalIn portalOut={portalOut} />
            <IfFeatureEnabled feature='florecer-debug'>
                <div
                    // eslint-disable-next-line tailwind/class-order
                    className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl select-none md:text-base top-8 left-1/2 text-gray-50'
                    style={{
                        maxWidth: 'calc(100% - 28px)',
                    }}
                >
                    {/* <Debug sound={sound} /> */}
                </div>
            </IfFeatureEnabled>

            <Leva
                // collapsed={{
                //     collapsed: false,
                //     onChange(c) { },
                // }}
                // todo: gloabl ended track
                hidden={!false}
            />
        </>
    )
}

Page.r3f = function (props) {
    return (
        <>
            <color attach='background' args={['#000']} />
            <PerspectiveCamera
                position={[0, 0, 1]}
                fov={75}
                // auto updates the viewport
                manual={false} //todo: how this boolean affect? parece que se pierde la relacion cuadrada
                makeDefault={true}
            />

            <LoadFlorecer />
            {/* <axesHelper args={[8]} /> */}
        </>
    )
}

function ColorPortalIn({ portalOut }) {
    const [, triggerColorChange] = useTriggerChangeColor()

    const jsx = (
        <>
            <button
                className='pr-2'
                onClick={() => {
                    X.log.debug('🌸', { sopa: 'change color 🌈' })
                    triggerColorChange()
                }}
            >
                change color
            </button>
        </>
    )
    if (!portalOut) return <></>

    return ReactDOM.createPortal(jsx, portalOut)
}

function LoadFlorecer() {
    const { gl } = F.useThree()
    const { device, fps, gpu, isMobile, tier, type } = D.useDetectGPU({
        benchmarksURL: './benchmarks',
        glContext: gl.getContext(),
    })

    R.useEffect(() => {
        X.log.debug('🌸', {
            device,
            fps,
            gpu,
            isMobile,
            tier,
            type,
            ipod: browser.isIpod(),
        })
    }, [])

    if (browser.isIpod() || tier == 2) {
        return (
            <FlorScene
                tier={'mid'}
                maxParticles={15_000}
                smallParticles={10_000}
                smallSize={0.25}
                bigSize={0.3}
            />
        )
    } else if (tier == 3) {
        return (
            <FlorScene
                tier={'high'}
                maxParticles={70_000}
                smallParticles={70_000}
                smallSize={0.25}
                bigSize={0.4}
            />
        )
    } else if (tier < 2) {
        return (
            <FlorScene
                tier={'low'}
                maxParticles={2_500}
                smallParticles={2_000}
                smallSize={0.35}
                bigSize={0.65}
            />
        )
    }
}

function Debug({ sound }: { sound: R.MutableRefObject<HTMLAudioElement> }) {
    // const [, changePosition] = useSongPosition()
    const [, seekPosition] = useSeekPosition()

    const [dbeats] = useDebugBeats()
    const [dparticles] = useDebugParticles()
    // const [dsegments] = useDebugSegments()
    const [dsection] = useDebugSections()

    return (
        <>
            <br />
            <span>beats: {dbeats}</span>
            <br />
            <span>particles: {dparticles}</span>
            <br />
            <span>sections: {dsection}</span>
            <br />
            {florecerData.sections.map((section, idx) => {
                return (
                    <button
                        onClick={() => {
                            seekPosition(section.start)
                            sound.current.currentTime = section.start
                        }}
                        className='cyberpunk'
                        key={idx}
                    >
                        {idx} - {section.start.toFixed(2)}
                    </button>
                )
            })}
        </>
    )
}

export default Page

export async function getStaticProps() {
    return {
        props: {
            title: `Florecer 🌺 GLSL - ${meta.titleDefault}`,
        },
    }
}
