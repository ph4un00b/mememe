import dynamic from 'next/dynamic'
import FlorScene from '@/components/scenes/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera, useDetectGPU } from '@react-three/drei'
import * as X from 'next-axiom'
import { Leva } from 'leva'
import * as hooks from '@/utils/hooks'
import * as R from 'react'
import * as browser from '@/utils/browser'
import {
    AudioPlayerControls,
    useAudioPlayer,
    useAudioPosition,
} from 'react-use-audio-player'
import {
    useDebugBeats,
    useDebugParticles,
    useDebugSections,
    useDebugSegments,
    useFPS,
    useSongPosition,
} from '@/helpers/store'
import { IfFeatureEnabled } from '@growthbook/growthbook-react'
import florecerData from '../music/florecer.json'
import * as D from '@react-three/drei'
import { Text } from '@react-three/drei'
// const Box = dynamic(() => import('@/components/canvas/Box'), {
//     ssr: false,
// })
let baseUrl = 'https://ph4un00b.github.io/data'

function Page(props) {
    const [collapsed, setCollapsed] = R.useState(true)

    const { togglePlayPause, ready, loading, playing } = useAudioPlayer({
        src: `${baseUrl}/florecer/source.mus`,
        format: 'mp3',
        autoplay: false,
        html5: false,
        onend: () => X.log.debug('🌸', { sopa: '🎊💃' }),
        // onseek: (e) => {
        //     console.log('cambiar!!')

        // }
    })

    hooks.useTimeout(() => {
        if (browser.isMobile()) X.log.debug('📲', { sopa: 'mobile' })
        if (browser.isMobile()) return
        setCollapsed(!true)
    }, 3210)

    return (
        <>
            <div
                // eslint-disable-next-line tailwind/class-order
                className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl select-none md:text-base top-8 left-1/2 text-gray-50'
                style={{
                    maxWidth: 'calc(100% - 28px)',
                }}
            >
                <button
                    className='cyberpunk'
                    onClick={() => {
                        X.log.debug('🌸', { sopa: 'toggle musique 🎼' })
                        togglePlayPause()
                    }}
                >
                    {!ready && !loading ? 'Loading' : 'Play'}
                </button>

                <IfFeatureEnabled feature='florecer-debug'>
                    <Debug />
                </IfFeatureEnabled>
            </div>
            <Leva
                // collapsed={{
                //     collapsed: false,
                //     onChange(c) { },
                // }}
                hidden={!true}
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

function LoadFlorecer() {
    const { device, fps, gpu, isMobile, tier, type } = D.useDetectGPU()

    if (browser.isIpod() || tier == 2) {
        return <FlorScene tier={'mid'} maxParticles={15_000} smallParticles={10_000} smallSize={0.25} bigSize={0.30} />
    } else if (tier == 3) {
        return <FlorScene tier={'high'} maxParticles={70_000} smallParticles={70_000} smallSize={0.25} bigSize={0.40} />
    } else if (tier < 2) {
        return <FlorScene tier={'low'} maxParticles={2_500} smallParticles={2_000} smallSize={0.35} bigSize={0.65} />
    }
}

function Debug() {
    const [, changePosition] = useSongPosition()
    const { percentComplete, duration, seek } = useAudioPosition({
        highRefreshRate: true,
    })

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
            {/* <br />
                    <span>segments: {dsegments}</span> */}
            <br />
            <span>sections: {dsection}</span>
            <br />
            {florecerData.sections.map((section, idx) => {
                return (
                    <button
                        onClick={() => {
                            seek(section.start)
                            changePosition(section.start)
                        }}
                        className='cyberpunk'
                        key={idx}
                    >
                        {idx} - {section.confidence}
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
