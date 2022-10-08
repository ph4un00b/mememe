import dynamic from 'next/dynamic'
import FlorScene from '@/components/pages/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'
import * as X from 'next-axiom'
import { Leva } from 'leva'
import { FlorTop, Instructions } from '@/components/dom/Instructions'
import * as hooks from '@/utils/hooks'
import * as R from 'react'
import * as browser from '@/utils/browser'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'
import florecerData from '../music/florecer.json'
import { useDebugBeats, useDebugParticles } from '@/helpers/store'

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
        onend: () => console.log('sound has ended!'),
    })

    hooks.useTimeout(() => {
        console.log('out?')
        if (browser.isMobile()) X.log.debug('📲', { sopa: 'mobile' })
        if (browser.isMobile()) return
        setCollapsed(!true)
    }, 3210)

    // if (!ready && !loading) return <div>No audio to play</div>
    // if (loading) return <div>Loading audio</div>

    const [dbeats] = useDebugBeats()
    const [dparticles] = useDebugParticles()
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
                    onClick={() => {
                        X.log.debug('🌸', { sopa: 'toggle 🎼' })
                        togglePlayPause()
                    }}
                    className='cyberpunk'
                >
                    {!ready && !loading ? 'Loading' : 'Play'}
                </button>
                <br />
                <span>
                    beats: {dbeats}
                </span>
                <br />
                <span>
                    particles: {dparticles}
                </span>
            </div>
            <Leva
                collapsed={{
                    collapsed,
                    onChange(c) { },
                }}
                hidden={true}
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
                manual={false} //todo: how this affect? se pierde la relacion cuadrada
                makeDefault={true}
            />

            <FlorScene />
            {/* <axesHelper args={[8]} /> */}
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
