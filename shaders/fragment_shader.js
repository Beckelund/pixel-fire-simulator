var fragment_shader = [
    'precision highp float;',
    '',
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    '',
    'void main() {',
        'gl_FragColor = texture2D(sampler, fragTexCoord);',
    '}',
].join('\n');


export { fragment_shader }