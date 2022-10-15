import * as S from '@react-spring/three'
import { a } from '@react-spring/three'
import * as R from 'react'
import * as F from '@react-three/fiber'
import * as std from 'three-stdlib'
import { TextGeometry } from 'three-stdlib'

let baseUrl = 'https://ph4un00b.github.io/data'

let global = {
    font1: `${baseUrl}/typeface/press-start-2p.json`,
}

export default function Phau() {

    return (
        <>
            <Letra symbol='P' position={[0, 2.5, 0]} />
            <Letra symbol='H' position={[0, 1, 0]} />
            <Letra symbol='A' position={[0, -0.5, 0]} />
            <Letra symbol='U' position={[0, -2, 0]} />
        </>
    )
}


function Letra({ symbol, ...props }: { symbol: string } & F.MeshProps) {
    const [active, setActive] = R.useState(false)

    const { color, scale } = S.useSpring({
        color: active ? 'royalblue' : 'black',
        scale: active ? 1.5 : 1
    })

    const font = F.useLoader(std.FontLoader, global.font1)
    type FontOpts = std.TextGeometryParameters & { bevelSegments: number }

    const defaultFontOpts: FontOpts = {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    }

    return (
        // @ts-ignore possibly infinity
        <a.mesh {...props} scale={scale}
            onPointerOut={(e) => {
                e.stopPropagation()
                setActive(false)
            }}

            onClick={(e) => {
                e.stopPropagation()
                setActive(true)
            }}

            onPointerOver={(e) => {
                e.stopPropagation()
                setActive(true)
            }}>
            <textGeometry args={[symbol, defaultFontOpts]} />
            <a.meshBasicMaterial color={color} />
        </a.mesh>
    )
}


declare global {
    namespace JSX {
        interface IntrinsicElements {
            textGeometry: F.Object3DNode<std.TextGeometry, typeof std.TextGeometry>
        }
    }
}

F.extend({ TextGeometry }) // -> now you can do <aguaMat ... />
