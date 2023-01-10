function setPixelprevious(image, x, y, r, g, b, a)
{
    //const width = 640;
    //const height = 480;

    let currentPixel = (x + y * image.width) * 4;

    //return if out of bounds
    if(x < 0 || x >= image.width || y < 0 || y > image.height) return;



    image.data[currentPixel + 0] = r;
    image.data[currentPixel + 1] = g;
    image.data[currentPixel + 2] = b;
    image.data[currentPixel + 3] = a;
}


function setPixel(image, x, y, r, g, b, a)
{
    //const width = 640;
    //const height = 480;

    let currentPixel = (x + y * image.width) * 4;

    //return if out of bounds
    //if(x < 0 || x >= image.width || y < 0 || y > image.height) return;
    //if((x >= 0 && x < image.width && y >= 0 && y <= image.height) == false) return;
    if(x < 0 || x >= image.width) return;


    image.data[currentPixel + 0] = r;
    image.data[currentPixel + 1] = g;
    image.data[currentPixel + 2] = b;
    image.data[currentPixel + 3] = a;
}

export { setPixel }