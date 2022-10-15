import * as R from 'react'
import dynamic from 'next/dynamic'
import * as meta from '@/config'
import { useMediaPlayer } from '@/helpers/store'
import { baseUrl } from '@/utils/external'

const Fondo = dynamic(() => import('@/components/scenes/Home/Fondo'), {
    ssr: false,
})

const Phau = dynamic(() => import('@/components/scenes/Home/Phau'), {
    ssr: false,
})

const Page = (props) => {
    const [, changeTrack] = useMediaPlayer()

    R.useLayoutEffect(() => {
        changeTrack(`${baseUrl}/casa/source.mus`)
    }, [])

    return (
        <>

        </>
    )
}

Page.r3f = (props) => (
    <>
        <Phau />
        <Fondo />
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
