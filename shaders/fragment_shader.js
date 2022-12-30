var fragment_shader = [
    'precision mediump float;',
    //time
    'uniform float time;',
    '',
    //Screen settings
    'uniform float height;',
    'uniform float width;',
    '',
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    //'uniform sampler2D fireNoise',
    '',
    'void main() {',
        
        'vec4 aColor = texture2D(sampler, fragTexCoord);',
        'aColor = vec4(aColor.x, aColor.y, aColor.z, aColor.w);',
        'if(aColor.r > 0.99){',
        '',
            'vec2 co = vec2(floor(fragTexCoord.x*width), floor(fragTexCoord.y*height));',
            'aColor.r = 1.0;',
            'aColor.g = 0.5 + 0.5 * fract(sin(dot(co + time, vec2(12.9898, 78.233))) * 43758.5453);',
            'aColor.b = 0.5;',
        '}',

        //Calculate light intensity
        'const float Directions = 24.0;',
        'const float Quality = 4.0;',
        'const float Size = 40.0;',

        'const vec2 Radius = Size/vec2(640.0, 480.0);',

        'float intensity = 0.0;',
        'float counter = 0.0;',
        
        'const float Pi = 3.14;',
        'for(float d = 0.0; d<Pi*2.0; d+=Pi*2.0/Directions) {',
            'for(float i = 0.1; i <= 1.0; i+=1.0/Quality) {',
                'intensity += floor(texture2D(sampler, fragTexCoord + vec2(cos(d), sin(d)) * Radius * i).r/0.9);',
                'counter += 1.0;',
            '}',
        '}',

        'intensity /= counter;',

        'if(aColor.r > 0.99){',
            'intensity = 1.0;',
        '}',

        'gl_FragColor = aColor * (0.5 + intensity * 0.5);',
    
        '',
    '}',
].join('\n');


export { fragment_shader }