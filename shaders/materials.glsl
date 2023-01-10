precision mediump float;

/*
//dark brown wood color
            'vec4 woodColor = vec4(0.35, 0.2, 0.2, 1.0);',

            'woodColor *= 0.2 - snoise(vec2(pixelCoord.x, pixelCoord.y * 0.1)) * 0.5;',
            'woodColor *= 1.0 - snoise(vec2(pixelCoord.x * 0.1, pixelCoord.y)) * 0.3;',

*/

vec4 woodColor(vec2 pixelCoord) {
    //Color
    vec4 color = vec4(0.35, 0.2, 0.2, 1.0);

    //Noise
    color *= 0.2 - snoise(vec2(pixelCoord.x, pixelCoord.y * 0.1)) * 0.5;
    color *= 1.0 - snoise(vec2(pixelCoord.x * 0.1, pixelCoord.y)) * 0.3;

    color.a = 1.0;

    return color;
}

vec4 burntWoodColor(vec2 pixelCoord) {
    //Color
    vec4 color = vec4(0.1, 0.1, 0.1, 1.0);

    //Noise
    color *= 0.2 - snoise(vec2(pixelCoord.x, pixelCoord.y * 0.1)) * 0.5;
    color *= 1.0 - snoise(vec2(pixelCoord.x * 0.1, pixelCoord.y)) * 0.3;

    color.a = 1.0;

    return color;
}

vec4 grassColor(vec2 pixelCoord) {
    //Color
    vec4 color = vec4(0.2, 0.5, 0.2, 1.0) * 0.5;

    //Noise
    color += snoise(pixelCoord) * 0.04;

    //Large grass strains
    color += snoise(vec2(pixelCoord.x, pixelCoord.y * 0.1)) * 0.04;

    return color;
}

vec4 burntGrassColor(vec2 pixelCoord) {
    //Color
    vec3 color = vec3(0.1, 0.2, 0.1) * 0.2;

    //Noise
    color += snoise(pixelCoord) * 0.1;

    //Large grass strains
    color += snoise(vec2(pixelCoord.x, pixelCoord.y * 0.1)) * 0.1;

    return vec4(color.r, color.g, color.b, 1.0);
}