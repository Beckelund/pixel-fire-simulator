//Other functions
import { getRandomImage } from "./random_background.js";

//Shaders from files
import { vertex_shader } from "./shaders/vertex_shader.js";
import { fragment_shader } from "./shaders/fragment_shader.js";
import { fragment_shader2 } from "./shaders/fragment_shader2.js";
import { gaussian_blur_fragment_shader } from "./shaders/gaussian_blur_fragment_shader.js";

//Util functions
import { setPixel } from "../util/setPixel.js";

//Image generators from files
import { generateSky } from "./image_generation/generateSky.js";


//User inputs
var userClicked = false;
var clickX = 0;
var clickY = 0;
var render_mode = 1;

var pause_simulation = false;
var pause_shaders = false;

//Simulation settings
const height = 480/2;
const width = 640/2;

const shimmer_Height = 20;
const flames_Height = 20;

const wood_odds = 0.99;
const grass_odds = 0.90;

//Simulation variables
    //Background
    var background_Image = new ImageData(width, height);

    //track burning pixels
    var burning_pixels = [];


//Update-loop settings
const pixel_offset = 1;
const pixel_offset_increment = 1;   //Has to be an odd number
if(pixel_offset_increment == 0) console.error("pixel_offset_increment has to be greater than 0");
if(pixel_offset_increment % 2 == 0) console.error("pixel_offset_increment has to be an odd number");

var pixel_offset_count = 0;

//Frame counter
var loop_count = 0; //Amount of frames since start

//webgl main function
var SimplexNoisesrc;
var Materialssrc;
$.get('shaders/Simplex2DNoise.glsl', function(noise_data) {
    $.get('shaders/materials.glsl', function(materials_data) {

        SimplexNoisesrc = noise_data;
        Materialssrc = materials_data;
        main();
    });
});


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
    //append 2DSimplexNoise file

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentShaderSource = fragment_shader;
    
    gl.shaderSource(fragmentShader, SimplexNoisesrc + Materialssrc + fragmentShaderSource);
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

    //Texture Locations
    const pixelTexUnit = 0;
    const skyTexUnit = 1;
    const fireMapUnit = 2;
    const flamesMapUnit = 3;
    const shimmerMapUnit = 4;

    gl.uniform1i(gl.getUniformLocation(program, "sampler"), pixelTexUnit);
    gl.uniform1i(gl.getUniformLocation(program, "SkyTexture"), skyTexUnit);
    gl.uniform1i(gl.getUniformLocation(program, "FireMap"), fireMapUnit);
    gl.uniform1i(gl.getUniformLocation(program, "FlamesMap"), flamesMapUnit);
    gl.uniform1i(gl.getUniformLocation(program, "ShimmerMap"), shimmerMapUnit);

    
    //Create a texture
    var background_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, background_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    //Sky texture
    var sky_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sky_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    var sky_Image = generateSky(width, height);

    //Fire map
    var fire_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fire_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    var fire_Image = new ImageData(width, height);

    //Flames map
    var flames_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, flames_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    //Shimmer map
    var shimmer_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shimmer_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    
    //Load the image

    //Try load image through canvas
    var c = document.getElementById("img_canvas");
    var ctx = c.getContext("2d");
    var forestImage = new Image();
    forestImage.src = 'background_forest.png';
    forestImage.onload = function() {
        ctx.drawImage(forestImage, 0, 0, width, height);
        var imgData = ctx.getImageData(0,0, width, height);
        //console.log(imgData.data);

        //imageData.data.set(imgData.data);

        //Flip image
        for(var i = 0; i < background_Image.height; i++)
        {
            for(var j = 0; j < background_Image.width; j++)
            {
                var index = (i * background_Image.width + j) * 4;
                var png_index = ((background_Image.height - i - 1) * background_Image.width + j) * 4;

                background_Image.data[index + 0] = imgData.data[png_index + 0];
                background_Image.data[index + 1] = imgData.data[png_index + 1];
                background_Image.data[index + 2] = imgData.data[png_index + 2];
                background_Image.data[index + 3] = imgData.data[png_index + 3];
            }
        } 

        background_Image = reformat_input(background_Image);
        c.remove();
    };
    
    //Create second program for rendering specific textures

    var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentShaderSource2 = fragment_shader2;

    gl.shaderSource(fragmentShader2, fragmentShaderSource2);
    gl.compileShader(fragmentShader2);


    var program2 = gl.createProgram(gl, vertexShaderSource, fragmentShaderSource2);
    gl.attachShader(program2, vertexShader);
    gl.attachShader(program2, fragmentShader2);
    gl.linkProgram(program2);

    //gl.bindTexture(gl.TEXTURE_2D, null);

    //Loop data
        //fps counter
        var last50frames = new Array(50).fill(30);
        const fps_counter = document.getElementById('i_fpsCount');
        var then = 0;
        
    var shimmer_Map = new ImageData(width, height);
    var flames_Map = new ImageData(width, height);
    //Main update loop
    var loop = function(now) {
        gl.clearColor(0.0, 0.0, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        //Update simulation
        if(loop_count % 1 == 0 && pause_simulation == false) {            
            //imageData = update_image(imageData);
            fire_Image = spreadFire(fire_Image);
        }

        if(userClicked == true) fire_Image = clickSetFire(fire_Image);
        if(loop_count % 10 == 0) [flames_Map, shimmer_Map] = generateFlameShimmerMap(fire_Image);
        
        if(pause_shaders == false) {
            if(render_mode == 1) {
                gl.useProgram(program);
                //Update time
                let someTimeValue = now * 0.001;
                gl.uniform1f(timeLocation, someTimeValue);
                
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, background_texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, background_Image);
                
                gl.activeTexture(gl.TEXTURE0 + 1);
                gl.bindTexture(gl.TEXTURE_2D, sky_texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky_Image);
                
                gl.activeTexture(gl.TEXTURE0 + 2);
                gl.bindTexture(gl.TEXTURE_2D, fire_texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fire_Image);
                
                gl.activeTexture(gl.TEXTURE0 + 3);
                gl.bindTexture(gl.TEXTURE_2D, flames_texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flames_Map);
                
            gl.activeTexture(gl.TEXTURE0 + 4);
            gl.bindTexture(gl.TEXTURE_2D, shimmer_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shimmer_Map);
        }
        //Render background
        if(render_mode == 2) {
            gl.useProgram(program2);
            gl.bindTexture(gl.TEXTURE_2D, background_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, background_Image);
        }
        //Render Fire
        if(render_mode == 3) {
            gl.useProgram(program2);
            gl.bindTexture(gl.TEXTURE_2D, background_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fire_Image);
        }
        //Render shimmer
        if(render_mode == 4) {
            gl.useProgram(program2);
            gl.bindTexture(gl.TEXTURE_2D, background_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flames_Map);
        }
        if(render_mode == 5) {
            gl.useProgram(program2);
            gl.bindTexture(gl.TEXTURE_2D, background_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shimmer_Map);
        }
        //Render sky
        if(render_mode == 6) {
            gl.useProgram(program2);
            gl.bindTexture(gl.TEXTURE_2D, background_texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky_Image);
        }
    }
        
        

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

function spreadFire(fireMap) {

    //const new_image = new ImageData(width, height);

    const offset = pixel_offset_count % pixel_offset;
    pixel_offset_count += pixel_offset_increment;

    for(let row = Math.floor(pixel_offset_count / pixel_offset)%pixel_offset; row < height; row += pixel_offset)
    {
        for(let column = offset; column < width; column += pixel_offset)
        {
            let currentPixel = (row * width + column) * 4;

            //if(background_Image.data[currentPixel] == 192) continue;  //Air pixel

            if(fireMap.data[currentPixel] == 255) {
                //Reduce lifetime of existing fire pixels
                if(fireMap.data[currentPixel + 1] > 0) {
                    if(background_Image.data[currentPixel] == 97) fireMap.data[currentPixel + 1] -= 4;
                    else if(Math.random() > 0.7) fireMap.data[currentPixel + 1] -= 1.0;
                } 
                //Remove fire after lifetime
                if(fireMap.data[currentPixel + 1] <= 0) {
                    setPixel(fireMap, column, row, 0, 0, 0, 0);
                    burnMaterial(column, row);
                }

                //Spread fire to other pixels
                let odds;
                if(background_Image.data[currentPixel] == 34) odds = wood_odds;
                if(background_Image.data[currentPixel] == 97) odds = grass_odds;

                if(Math.random() > odds) lightPixelOnFire(fireMap, column-1, row);
                if(Math.random() > odds) lightPixelOnFire(fireMap, column+1, row);
                if(Math.random() > odds) lightPixelOnFire(fireMap, column, row-1);
                if(Math.random() > odds) lightPixelOnFire(fireMap, column, row+1);
            }

        }
    }

    return fireMap;
}

function lightPixelOnFire(fireMap, x, y) {

    let currentPixel = (x + y * width) * 4;

    if(background_Image.data[currentPixel] == 192) return; //Air pixel
    if(background_Image.data[currentPixel] == 20) return; //burnt wood
    if(background_Image.data[currentPixel] == 70) return; //burnt grass


    if(fireMap.data[currentPixel] == 255) return; //Already on fire
    //TODO prevent burned pixels

    setPixel(fireMap, x, y, 255, 255, 0, 255);
}

function burnMaterial(x,y) {

    //Wood
    if(background_Image.data[(x + y * width) * 4] == 34) {
        setPixel(background_Image, x, y, 20, 20, 20, 255);
    }

    //Grass
    if(background_Image.data[(x + y * width) * 4] == 97) {
        setPixel(background_Image, x, y, 70, 70, 70, 255);
    }
}

function generateFlameShimmerMap(fire) {

    const flames = new ImageData(width, height);
    const shimmer = new ImageData(width, height);

    const max_Height = Math.max(flames_Height, shimmer_Height);

    //Alpha dropoff
    const shimmer_dropoff = Math.floor(255 / shimmer_Height);
    const flames_dropoff = Math.floor(255 / flames_Height);

    for(let row = 0; row < height; row += 1)
    {
        for(let column = 0; column < width; column += 1)
        {
            let currentPixel = (row * width + column) * 4;
            if(fire.data[currentPixel] == 255)
            {
                flames.data[currentPixel+0] = 0;
                flames.data[currentPixel+1] = 0;
                flames.data[currentPixel+2] = 0;
                flames.data[currentPixel+3] = 0;

                shimmer.data[currentPixel+0] = 0;
                shimmer.data[currentPixel+1] = 0;
                shimmer.data[currentPixel+2] = 0;
                shimmer.data[currentPixel+3] = 0;

                for(let i = 1; i < shimmer_Height; i++)
                {
                    shimmer.data[currentPixel + shimmer.width * 4 * i] = 255;
                    shimmer.data[currentPixel + shimmer.width * 4 * i + 1] = 255 - i * shimmer_dropoff;
                    shimmer.data[currentPixel + shimmer.width * 4 * i + 2] = 255;
                    shimmer.data[currentPixel + shimmer.width * 4 * i + 3] = 255;
                }

                for(let i = 1; i < flames_Height; i++)
                {
                    flames.data[currentPixel + fire.width * 4 * i] = 255;
                    flames.data[currentPixel + fire.width * 4 * i + 1] = 255 - i * flames_dropoff;
                    flames.data[currentPixel + fire.width * 4 * i + 2] = 255;
                    flames.data[currentPixel + fire.width * 4 * i + 3] = 255;
                }
            }
        }
    }

    return [flames, shimmer];
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
    
    setPixel(imageData, x, y, 255, 255, 0, 255);
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

addEventListener('mousedown', (event) => {
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
});

//Get number press on keyboard
addEventListener('keydown', (event) => {
    if(event.key == '1') render_mode = 1;
    if(event.key == '2') render_mode = 2;
    if(event.key == '3') render_mode = 3;
    if(event.key == '4') render_mode = 4;
    if(event.key == '5') render_mode = 5;

    if(event.key == '9') pause_shaders = !pause_shaders;
    if(event.key == '0') pause_simulation = !pause_simulation;
});

//Function only used for the given test function
function reformat_input(image)
{
    const new_image = new ImageData(width, height);

    //Make black and white
    for(let row = 0; row < height; row++)
    {
        for(let column = 0; column < width; column++)
        {
            let currentPixel = (row * width + column) * 4;
            new_image.data[currentPixel + 0] = image.data[currentPixel + 0];
            new_image.data[currentPixel + 1] = image.data[currentPixel + 0];
            new_image.data[currentPixel + 2] = image.data[currentPixel + 0];
            new_image.data[currentPixel + 3] = 255;
        }
    }

    //Remove aliasing
    for(let row = 0; row < height; row++)
    {
        for(let column = 0; column < width; column++)
        {
            let currentPixel = (row * width + column) * 4;
            if(new_image.data[currentPixel + 0] >= 190)
            {
                new_image.data[currentPixel + 0] = 192;
                new_image.data[currentPixel + 1] = 192;
                new_image.data[currentPixel + 2] = 192;
            }
            else if(new_image.data[currentPixel + 0] >= 90)
            {
                new_image.data[currentPixel + 0] = 97;
                new_image.data[currentPixel + 1] = 97;
                new_image.data[currentPixel + 2] = 97;
            }
            else 
            {
                new_image.data[currentPixel + 0] = 34;
                new_image.data[currentPixel + 1] = 34;
                new_image.data[currentPixel + 2] = 34;
            }
        }
    }

    return new_image;
}