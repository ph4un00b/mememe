import Instructions from '@/components/dom/Instructions'
import dynamic from 'next/dynamic'
import Flor from '@/components/pages/Flor/Flor'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'

const Box = dynamic(() => import('@/components/canvas/Box'), {
    ssr: false,
})

// Step 5 - delete Instructions components
const Page = (props) => {
    return (
        <>
            {/* <Instructions /> */}
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
        <group>
            <Flor />
        </group>
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
