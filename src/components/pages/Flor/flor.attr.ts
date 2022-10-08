import * as T from 'three'

export function florAttributes(
    particles: number,
    niceColors: string[],
    leverCrazy: number,
    leverR: number,
    leverD: number,
    leverE: number,
    leverR2: number
) {
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
}
