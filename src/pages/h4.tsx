import dynamic from 'next/dynamic'
import { Fondo } from '@/components/scenes/Home/Fondo'
import { Phau } from '@/components/scenes/Home/Phau'
import * as meta from '@/config'
import hausData from '../music/haus.json'
import * as X from 'next-axiom'
import * as R from 'react'
import { useAudioPlayer, useAudioPosition } from 'react-use-audio-player'

let baseUrl = 'https://ph4un00b.github.io/data'

const Page = (props) => {
    const [ended, setEnd] = R.useState(false)


    const { togglePlayPause: t4, ready: r4, loading: l4 } = useAudioPlayer({
        src: `${baseUrl}/casa/source.mus`,
        format: 'mp3',
        autoplay: false,
        html5: true,
        onend: () => {
            setEnd(true)
            X.log.debug('🏡', { ended: true, sopa: 'termino 🎊💃' })
        }
    })

    return (
        <>
            <button
                className='cyberpunk'
                onTouchStart={() => {
                    X.log.debug('🏡', { sopa: 'toggle musique 🎼' })
                    t4()
                }}
                onMouseUp={() => {
                    X.log.debug('🏡', { sopa: 'toggle musique 🎼' })
                    t4()
                }}
            >
                {!r4 && !l4 ? 'Loading4' : 'Play4'}
            </button>
            <Debug />
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

function Debug() {
    // const [, changePosition] = useSongPosition()
    const { percentComplete, duration, seek } = useAudioPosition({
        highRefreshRate: true,
    })

    return (
        <>
            {hausData.sections.map((section, idx) => {
                return (
                    <button
                        onClick={() => {
                            seek(section.start)
                            // changePosition(section.start)
                        }}
                        className='sections'
                        key={idx}
                    >
                        {idx} - {section.confidence}
                    </button>
                )
            })}
            {hausData.bars.map((bar, idx) => {
                return (
                    <button
                        onClick={() => {
                            seek(bar.start)
                            // changePosition(section.start)
                        }}
                        className='bars'
                        key={idx}
                    >
                        {idx} - {bar.confidence}
                    </button>
                )
            })}
        </>
    )
}