// Imports all weather icons for night and day and store them in objects called nightImages and dayImages respectively.

function importImgs(r) {
    let images = {}
    r.keys().map((item) => {
        images[item.replace('./', '')] = r(item)
    })

    return images
}

const dayImages = importImgs(require.context(`../asset/weather/64x64/day`, false, /\.png$/))

const nightImages = importImgs(require.context(`../asset/weather/64x64/night`, false, /\.png$/))

export { dayImages, nightImages }
