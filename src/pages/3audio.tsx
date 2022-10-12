import dynamic from 'next/dynamic'
import { Fondo } from '@/components/scenes/Home/Fondo'
import { Phau } from '@/components/scenes/Home/Phau'
import * as meta from '@/config'
import hausData from '../music/haus.json'
import * as X from 'next-axiom'
import * as R from 'react'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'
import { AudioLoader, PositionalAudio } from 'three'
import { useLoader } from '@react-three/fiber'

let baseUrl = 'https://ph4un00b.github.io/data'

const Page = (props) => {
    const [ended, setEnd] = R.useState(false)

    const sound = R.useRef<HTMLAudioElement>(null!)
    const started = R.useRef(false)
    // const buffer = useLoader(AudioLoader, "/music/nat2.mp3")

    return (
        <>
            <audio ref={sound} loop id="music" preload="auto" style={{ display: 'none' }}>
                <source src="music/nat2.mp3" type="audio/mpeg" />
            </audio>

            <br />
            <button className='cyberpunk'
                onClick={() => {
                    if (!started.current) {
                        started.current = true
                        X.log.debug('🏡', { sopa: 'play musique 🎼' })
                        sound.current.play()
                    } else {
                        started.current = false
                        X.log.debug('🏡', { sopa: 'pause musique 🎼' })
                        sound.current.pause()
                    }
                }}
            >
                Play!
            </button>

            <Debug sound={sound} />
        </>
    )
}

Page.r3f = (props) => (
    <>
        <Phau />
        <Fondo />
        <axesHelper scale={4} />
    </>
)

export default Page

export async function getStaticProps() {
    return {
        props: {
            title: `🏡 - ${meta.titleDefault}`
        },
    }
}

function Debug({ sound }: { sound: R.MutableRefObject<HTMLAudioElement> }) {
    // const [, changePosition] = useSongPosition()
    // const {percentComplete, duration, seek} = useAudioPosition({
    //     highRefreshRate: true,
    // })

    return (
        <>
            {hausData.sections.map((section, idx) => {
                return (
                    <button
                        onClick={() => {
                            // seek(section.start)
                            // changePosition(section.start)

                            sound.current.currentTime = section.start
                        }}
                        className='sections'
                        key={idx}
                    >
                        {idx} - {section.start.toFixed(2)}
                    </button>
                )
            })}
            {hausData.bars.map((bar, idx) => {
                return (
                    <button
                        onClick={() => {
                            // seek(bar.start)
                            // changePosition(section.start)
                            sound.current.currentTime = bar.start
                        }}
                        className='bars'
                        key={idx}
                    >
                        {idx} - {bar.start.toFixed(2)}
                    </button>
                )
            })}
        </>
    )
}

// useLoader.preload(AudioLoader, "/music/nat2.mp3")