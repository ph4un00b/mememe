import * as X from 'next-axiom'
import * as R from 'react'
import * as D from '@react-three/drei'
import * as F from '@react-three/fiber'
import dynamic from 'next/dynamic'
import FlorScene from '@/components/scenes/Flor/FlorScene'
import * as meta from '@/config'
import { PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva'
import { FlorTop } from '@/components/dom/Instructions'
import * as browser from '@/utils/browser'

const Box = dynamic(() => import('@/components/canvas/Box'), {
    ssr: false,
})

// Step 5 - delete Instructions components
const Page = (props) => {
    X.log.debug('🌷', { sopa: 'hola' })
    return (
        <>
            <FlorTop />
            <Leva collapsed={true} hidden={true} />
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

        <LoadFlorecer />
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

function LoadFlorecer() {
    const { gl } = F.useThree()
    const { device, fps, gpu, isMobile, tier, type } = D.useDetectGPU({
        benchmarksURL: './benchmarks',
        glContext: gl.getContext(),
    })

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
