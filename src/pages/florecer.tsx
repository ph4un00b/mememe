import dynamic from 'next/dynamic'
import FlorScene from '@/components/scenes/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'
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
import { getGPUTier } from 'detect-gpu';

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

    // if (!ready && !loading) return <div>No audio to play</div>
    // if (loading) return <div>Loading audio</div>

    const [fps, setFPS] = useFPS()
    R.useEffect(() => {
        let gpuTier
        (async () => {
            gpuTier = await getGPUTier();
            // console.log(gpuTier)

            // Example output:
            // {
            //   "tier": 1,
            //   "isMobile": false,
            //   "type": "BENCHMARK",
            //   "fps": 21,
            //   "gpu": "intel iris graphics 6100"
            // }

            const pixels =
                'devicePixelRatio' in window
                    ? window.devicePixelRatio * window.innerHeight * window.innerWidth
                    : 1 * window.innerHeight * window.innerWidth

            if ('devicePixelRatio' in window) {
                X.log.debug('🌸', {
                    sopa: '🖥',
                    gpu: gpuTier,
                    pixels,
                    pixelRation: window.devicePixelRatio,
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                })
            }
            setFPS(gpuTier.fps)
        })();


    }, [])

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
                    {' - '}
                    {fps}
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

            <FlorScene />
            {/* <axesHelper args={[8]} /> */}
        </>
    )
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
