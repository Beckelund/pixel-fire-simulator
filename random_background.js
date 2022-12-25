

function getRandomImage(width = 640, height = 480) {

    const imageData = new ImageData(width, height);

    for(let i = 0; i < imageData.data.length; i += 4) {
        let bw = (Math.random() * 255 > 254) ? 255 : 0;
        imageData.data[i + 0] = bw;
        imageData.data[i + 1] = bw;
        imageData.data[i + 2] = bw;
        imageData.data[i + 3] = 255;
    }

    return imageData;
};

export { getRandomImage}