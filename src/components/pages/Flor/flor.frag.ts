const glslUniforms = `

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

const fragmentFunctions = `
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

export const fragmentShader = `
        /** context -> inputs */

${glslUniforms}

/** vertex -> inputs */

varying vec2 vUv;
varying float vElevation;
varying vec3 vColor;

${fragmentFunctions}

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
}`



