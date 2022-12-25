//Other functions
import { getRandomImage } from "./random_background.js";

//Shaders from files
import { vertex_shader } from "./shaders/vertex_shader.js";
import { fragment_shader } from "./shaders/fragment_shader.js";
import { gaussian_blur_fragment_shader } from "./shaders/gaussian_blur_fragment_shader.js";

//webgl main function
main();

function main() {

    // Get the canvas element and the WebGL context
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl');

    //Clear color
    gl.clearColor(0.0, 0.0, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Create a vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var vertexShaderSource = vertex_shader;
    

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    //Create a fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentShaderSource = gaussian_blur_fragment_shader;
    
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    //Create a program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var vertices = new Float32Array([
        //X, Y,         U, V
        //Triangle 1
        -1.0, -1.0,     0, 0,
        1.0, -1.0,      1, 0,
        1.0, 1.0,       1, 1,
        //Triangle 2
        -1.0, -1.0,     0, 0,
        1.0, 1.0,       1, 1,
        -1.0, 1.0,      0, 1,
    ]);

    //Create a buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);
    program.color = gl.getUniformLocation(program, 'color');
    gl.uniform4fv(program.color, [1.0, 0.0, 0.0, 1.0]);

    var positionAttribLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 4 * Float32Array.BYTES_PER_ELEMENT, 0);

    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    
    //Create a texture
    var background_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, background_texture);
    //Texture Parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    //Load the image
    var image = new Image();
    image.src = 'cubetexture.png';

    
    var imageData = getRandomImage();
    imageData = everyOtherLine(imageData);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    //gl.bindTexture(gl.TEXTURE_2D, null);

    //Loop data
    var loop_count = 0; //Amount of frames since start

    var loop = function() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        
        if(loop_count % 4 == 0)
        {
            imageData = everyOtherLine(imageData);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        }
        
        
        gl.bindTexture(gl.TEXTURE_2D, background_texture);
        gl.activeTexture(gl.TEXTURE0);

        requestAnimationFrame(loop);
        loop_count++;
    };

    requestAnimationFrame(loop);
}

function everyOtherLine(imageData)
{
    const width = 640;
    const height = 480;
    const oneRow = width * 4;
    const oneColumn = 4;

    const new_image = new ImageData(width, height);

    for(let row = 0; row < height; row += 1)
    {
        for(let column = 0; column < width * 4; column += 1)
        {
            let currentPixel = row * 4 * width + column * 4;

            if(imageData.data[currentPixel] == 255)
            {
                //random
                setPixel(new_image, column, row, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column + 1, row, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column - 1, row, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column, row + 1, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column, row - 1, 255, 0, 0, 255);
            }
            
        }
    }

    return new_image;
}

function setPixel(image, x, y, r, g, b, a)
{
    const width = 640;
    const height = 480;

    const index = (x + y * width) * 4;

    image.data[index + 0] = r;
    image.data[index + 1] = g;
    image.data[index + 2] = b;
    image.data[index + 3] = a;
}