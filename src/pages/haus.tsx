import * as R from 'react'
import * as D from '@react-three/drei'
import dynamic from 'next/dynamic'
import * as meta from '@/config'
import { useMediaPlayer } from '@/helpers/store'
import { baseUrl } from '@/utils/external'
import { Plane } from '@react-three/drei'
import Overlay from '@/components/scenes/Haus/Overlay'
import Phau from '@/components/scenes/Home/Phau'
import Fondo from '@/components/scenes/Home/Fondo'
import { Instructions } from '@/components/dom/Instructions'

// const Fondo = dynamic(() => import('@/components/scenes/Home/Fondo'), {
//     ssr: false,
// })

// const Phau = dynamic(() => import('@/components/scenes/Home/Phau'), {
//     ssr: false,
// })

const Page = (props) => {
    const dom = R.useRef<HTMLDivElement>(null!)
    const [, changeTrack] = useMediaPlayer()
    const { progress, loaded, total, item } = D.useProgress()

    R.useLayoutEffect(() => {
        changeTrack(`${baseUrl}/casa/source.mus`)
    }, [])

    R.useEffect(() => {
        if (loaded == total) {
            dom.current.remove()
        }
    }, [loaded]);

    return (
        <>
            <div ref={dom}
                // eslint-disable-next-line tailwind/class-order
                className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl pointer-events-none select-none md:text-base top-8 left-1/2 text-gray-50'
                style={{
                    maxWidth: 'calc(100% - 28px)',
                }}
            >
                <div className='text-xl tracking-wider'>
                    <span className='text-red-200'> {progress - 10}% loaded </span>
                </div>
            </div>
        </>
    )
}

Page.r3f = (props) => (
    <>
        <Phau />
        <Fondo />
        <Overlay />
    </>
)

export default Page

export async function getStaticProps() {
    return {
        props: {
            title: `🐋💨 - ${meta.titleDefault}`
        },
    }
}

