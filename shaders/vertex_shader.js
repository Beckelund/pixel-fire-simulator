var vertex_shader = [
        'attribute vec2 position;',
        'attribute vec2 vertTexCoord;',
        'varying vec2 fragTexCoord;',
        'void main() {',
            'fragTexCoord = vertTexCoord;',
            'gl_Position = vec4(position, 0.0, 1.0);',
        '}'
].join('\n');

export { vertex_shader }