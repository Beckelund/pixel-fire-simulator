//Util
import { setPixel } from "../util/setPixel.js";

function generateSky(width, height)
{
    if(width == undefined || height == undefined) console.error("generateSky() requires width and height parameters");
    
    const sky = new ImageData(width, height);

    //Blue sky
    for(let row = 0; row < height; row++)
    {
        for(let column = 0; column < width; column++)
        {
            let currentPixel = (row * width + column) * 4;
            
            setPixel(sky, column, row, 20, 20, 200 * (height - row)/height + 20, 255);
        }
    }

    //Stars
    const starCount = 50;
    for(let i = 0; i < starCount; i++)
    {
        let column = Math.floor(Math.random() * width);
        let row = Math.floor(Math.random() * height);
        let color = Math.floor(Math.random() * 255);
        
        setPixel(sky, column, row, 255, 255, 255, 255);
        setPixel(sky, column + 1, row, 255, 255, 255, 255);
        setPixel(sky, column - 1, row, 255, 255, 255, 255);
        setPixel(sky, column, row + 1, 255, 255, 255, 255);
        setPixel(sky, column, row - 1, 255, 255, 255, 255);

    }

    //make noise
    for(let row = 0; row < height; row++)
    {
        for(let column = 0; column < width; column++)
        {
            let currentPixel = (row * width + column) * 4;

            let noise = Math.floor(Math.random()*5);
            sky.data[currentPixel + 0] = sky.data[currentPixel + 0] + noise;
            sky.data[currentPixel + 1] = sky.data[currentPixel + 1] + noise;
            sky.data[currentPixel + 2] = sky.data[currentPixel + 2] + noise;
        }
    }



    return sky;
}

export { generateSky }