var fragment_shader2 = [
    'precision mediump float;',
    
    //Screen settings
    'varying vec2 fragTexCoord;',

    //Textures
    'uniform sampler2D sampler;',
    '',
    'void main() {',

        'gl_FragColor = texture2D(sampler, fragTexCoord);',

    '}',
    ].join('\n');
    
    
export { fragment_shader2 }