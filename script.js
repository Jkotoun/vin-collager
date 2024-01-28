//upload images

const image1Input = document.getElementById('image1');
const image2Input = document.getElementById('image2');

let image1Loaded = false;
let image2Loaded = false;
let images = []
const settingsElement = document.getElementById("settings");

image1Input.addEventListener('change', () => {
    const file = image1Input.files[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
        img.src = e.target.result;
        if (image1Loaded) {
            images.shift();
            images.unshift(img);
            init();

        }
        else {
            images.push(img);
            image1Loaded = true;
            if (image2Loaded) {
                settingsElement.style.display = "block";
                init();

            }
        }
    };
    reader.readAsDataURL(file);
});

image2Input.addEventListener('change', () => {
    const file = image2Input.files[0];
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
        if (image2Loaded) {

            images.pop();
            images.push(img);
            init();
        }
        else {
            images.push(img);
            image2Loaded = true;
            if (image1Loaded) {
                init();
                settingsElement.style.display = "block";
            }
        }
    };

    reader.readAsDataURL(file);
});
 

//render mosaic to canvas
function createMosaic(images, numRows, numCols, ratio, randomized = false, mode = 'rectangles') {
    const canvas = document.getElementById('combinedCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const blockWidth = width / numCols;
    const blockHeight = height / numRows;
    //iterate through image grid
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let img;
            //for randomized, sample image one and two
            if (randomized) {
                const probability = Math.random();
                img = probability <= ratio ? images[0] : images[1];

            } else {
                img = (row + col) % 2 === 0 ? images[0] : images[1];
            }

            //source image coordinates
            const sourceX = col * (img.width / numCols);
            const sourceY = row * (img.height / numRows);
            const sourceWidth = img.width / numCols;
            const sourceHeight = img.height / numRows;

            //destination image coordinates
            const destX = col * blockWidth;
            const destY = row * blockHeight;
            const destWidth = blockWidth;
            const destHeight = blockHeight;
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);


            if (['triangles', 'triangles-reversed'].includes(mode)) {
                let img2;
                if (randomized){
                    const probability = Math.random();
                    img2 = probability <= ratio ? images[0] : images[1];
                }
                else{
                    img2 = (row + col) % 2 === 0 ? images[1] : images[0];
                }
                //source image coordinates for second triangle
                const source2X = col * (img2.width / numCols);
                const source2Y = row * (img2.height / numRows);
                const source2Width = img2.width / numCols;
                const source2Height = img2.height / numRows;
                ctx.save()
                ctx.beginPath();
                if (mode === 'triangles') {
                    ctx.moveTo(col * blockWidth, row * blockHeight);
                    ctx.lineTo((col + 1) * blockWidth, row * blockHeight);
                    ctx.lineTo(col * blockWidth, (row + 1) * blockHeight);
                }
                else {
                    ctx.moveTo(col * blockWidth, row * blockHeight);
                    ctx.lineTo((col + 1) * blockWidth, row * blockHeight);
                    ctx.lineTo((col + 1) * blockWidth, (row + 1) * blockHeight);
                }
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img2, source2X, source2Y, source2Width, source2Height, destX, destY, destWidth, destHeight);
                ctx.restore();
            }
        }
    }
}

//set event listeners
function init() {
    const imageRatioInput = document.getElementById('imageRatio');
    const ratioValueSpan = document.getElementById('ratioValue');

    const imageRatioSliderContainer = document.getElementById('imgRatioSliderContainer');
    const regenerateButton = document.getElementById('re-generate');
    const numRowsInput = document.getElementById('numRows');
    const numRowsValueSpan = document.getElementById('numRowsValue');

    const numColsInput = document.getElementById('numCols');
    const numColsValueSpan = document.getElementById('numColsValue');

    const randomizeYesInput = document.getElementById('randomizeYes');
    const randomizeNoInput = document.getElementById('randomizeNo');

    const swapYesInput = document.getElementById('swapYes');
    const swapNoInput = document.getElementById('swapNo');

    const trianglesInput = document.getElementById('triangles');
    const rectanglesInput = document.getElementById('rectangles');
    const trianglesReversedInput = document.getElementById('triangles-reversed');

    function updateMosaic() {
        const ratio = parseFloat(imageRatioInput.value);
        const numRows = parseInt(numRowsInput.value);
        const numCols = parseInt(numColsInput.value);
        const randomized = randomizeYesInput.checked;
        const mode = trianglesInput.checked ? 'triangles' : (trianglesReversedInput.checked ? 'triangles-reversed' : 'rectangles');
        createMosaic(images, numRows, numCols, ratio, randomized, mode);
    }

    trianglesInput.addEventListener('change', () => {
        updateMosaic();
    });

    regenerateButton.addEventListener('click', () => {
        updateMosaic();
    });

    rectanglesInput.addEventListener('change', () => {
        updateMosaic();
    });

    swapNoInput.addEventListener('change', () => {
        const temp = images[0];
        images[0] = images[1];
        images[1] = temp;
        updateMosaic();

    });

    swapYesInput.addEventListener('change', () => {
        const temp = images[0];
        images[0] = images[1];
        images[1] = temp;
        updateMosaic();
    });

    trianglesReversedInput.addEventListener('change', () => {
        updateMosaic();
    });

    imageRatioInput.addEventListener('input', () => {
        const ratio = parseFloat(imageRatioInput.value);
        ratioValueSpan.textContent = (ratio * 100).toFixed(0) + "% : " + ((1 - ratio) * 100).toFixed(0) + "%";
        updateMosaic();
    });

    numRowsInput.addEventListener('input', () => {
        const numRows = parseInt(numRowsInput.value);
        numRowsValueSpan.textContent = numRows;
        updateMosaic();
    });

    numColsInput.addEventListener('input', () => {
        const numCols = parseInt(numColsInput.value);
        numColsValueSpan.textContent = numCols;
        updateMosaic();
    });

    randomizeYesInput.addEventListener('change', () => {
        if (randomizeYesInput.checked) {
            imageRatioSliderContainer.style.display = 'block';

        } else {
            imageRatioSliderContainer.style.display = 'none';
        }
        updateMosaic();
    });

    randomizeNoInput.addEventListener('change', () => {
        if (randomizeYesInput.checked) {
            imageRatioSliderContainer.style.display = 'block';
        } else {
            imageRatioSliderContainer.style.display = 'none';
        }
        updateMosaic();
    });

    const canvas = document.getElementById('combinedCanvas');
    const canvasDownloadLink = document.getElementById('canvasDownload');

    canvasDownloadLink.addEventListener('click', () => {
        const pngDataUrl = canvas.toDataURL('image/png');
        canvasDownloadLink.href = pngDataUrl;

    });
}
