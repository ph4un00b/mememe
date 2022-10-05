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

// const Box = dynamic(() => import('@/components/canvas/Box'), {
//     ssr: false,
// })

const Page = (props) => {
    const [collapsed, setCollapsed] = R.useState(true)
    X.log.debug('🌸', { sopa: 'init' })

    hooks.useTimeout(() => {
        if (browser.isMobile()) X.log.debug('📲', { sopa: 'mobile' })
        if (browser.isMobile()) return
        setCollapsed(!true)
    }, 3210)

    return (
        <>
            {/* <FlorTop /> */}
            <Leva
                collapsed={{
                    collapsed,
                    onChange(c) { },
                }}
                hidden={!true}
            />
        </>
    )
}

Page.r3f = (props) => (
    <>
        <color attach='background' args={['#000']} />
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
            title: `Florecer 🌺 GLSL - ${meta.titleDefault}`,
        },
    }
}
