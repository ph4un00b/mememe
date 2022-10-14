import dynamic from 'next/dynamic'
import { Fondo } from '@/components/scenes/Home/Fondo'
import { Phau } from '@/components/scenes/Home/Phau'
import * as meta from '@/config'
import { useMediaPlayer } from '@/helpers/store'
import * as R from 'react'
import { baseUrl } from '@/utils/external'

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
        <axesHelper scale={4} />
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
