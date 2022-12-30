//Other functions
import { getRandomImage } from "./random_background.js";

//Shaders from files
import { vertex_shader } from "./shaders/vertex_shader.js";
import { fragment_shader } from "./shaders/fragment_shader.js";
import { gaussian_blur_fragment_shader } from "./shaders/gaussian_blur_fragment_shader.js";

//User inputs
var userClicked = false;
var clickX = 0;
var clickY = 0;

//Simulation settings
const height = 480/4;
const width = 640/4;

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
    var fragmentShaderSource = fragment_shader;
    
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
    
    const timeLocation = gl.getUniformLocation(program, "time");
    gl.uniform1f(timeLocation, Date.now() * 0.001);

    const heightLocation = gl.getUniformLocation(program, "height");
    gl.uniform1f(heightLocation, height);

    const widthLocation = gl.getUniformLocation(program, "width");
    gl.uniform1f(widthLocation, width);

    //Create a texture
    var background_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, background_texture);
    //Texture Parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    //Load the image
    var imageData = new ImageData(width, height);

    //Try load image through canvas
    var c = document.getElementById("img_canvas");
    var ctx = c.getContext("2d");
    var forestImage = new Image();
    forestImage.src = 'background_forest.png';
    forestImage.onload = function() {
        ctx.drawImage(forestImage, 0, 0, width, height);
        var imgData = ctx.getImageData(0,0, width, height);
        console.log(imgData.data);

        //imageData.data.set(imgData.data);

        //Flip image
        for(var i = 0; i < imageData.height; i++)
        {
            for(var j = 0; j < imageData.width; j++)
            {
                var index = (i * imageData.width + j) * 4;
                var png_index = ((imageData.height - i - 1) * imageData.width + j) * 4;

                imageData.data[index + 0] = imgData.data[png_index + 0];
                imageData.data[index + 1] = imgData.data[png_index + 1];
                imageData.data[index + 2] = imgData.data[png_index + 2];
                imageData.data[index + 3] = imgData.data[png_index + 3];
            }
        }

        c.remove();
    };
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    //gl.bindTexture(gl.TEXTURE_2D, null);

    //Loop data
        var loop_count = 0; //Amount of frames since start
        //fps counter
        var last50frames = new Array(50).fill(30);
        const fps_counter = document.getElementById('i_fpsCount');
        var then = 0;

    //Main update loop
    var loop = function(now) {
        gl.clearColor(0.0, 0.0, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        
        if(loop_count % 5 == 0)
        {
            imageData = everyOtherLine(imageData);
            if(userClicked == true) imageData = clickSetFire(imageData);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

        //Update time
        let someTimeValue = now * 0.001;
        gl.uniform1f(timeLocation, someTimeValue);
        
        
        gl.bindTexture(gl.TEXTURE_2D, background_texture);
        gl.activeTexture(gl.TEXTURE0);

        requestAnimationFrame(loop);


        loop_count++;

        //Fps information
        now *= 0.001;
        var deltaTime = now - then;
        then = now;
        last50frames[loop_count % 50] = 1/deltaTime;

        //Calculate FPS
        var fps = last50frames.reduce((a, b) => a + b, 0)/50;
        fps_counter.innerHTML = Math.floor(fps);

    };

    requestAnimationFrame(loop);
}

function everyOtherLine(imageData)
{
    //const width = 640;
    //const height = 480;
    const oneRow = width * 4;
    const oneColumn = 4;

    const new_image = new ImageData(width, height);

    for(let row = 0; row < height; row += 1)
    {
        for(let column = 0; column < width; column += 1)
        {
            let currentPixel = (row * width + column) * 4;

            if(imageData.data[currentPixel] == 255)
            {
                //random                
                setPixel(new_image, column, row, 255, 0, 0, 255);
                if(Math.random() > 0.59) setPixel(new_image, column-1, row, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column+1, row, 255, 0, 0, 255);
                if(Math.random() > 0.999) setPixel(new_image, column+5, row, 255, 0, 0, 255);
                if(Math.random() > 0.999) setPixel(new_image, column-5, row, 255, 0, 0, 255);
                if(Math.random() > 0.9999) setPixel(new_image, column+25, row, 255, 0, 0, 255);
                if(Math.random() > 0.9999) setPixel(new_image, column-25, row, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column, row+1, 255, 0, 0, 255);
                if(Math.random() > 0.99) setPixel(new_image, column, row-1, 255, 0, 0, 255);
                if(Math.random() > 0.999) setPixel(new_image, column, row+5, 255, 0, 0, 255);
                if(Math.random() > 0.999) setPixel(new_image, column, row-5, 255, 0, 0, 255);
                if(Math.random() > 0.9999) setPixel(new_image, column, row+25, 255, 0, 0, 255);
                if(Math.random() > 0.9999) setPixel(new_image, column, row-25, 255, 0, 0, 255);
            }
        }
    }

    for(let row = 0; row < height; row += 1)
    {
        for(let column = 0; column < width; column += 1)
        {
            let currentPixel = (row * width + column) * 4;
            if(new_image.data[currentPixel] != 255)
            {
                new_image.data[currentPixel] = imageData.data[currentPixel];
                new_image.data[currentPixel+1] = imageData.data[currentPixel+1];
                new_image.data[currentPixel+2] = imageData.data[currentPixel+2];
                new_image.data[currentPixel+3] = imageData.data[currentPixel+3];
            }
        }
    }



    return new_image;
}

function clickSetFire(imageData)
{

    //const width = 640;
    //const height = 480;
    //Get mouse position on webgl canvas
    //Set fire
    let x = Math.floor(clickX);
    let y = Math.floor(clickY);
    console.log(x, y)
    console.log(getPixel(imageData, x, y));
    
    setPixel(imageData, x, y, 255, 0, 0, 255);
    userClicked = false;
    return imageData;
}

function getPixel(image, x, y)
{
    const result = [];

    //const width = 640;

    let currentPixel = (x + y * width) * 4;
    
    result[0] = image.data[currentPixel + 0];
    result[1] = image.data[currentPixel + 1];
    result[2] = image.data[currentPixel + 2];
    result[3] = image.data[currentPixel + 3];
    
    return result;
}

function setPixel(image, x, y, r, g, b, a)
{
    //const width = 640;
    //const height = 480;

    let currentPixel = (x + y * width) * 4;

    //return if out of bounds
    if(x < 0 || x >= width || y < 0 || y > height) return;



    image.data[currentPixel + 0] = r;
    image.data[currentPixel + 1] = g;
    image.data[currentPixel + 2] = b;
    image.data[currentPixel + 3] = a;
}


addEventListener('mousedown', (event) => {});

onmousedown = (event) => { 
    if(event.button == 0)
    {
        //Update user input variables
        userClicked = true;
        
        //Mouse Position based on canvas
        const canvas = document.getElementById('glcanvas');
        let rect = canvas.getBoundingClientRect();
        clickX = Math.floor(width*(event.clientX - rect.left)/640);
        clickY = Math.floor(height*(rect.top + rect.height - event.clientY)/480);

        console.log('Mouse X: ' + clickX + ' Mouse Y: ' + clickY);
    }
};