import * as R from "react";
import * as T from "three";
import * as D from "@react-three/drei";
import * as S from "@react-spring/three";
import { a } from "@react-spring/three";

export default function Overlay() {
    const { progress, loaded, total, item } = D.useProgress();
    // console.log({ progress, loaded, total, item })
    const shader = R.useRef<T.MeshBasicMaterial>(null!);
    const [active, setActive] = R.useState(false);

    R.useLayoutEffect(() => {
        overlayShader(shader.current);
    }, []);

    R.useLayoutEffect(() => {
        if (loaded == total) {
            setActive(true);
        }
    }, [loaded]);

    const { opacity } = S.useSpring({
        delay: 2000,
        opacity: active ? 0.0 : 1.0,
    });

    return (
        <group>
            <a.mesh>
                <planeBufferGeometry args={[2, 2, 1]} />
                <a.meshBasicMaterial
                    ref={shader}
                    color={"black"}
                    transparent={true}
                    opacity={opacity}
                    side={T.DoubleSide}
                />
            </a.mesh>
        </group>
    );
}

function overlayShader(currentShader: T.Material) {
    currentShader.onBeforeCompile = function (shader: T.Shader) {
        setInsideVertexMain(shader, {
            from: "#include <fog_vertex>",
            to: `
            #include <fog_vertex>
            gl_Position = vec4(position, 1.0);
          `,
        });

        // console.log(shader.vertexShader)
    };
}

function setInsideVertexMain(
    shader: T.Shader,
    { from, to }: { from: string; to: string },
) {
    const newShader = shader.vertexShader.replace(
        from,
        to,
    );
    shader.vertexShader = newShader;
}
