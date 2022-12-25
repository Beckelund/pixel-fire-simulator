var gaussian_blur_fragment_shader = [
    'precision highp float;',
    '',
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    '',
    'void main() {',
        //Gaussian Blur settings
        'const float Directions = 16.0;',
        'const float Quality = 4.0;',
        'const float Size = 2.0;',

        'vec2 Radius = Size/vec2(640.0, 480.0);',
        //Normalized pixel coordinates (from 0 to 1)
        'vec2 uv = fragTexCoord/vec2(640.0, 480.0);',
        //Pixel color
        'vec4 color = texture2D(sampler, uv);',

        'const float Pi = 3.14;',
        'for(float d = 0.0; d<Pi; d+=Pi/Directions) {',
            'for(float i = 1.0; i<=Quality; i++) {',
                'color += texture2D(sampler, fragTexCoord + vec2(cos(d), sin(d)) * Radius * i);',
            '}',
        '}',

        'color /= Quality * Directions - 15.0;',
        'gl_FragColor = color;',

    '}',
].join('\n');


export { gaussian_blur_fragment_shader }