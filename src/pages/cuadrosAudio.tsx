
import * as meta from '@/config'

let baseUrl = 'https://ph4un00b.github.io/data'
import { useControls } from 'leva'
import { MemoContainerGridAudio, MemoGrid } from '@/components/scenes/Cuadros/CuadrosAudioScene'

const Page = (props) => {
    return <></>
}

Page.r3f = (props) => (
    <>
        <Scene />
    </>
)

export default Page

export async function getStaticProps() {
    return {
        props: {
            title: `🏡 - ${meta.titleDefault}`,
        },
    }
}

let controls = {
    containerSize: {
        value: 30,
        min: 1,
        max: 30,
        step: 1,
    },
    segmentos: {
        value: 2,
        min: 1,
        max: 30,
        step: 1,
    },
    x: {
        value: -17,
        min: -30,
        max: 30,
        step: 1,
    },
    y: {
        value: -16,
        min: -30,
        max: 30,
        step: 1,
    },
    z: {
        value: -17,
        min: -50,
        max: 50,
        step: 1,
    },
    triggerX: {
        value: 0,
        min: -30,
        max: 30,
        step: 1,
    },
    triggerY: {
        value: 0,
        min: -30,
        max: 30,
        step: 1,
    },
}

function Scene() {
    const { x, y, z, segmentos, triggerX, triggerY } = useControls(controls)

    return (
        <>
            <color attach="background" args={['#000']} />
            <MemoContainerGridAudio
                x={x}
                y={y}
                z={z}
                translateX={triggerX}
                translateY={triggerY}
            >
                <MemoGrid segmentos={segmentos} />
            </MemoContainerGridAudio>
            <axesHelper scale={4} />
        </>
    )
}
