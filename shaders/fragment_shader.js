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

    //Textures
    'uniform sampler2D sampler;',
    'uniform sampler2D SkyTexture;',
    'uniform sampler2D FireMap;',
    'uniform sampler2D FlamesMap;',
    'uniform sampler2D ShimmerMap;',
    '',
    'void main() {',

        'vec2 uv = fragTexCoord;',
        'vec2 pixelCoord = vec2(floor(uv.x*width), floor(uv.y*height));',

        //Fire color
        'vec4 fireColor;',
        'fireColor.r = 1.0;',
        'fireColor.g = 0.5 + 0.5 * fract(sin(dot(pixelCoord + time, vec2(12.9898, 78.233))) * 43758.5453);',
        'fireColor.b = 0.5;',
        'fireColor.a = 1.0;',

        
        //Flames
        'if(texture2D(FlamesMap, fragTexCoord).r * 255.0 == 255.0) {',
            //Condition based on noise
            'vec2 co = pixelCoord * 0.9;',
            'vec4 flameColor = vec4(1.0, 0.8, 0.5, 1.0) * snoise(vec2(floor(co.x), co.y - time * 20.0));',

            'float flame_strength = texture2D(FlamesMap, fragTexCoord).g;',
            'gl_FragColor = fireColor;',
            'if(flameColor.a * flame_strength > 0.5) return;',

            'co = pixelCoord * 0.3;',
            'flameColor = vec4(1.0, 0.5, 0.5, 1.0) * snoise(vec2(floor(co.x), co.y - time * 10.0));',
            'gl_FragColor = fireColor;',
            'if(flameColor.a * flame_strength > 0.5) return;',
            
            //Apply color
            //'return;',
        '}',
        
        //Change UV coordinate based on shimmer
        'if(texture2D(ShimmerMap, fragTexCoord).r * 255.0 == 255.0) {',
            //'vec2 co = pixelCoord;',
            'float strength = texture2D(ShimmerMap, fragTexCoord).g;',

            'pixelCoord.x += sin(time * 10.0 + uv.x * 80.0) * 0.0003;',
            'pixelCoord.y += cos(time * 2.0) * 0.0015;',

            'uv.x = pixelCoord.x / width;',
            'uv.y = pixelCoord.y / height;',

            'pixelCoord = vec2(floor(uv.x*width), floor(uv.y*height));',

            //'gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);',
        '}',


        //Pixels currently on fire
        'vec4 aColor = texture2D(sampler, uv);',
        'aColor = vec4(aColor.x, aColor.y, aColor.z, aColor.w);',
        'if(texture2D(FireMap, uv).r * 255.0 == 255.0){',
        '',
            'gl_FragColor = fireColor;',
            'return;',
        '}',

        //Calculate light intensity
        'const float Directions = 32.0;',
        'const float Quality = 8.0;',
        'const float Size = 80.0;',

        'const vec2 Radius = Size/vec2(640.0, 480.0);',

        'float intensity = 0.0;',
        'float counter = 0.0;',
        
        'const float Pi = 3.14;',
        'for(float d = 0.0; d<Pi*2.0; d+=Pi*2.0/Directions) {',
            'for(float i = 0.1; i <= 1.0; i+=1.0/Quality) {',
                'intensity += floor(texture2D(FireMap, uv + vec2(cos(d), sin(d)) * Radius * i).r/0.9);',
                'counter += 1.0;',
            '}',
        '}',
                
        'intensity /= counter;',

        //'gl_FragColor = aColor;',

        
        //Set material
        //Wood
        'if(aColor.r * 255.0 == 34.0){',
            //dark brown wood color
            'gl_FragColor = woodColor(pixelCoord);',
        '}',

        'if(aColor.r * 255.0 == 20.0){',
            'gl_FragColor = burntWoodColor(pixelCoord);',
        '}',
        
        //Grass
        'if(aColor.r * 255.0 == 97.0){',
            'gl_FragColor = grassColor(pixelCoord);',
        '}',

        'if(aColor.r * 255.0 == 70.0){',
            'gl_FragColor = burntGrassColor(pixelCoord);',
        '}',
        
        //Sky
        'if(aColor.r * 255.0 == 192.0){',
            'gl_FragColor = texture2D(SkyTexture, uv);',
            'return;',
        '}',

        //Apply light
        'vec4 lightColor = vec4(1.0, 0.8, 0.5, 1.0);',

        'float lightFactor = clamp(0.0 + intensity * 1.0, 0.0, 0.5);',
        //'gl_FragColor = lightColor * lightFactor;',
        'gl_FragColor = gl_FragColor * (1.0 - lightFactor) + lightColor * lightFactor;',
        'gl_FragColor.a = 1.0;',
        'return;',
        //'gl_FragColor = gl_FragColor * 0.2 + lightColor * clamp(0.0 + intensity * 2.0, 0.0, 0.5);',

        '',
        '}',
    ].join('\n');
    
    
export { fragment_shader }