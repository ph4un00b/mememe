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

    const { togglePlayPause: t3, ready: r3, loading: l3 } = useAudioPlayer({
        src: `${baseUrl}/casa/source.mus`,
        format: 'mp3',
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
                onClick={() => {
                    X.log.debug('🏡', { sopa: 'toggle musique 🎼' })
                    t3()
                }}
            >
                {!r3 && !l3 ? 'Loading3' : 'Play3'}
            </button>
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