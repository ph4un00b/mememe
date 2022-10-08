import * as R from 'react'
import * as T from 'three'
import * as L from 'leva'
import * as F from '@react-three/fiber'
import { useColoritos } from '@/utils/coloritos'
import { useAudioPosition } from 'react-use-audio-player'
import * as browser from '@/utils/browser'

import florecerData from '../../../music/florecer.json'
import { useDebugBeats, useDebugParticles } from '@/helpers/store'
let data = florecerData as MusicAnalysis
const Style = {
    base: [
        'color: #fff',
        'background-color: #444',
        'padding: 2px 4px',
        'border-radius: 2px',
    ],
    warning: ['color: #eee', 'background-color: red'],
    success: ['background-color: green'],
}

const styles = [Style.base, Style.warning, Style.success]
let beat = 0

const log = (text, extra = []) => {
    let style = Style.base.join(';') + ';'
    style += extra.join(';') // Add any additional styles
    console.log(`%c${text}`, style)
}

export default function FlorScene() {
    let adjusted_particles = R.useRef(browser.isMobile() ? 20_000 : 85_000)
    const geo = R.useRef<T.BufferGeometry>(null!)
    const points = R.useRef<T.Points>(null!)

    const [
        {
            leverA,
            offset,
            leverC,
            particles,
            leverCrazy,
            leverD,
            leverE,
            leverR,
            leverR2,
        },
        Lset,
    ] = L.useControls(() => ({
        leverA: { value: 0.65, min: 0, max: 2, step: 0.01 },
        offset: { value: 0.0, min: 0, max: 1, step: 0.01 },
        leverC: { value: 1, min: 1, max: 20, step: 1 },
        leverD: { value: 17, min: 0, max: 20, step: 1 },
        leverE: { value: 1.68, min: 0, max: 2, step: 0.001 },
        leverCrazy: { value: 0.45, min: 0.01, max: 2, step: 0.01 },
        leverR: { value: 2.0, min: 0, max: 2, step: 0.001 },
        leverR2: { value: 10, min: 1, max: 10, strep: 0.001 },
        particles: {
            value: adjusted_particles.current,
            min: 0,
            max: 100_000,
            step: 1_000,
            // onChange: (v) => {
            //     // imperatively update the world after Leva input changes
            //     console.log(v)
            // },
        },
    }))

    const { gl, viewport, size } = F.useThree()
    /** @link https://github.com/pmndrs/react-three-fiber/discussions/1012 */
    // gl.getPixelRatio()
    // viewport -> size in three units
    // size -> size in pixels

    const mat = R.useMemo(
        () =>
            new T.ShaderMaterial({
                depthWrite: false,
                vertexColors: true,
                blending: T.AdditiveBlending,
                vertexShader: `
uniform float uTime;
uniform float uSize;

attribute vec3 aRandomness;
attribute float aScale;

varying vec3 vColor;

void main()
{
    /**
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Rotate
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // tu mamá en tanga ╰(*°▽°*)╯!!!

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    /**
     * Size
     */
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    /**
     * Color
     */
    vColor = color;
}
        `,
                fragmentShader: `
        /** context -> inputs */

${glslUniforms()}

/** vertex -> inputs */

varying vec2 vUv;
varying float vElevation;
varying vec3 vColor; 

${fragmentFunctions()}

float circleShape( vec2 pointA, vec2 pointB, float edge ) {
  float value =  distance( pointA, pointB );
  return step( edge, value );
}

float mirror(float value) {
  return 1.0 - value;
}

float circleLinearDifuse(vec2 pointA, vec2 pivot, float intensity) {
  return mirror( distance( pointA, pivot ) * intensity );
}

vec3 black() {
  return vec3(0.0);
}

void main() {
  // black 0,0,0 ,  white 1,1,1

  /**
   * putting a rounded creafted shape pattern
   */
  vec2 coord = gl_PointCoord;

  //float punch = circleShape(coord, vec2(0.5), 0.5);
  // punch = mirror(punch);

  float punch = pow(circleLinearDifuse(coord, vec2(0.5), 3.0 ), 7.0);

  vec3 rgb = vec3( mix(black(), vColor, punch) );
  gl_FragColor = vec4(rgb, 1.0);
}`,
                uniforms: {
                    uTime: { value: 0 },
                    uSize: { value: 20 * leverA * gl.getPixelRatio() },
                },
            }),
        [leverA /** color */]
    )

    // const { scene } = useThree();
    R.useLayoutEffect(() => {
        if (points.current) {
            geo.current.dispose()
            mat.dispose()
            // scene.remove(points.current);
        }
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    const [[, niceColors]] = useColoritos({ quantity: 2 })
    // console.log({ colors });

    const arrays = R.useMemo(() => {
        const positions = new Float32Array(particles * 3)
        const colors = new Float32Array(particles * 3)
        // recreating PointMaterial size as scale
        const scales = new Float32Array(particles * 3 /** in xyz */)
        const randomness = new Float32Array(
            particles * 1 /** just need 1 dimension */
        )

        const colorIn = new T.Color(niceColors[0])
        // const colorOut = new T.Color(niceColors[1 + Math.floor(Math.random() * 4)]);
        const colorOut = new T.Color(niceColors[2])

        for (let i = 0; i < particles; i++) {
            const xyz = i * 3
            const [x, y, z] = [xyz, xyz + 1, xyz + 2]
            const random_leverCrazy = Math.random() * leverCrazy
            const random_noise = Math.random() * leverR
            const ramaAngle = ((i % leverD) / leverD) * Math.PI * 2
            const curveAngle = random_leverCrazy * leverE
            const angle = ramaAngle + curveAngle

            const [rx, ry, rz] = [
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
                Math.pow(Math.random(), leverR2) * (Math.random() < 0.5 ? 1 : -1),
            ]

            randomness: {
                // randomness[x] = rx
                // randomness[y] = ry
                // randomness[z] = rz
                randomness[x] = 0
                randomness[y] = 0
                randomness[z] = 0
            }

            // positions[x] = Math.cos(angle) * random_leverCrazy + rx;
            positions[x] = Math.cos(angle) * random_leverCrazy
            // positions[y] = ry;
            positions[y] = 0
            // positions[z] = Math.sin(angle) * random_leverCrazy + rz;
            positions[z] = Math.sin(angle) * random_leverCrazy

            fusion_colors: {
                const mixedColor = colorIn.clone()
                mixedColor.lerp(colorOut, random_leverCrazy / leverCrazy)
                colors[x] = mixedColor.r
                colors[y] = mixedColor.g
                colors[z] = mixedColor.b
            }

            scales: {
                scales[i] = Math.random()
            }
        }
        return [positions, colors, scales, randomness] as const
    }, [particles, offset, leverC, leverCrazy, leverD, leverE, leverR, leverR2])

    F.useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        geo.current.attributes.position.needsUpdate = true
        points.current.rotation.y = t * 0.2

        /** uniforms */
        mat.uniforms.uTime.value = t
    })

    const { percentComplete, duration, seek, position } = useAudioPosition({
        highRefreshRate: true,
    })

    const inEffect = R.useRef(false)
    const [, changeDebugBeats] = useDebugBeats()
    const [, changeDebugParticles] = useDebugParticles()
    F.useFrame((state) => {
        if (!(position > 0) /** started */) return

        let currentBeatDuration = data.beats[0].start + data.beats[0].duration
        let beatDelta = data.beats[0].duration / 5 /** can be whatever */

        if (!inEffect.current) {
            if (position > data.beats[0].start && position < currentBeatDuration) {
                log('beat', styles[beat % 3])
                // console.log({ start: data.beats[0].start, delta: beatDelta, next: data.beats[0].start + data.beats[0].duration })
                inEffect.current = true
                // changeDebugBeats(beat++)
                changeDebugBeats(data.beats[0].confidence)
                console.log({ particles: adjusted_particles.current })

                if (data.beats[0].confidence > 0.4) {
                    const newParticles = Math.floor(
                        Math.random() * 0.2 * adjusted_particles.current
                    )
                    changeDebugParticles(newParticles)
                    Lset({ particles: newParticles })
                    Lset({ leverCrazy: 0.15 * 0.45 + Math.random() * 0.3 })
                }
            }
        }

        if (inEffect.current) {
            if (position > currentBeatDuration - 2 * beatDelta) {
                inEffect.current = false
                const newParticles = 1 * adjusted_particles.current
                changeDebugParticles(newParticles)
                Lset({ particles: newParticles })
                Lset({ leverCrazy: 2 * 0.45 + Math.random() })

                data.beats.splice(0, 1)
            }
        }
    })

    // F.useFrame((state) => {
    //     if (!(position > 0) /** started */) return

    //     let currentBeatDuration = data.bars[0].start + data.bars[0].duration
    //     let beatDelta = data.bars[0].duration / 5 /** can be whatever */
    //     // console.log({ start: data.beats[0].start, delta: beatDelta, next: data.beats[0].start + data.beats[0].duration })
    //     // console.log(position)

    //     if (!inEffect.current) {
    //         if (position > data.bars[0].start && position < currentBeatDuration) {
    //             log('bars', styles[beat % 3])
    //             inEffect.current = true
    //             beat++
    //         }
    //     }

    //     if (inEffect.current) {
    //         if (position > currentBeatDuration - 2 * beatDelta) {
    //             inEffect.current = false
    //             data.bars.splice(0, 1)
    //         }
    //     }
    // })

    // F.useFrame((state) => {
    //     if (!(position > 0) /** started */) return

    //     let currentBeatDuration = data.sections[0].start + data.sections[0].duration
    //     let beatDelta = data.sections[0].duration / 5 /** can be whatever */
    //     // console.log(position)

    //     if (!inEffect.current) {
    //         if (position > data.sections[0].start && position < currentBeatDuration) {
    //             log('sections', styles[beat % 3])
    //             console.log({ start: data.sections[0].start, next: data.sections[0].start + data.sections[0].duration })
    //             inEffect.current = true
    //             beat++
    //         }
    //     }

    //     if (inEffect.current) {
    //         if (position > currentBeatDuration - 2 * beatDelta) {
    //             inEffect.current = false
    //             data.sections.splice(0, 1)
    //         }
    //     }
    // })

    // F.useFrame((state) => {
    //     if (!(position > 0) /** started */) return

    //     let currentBeatDuration = data.tatums[0].start + data.tatums[0].duration
    //     let beatDelta = data.tatums[0].duration / 5 /** can be whatever */
    //     // console.log(position)

    //     if (!inEffect.current) {
    //         if (position > data.tatums[0].start && position < currentBeatDuration) {
    //             log('tatums', styles[beat % 3])
    //             console.log({ start: data.tatums[0].start, next: data.tatums[0].start + data.sections[0].duration })
    //             inEffect.current = true
    //             beat++
    //         }
    //     }

    //     if (inEffect.current) {
    //         if (position > currentBeatDuration - 2 * beatDelta) {
    //             inEffect.current = false
    //             data.tatums.splice(0, 1)
    //         }
    //     }
    // })

    return (
        <points
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            ref={points}
            // castShadow={true}
            material={mat}
        >
            <bufferGeometry ref={geo}>
                <bufferAttribute
                    attach='attributes-position'
                    array={arrays[0]}
                    count={arrays[0].length / 3}
                    itemSize={3}
                />
                <bufferAttribute
                    attach='attributes-color'
                    array={arrays[1]}
                    count={arrays[1].length / 3}
                    itemSize={3}
                />
                <bufferAttribute
                    attach='attributes-aScale'
                    array={arrays[2]}
                    count={arrays[2].length}
                    itemSize={1}
                />
                <bufferAttribute
                    attach='attributes-aRandomness'
                    array={arrays[3]}
                    count={arrays[3].length}
                    itemSize={3}
                />
            </bufferGeometry>
        </points>
    )
}

function glslUniforms() {
    return `

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

uniform float uTime;
uniform float uSize;

uniform float uleverX;
uniform float uleverY;
uniform float uleverZ;
uniform float uleverA;
uniform float uleverB;`
}

function fragmentFunctions() {
    return `
float pseudo_random(vec2 seed)
{
  /** from the book of shaders */
  return fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float turn, vec2 pivot) 
{
  /** @link https://www.computerenhance.com/p/turns-are-better-than-radians */
  return vec2(
    cos(turn) * (uv.x - pivot.x) + sin(turn) * (uv.y - pivot.y) + pivot.x,
    cos(turn) * (uv.y - pivot.y) - sin(turn) * (uv.x - pivot.x) + pivot.y
  );
}

vec4 permute(vec4 x)
{
  return mod( ((x * 34.0) + 1.0) * x, 289.0);
}

/** @link https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83 */

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}`
}

export interface MusicAnalysis {
    meta: Meta
    track: Track
    bars: Bar[]
    beats: Beat[]
    sections: Section[]
    segments: Segment[]
    tatums: Tatum[]
}

export interface Meta {
    analyzer_version: string
    platform: string
    detailed_status: string
    status_code: number
    timestamp: number
    analysis_time: number
    input_process: string
}

export interface Track {
    num_samples: number
    duration: number
    sample_md5: string
    offset_seconds: number
    window_seconds: number
    analysis_sample_rate: number
    analysis_channels: number
    end_of_fade_in: number
    start_of_fade_out: number
    loudness: number
    tempo: number
    tempo_confidence: number
    time_signature: number
    time_signature_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    codestring: string
    code_version: number
    echoprintstring: string
    echoprint_version: number
    synchstring: string
    synch_version: number
    rhythmstring: string
    rhythm_version: number
}

export interface Bar {
    start: number
    duration: number
    confidence: number
}

export interface Beat {
    start: number
    duration: number
    confidence: number
}

export interface Section {
    start: number
    duration: number
    confidence: number
    loudness: number
    tempo: number
    tempo_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    time_signature: number
    time_signature_confidence: number
}

export interface Segment {
    start: number
    duration: number
    confidence: number
    loudness_start: number
    loudness_max_time: number
    loudness_max: number
    loudness_end: number
    pitches: number[]
    timbre: number[]
}

export interface Tatum {
    start: number
    duration: number
    confidence: number
}
