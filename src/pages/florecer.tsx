/* eslint-disable no-console */
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
    useAudioStatus,
    useDebugBeats,
    useDebugParticles,
    useDebugSections,
    useGlobalColors,
    useSeekPosition,
    useSongPosition,
    useTriggerChangeColor,
} from '@/helpers/store'
import { IfFeatureEnabled } from '@growthbook/growthbook-react'
import florecerData from '../music/florecer.json'
import * as D from '@react-three/drei'
import {
    MediaControlBar,
    MediaController,
    MediaFullscreenButton,
    MediaLoadingIndicator,
    MediaMuteButton,
    MediaPlaybackRateButton,
    MediaPlayButton,
    MediaTimeDisplay,
    MediaTimeRange,
    MediaVolumeRange,
} from 'media-chrome/dist/react'
// const Box = dynamic(() => import('@/components/canvas/Box'), {
//     ssr: false,
// })

let baseUrl = 'https://ph4un00b.github.io/data'

function Page(props) {
    const [collapsed, setCollapsed] = R.useState(true)
    const [ended, setEnd] = R.useState(false)

    hooks.useTimeout(() => {
        if (browser.isMobile()) X.log.debug('🌸', { sopa: 'mobile' })
        if (browser.isMobile()) return
        setCollapsed(!true)
    }, 3210)

    const [, triggerColorChange] = useTriggerChangeColor()
    const [florColor] = useGlobalColors()
    const sound = R.useRef<HTMLAudioElement>(null!)
    const started = R.useRef(false)
    const [, setSongPosition] = useSongPosition()
    const [, setPlaying] = useAudioStatus()

    useAudioHooks(sound, {
        onended: () => {
            setEnd(true)
            X.log.debug('🌸', { ended: true, sopa: 'termino 🎊💃' })
            setPlaying(false)
        },
        onpause: () => {
            started.current = false
            X.log.debug('🌸', { sopa: 'pause musique 🎼' })
            setPlaying(false)
        },
        onplay: () => {
            started.current = true
            X.log.debug('🌸', { sopa: 'play musique 🎼' })
            setPlaying(true)
        },
        onchanged: (e) => {
            // console.log(sound.current.currentTime)
            // console.log(e.timeStamp)
            setSongPosition(sound.current.currentTime)
        },
    })

    return (
        <>
            <div
                // eslint-disable-next-line tailwind/class-order
                className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl select-none md:text-base top-8 left-1/2 text-gray-50'
                style={{
                    maxWidth: 'calc(100% - 28px)',
                }}
            >
                <IfFeatureEnabled feature='florecer-debug'>
                    <Debug sound={sound} />
                </IfFeatureEnabled>
            </div>

            <div
                // eslint-disable-next-line tailwind/class-order
                className='absolute px-0 pb-[1px] text-sm transform -translate-x-1/2 shadow-xl select-none bottom-2 md:text-base left-1/2 text-gray-50'
                style={{
                    maxWidth: 'calc(100% - 28px)',
                    background: `-webkit-linear-gradient(180deg, ${florColor[0]}, ${florColor[1]})`,
                }}
            >
                <div className='flex flex-row justify-center bg-black'>
                    {/* hola */}
                    <MediaPlayer
                        colorButton={
                            <button
                                onClick={() => {
                                    X.log.debug('🌸', { sopa: 'change color 🌈' })
                                    triggerColorChange()
                                }}
                            >
                                Color
                            </button>
                        }
                    >
                        <audio
                            slot='media'
                            ref={sound}
                            loop={false}
                            preload='auto'
                        // style={{ display: 'none' }}
                        >
                            {/* <source src='music/nat2.mp3' type='audio/mpeg' /> */}
                            <source
                                src={`${baseUrl}/florecer/source.mus`}
                                type='audio/mpeg'
                            />
                        </audio>
                    </MediaPlayer>
                    <br />
                </div>
                {/* <span >{florColor[0]}</span> */}
            </div>

            <Leva
                // collapsed={{
                //     collapsed: false,
                //     onChange(c) { },
                // }}
                hidden={ended}
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

function useAudioHooks(
    sound: R.MutableRefObject<HTMLAudioElement>,
    {
        onended,
        onpause,
        onplay,
        onchanged,
    }: {
        onended: (e) => void
        onpause: (e) => void
        onplay: (e) => void
        onchanged: (e) => void
    }
) {
    /**
     * @link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
     */
    hooks.useAudioListener(
        'canplay',
        (e) => {
            console.log('canplay', e)
        },
        sound
    )

    hooks.useAudioListener(
        'play',
        (e) => {
            // console.log('play', e)
            onplay(e)
        },
        sound
    )

    hooks.useAudioListener(
        'ended',
        (e) => {
            // console.log('ended', e)
            onended(e)
        },
        sound
    )

    hooks.useAudioListener(
        'durationchange',
        (e) => {
            console.log('durationchange', e)
        },
        sound
    )

    hooks.useAudioListener(
        'emptied',
        (e) => {
            console.log('emptied', e)
        },
        sound
    )
    hooks.useAudioListener(
        'pause',
        (e) => {
            // console.log('pause', e)
            onpause(e)
        },
        sound
    )
    hooks.useAudioListener(
        'playing',
        (e) => {
            console.log('playing', e)
        },
        sound
    )
    hooks.useAudioListener(
        'error',
        (e) => {
            console.log('error', e)
        },
        sound
    )
    hooks.useAudioListener(
        'ratechange',
        (e) => {
            console.log('ratechange', e)
        },
        sound
    )
    hooks.useAudioListener(
        'seeked',
        (e) => {
            console.log('seeked', e)
        },
        sound
    )
    hooks.useAudioListener(
        'seeking',
        (e) => {
            console.log('seeking', e)
        },
        sound
    )
    hooks.useAudioListener(
        'suspend',
        (e) => {
            console.log('suspend', e)
        },
        sound
    )
    hooks.useAudioListener(
        'timeupdate',
        (e) => {
            // updates alot!
            onchanged(e)
            // console.log('timeupdate', e)
        },
        sound
    )
    hooks.useAudioListener(
        'volumechange',
        (e) => {
            // updates alot!
        },
        sound
    )
    hooks.useAudioListener(
        'waiting',
        (e) => {
            // updates alot!
        },
        sound
    )
}

function LoadFlorecer() {
    const { device, fps, gpu, isMobile, tier, type } = D.useDetectGPU()

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

function MediaPlayer({ children, colorButton }) {
    /*
               * maybe ping mux? as showcase?
              /*
               * maybe ping r3f? as showcase?
               */
    return (
        <>
            <MediaController
                MediaController
                audio
                // @link https://media-chrome-docs.vercel.app/en/styling
                style={{
                    '--media-control-background': 'rgba(0,0,0,0.5)',
                }}
            >
                {children}
                {/* <audio
                                        slot='media'
                                        src='https://stream.mux.com/O4h5z00885HEucNNa1rV02wZapcGp01FXXoJd35AHmGX7g/audio.m4a'
                                    /> */}
                <MediaControlBar>
                    {/* <MediaLoadingIndicator /> */}
                    {/* @link https://media-chrome-docs.vercel.app/en/keyboard-shortcuts
           * preventing seek
           */}
                    <MediaPlayButton keysused={'Space'} />
                    <MediaTimeDisplay show-duration={false} />
                    {/* <MediaTimeRange /> */}
                    {/* <MediaPlaybackRateButton /> */}
                    <MediaMuteButton />
                    <MediaVolumeRange />
                    {/*
           * media-only <MediaFullscreenButton />
           * //todo: we should offer a fullscren option for the whole visual
           */}
                    {/* <MediaFullscreenButton /> */}
                </MediaControlBar>
            </MediaController>

            {colorButton}
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
