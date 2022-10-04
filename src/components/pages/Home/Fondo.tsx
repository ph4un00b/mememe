import * as R from 'react'
import * as T from 'three'
import * as F from '@react-three/fiber'
import * as D from '@react-three/drei'

export function Fondo() {
    const shader = R.useRef<ShaderProps>(null)

    F.useFrame((state) => {
        shader.current.utime = state.clock.elapsedTime
    })

    return (
        <mesh>
            <planeBufferGeometry args={[10, 10, 2 ** 7, 2 ** 7]} />
            <aguaMat
                ref={shader}
                wireframe={true}
                color={0xff0000}
                side={T.DoubleSide}
            />
        </mesh>
    )
}

/** identity for template-literal */
const glsl = (x: TemplateStringsArray) => String(x)

const vertex = glsl`
/** @link https://learnopengl.com/Getting-started/Coordinate-Systems */

// uniform mat4 /** transform coords */ projectionMatrix; 
// uniform mat4 /** transform camera */ viewMatrix;
// uniform mat4 /** transform mesh */ modelMatrix;
/** or use a shorcut */
// uniform mat4 modelViewMatrix;
// attribute vec3 position;
// attribute vec2 uv;

/** all the above are automatically set on <ShaderMaterial/> */

/** context -> inputs */
uniform float utime;


/** outputs -> frag */

varying vec2 vUv;  
varying float vElevation;  

void main()
{
  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  /** OR */

  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  /** OR */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * 4.0 + utime) * 0.5;
  elevation += sin(modelPosition.y * 4.0 + utime) * 0.2;
  modelPosition.z = elevation;

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  /* outputs */
  vUv = uv;
  vElevation = elevation;
}

/**
 *    - functions are typed as well
 *    - float sum(float a, float b) { return a + b; };
 *
 *    - classic built-in functions
 *      - sin, cos, max, min, pow, exp, mod, clamp
 *
 *    - practical built-in functions
 *      - cross, dot, mix, step, smoothstep, length, distance, reflect, refract, normalize
 *
 * - Documentation: (not beginner-friendly)
 *   - https://www.shaderific.com/glsl-functions
 *   - https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/indexflat.php
 *   - https://thebookofshaders.com/glossary/
 * 
 * - Inspirational Links:
 *   - https://thebookofshaders.com/
 *   - https://www.shadertoy.com/
 *   - https://www.youtube.com/channel/UCcAlTqd9zID6aNX3TzwxJXg
 *   - https://www.youtube.com/channel/UC8Wzk_R1GoPkPqLo-obU_kQ
 */
`

const frag = glsl`
  /** context -> inputs */
  uniform float utime;

  /** vertex -> inputs */
  varying vec2 vUv;
  // #pragma glslify: random = require(glsl-random)
  varying float vElevation;


  void main() {
    // gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + utime) + color, 1.0);
    gl_FragColor.rgba = 1.0 * vElevation * vec4(0.5 + 0.3 * sin(vUv.yxy + utime), 1.0);
    // gl_FragColor.rgba = 1.0 * vElevation * vec4(0.5 + 0.3 * 1.0, 0.5 + 0.3 * 1.0, 0.5 + 0.3 * 1.0, 1.0);
    // gl_FragColor.rgba = vec4(vec3(0.), 1.);
  }
`

type ShaderProps = T.ShaderMaterial & {
    [key: string]: any
}

declare module '@react-three/fiber' {
    interface ThreeElements {
        aguaMat: F.Object3DNode<ShaderProps, typeof AguaMat>
    }
}

const AguaMat = D.shaderMaterial({ utime: 0 }, vertex, frag)

F.extend({ AguaMat }) // -> now you can do <aguaMat ... />
