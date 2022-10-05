
import dynamic from 'next/dynamic'
import FlorScene from '@/components/pages/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'
import * as X from 'next-axiom'
import { Leva } from 'leva'
import { FlorTop, Instructions } from '@/components/dom/Instructions'

const Box = dynamic(() => import('@/components/canvas/Box'), {
    ssr: false,
})

// Step 5 - delete Instructions components
const Page = (props) => {
    X.log.debug('🌷', { sopa: 'hola', customerId: 32423, auth: 'session' })
    return (
        <>
            <FlorTop />
            <Leva collapsed={true} hidden={true} />
        </>
    )
}

Page.r3f = (props) => (
    <>
        <color attach="background" args={['#000']} />
        <PerspectiveCamera
            position={[0, 0, 1]}
            fov={75}
            // auto updates the viewport
            manual={false}
            makeDefault={true}
        />

        <FlorScene />
        {/* <axesHelper args={[8]} /> */}
    </>
)

export default Page

export async function getStaticProps() {
    return {
        props: {
            title: `🌺Flor GLSL- ${meta.titleDefault}`,
        },
    }
}
