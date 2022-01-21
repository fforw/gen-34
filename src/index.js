import domready from "domready"
import "./style.css"
import getRandomPalette from "./getRandomPalette"
import weightedRandom from "./weightedRandom"
import { canvasRGB } from "stackblur-canvas"
import Color from "./Color";

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

function relativeScreenArea(factor)
{
    const {width, height} = config
    const screenArea = width * height

    return screenArea * factor
}


const randomArea = weightedRandom([
     1, () => relativeScreenArea(0.1),
     2, () => relativeScreenArea(0.02),
     4, () => relativeScreenArea(0.0005),

])
const randomShape = weightedRandom([
    1, () => {

        const { width, height } = config
        const area = randomArea()

        const r = Math.sqrt(area / Math.PI)

        const x = 0|(Math.random() * width)
        const y = 0|(Math.random() * height)


        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arc(x,y,r,0,TAU, true)
        ctx.fill()
    },
    1, () => {

        const { width, height } = config
        const area = randomArea()


        const w = Math.round(Math.pow(area, 0.35 + 0.3 * Math.random()))
        const h = Math.round(area / w)

        const x = Math.random() * width
        const y = Math.random() * height

        ctx.fillRect(Math.round(x - w/2), Math.round(y - h/2), w, h)


    },
])


function autoContrast()
{
    const { width, height } = config
    const imageData = ctx.getImageData(0,0,width, height);

    let min = Infinity, max = -Infinity

    const { data } = imageData

    let off = 0
    for (let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            const r = data[off    ]
            const g = data[off + 1]
            const b = data[off + 2]

            min = Math.min(min, r)
            min = Math.min(min, g)
            min = Math.min(min, b)

            max = Math.max(max, r)
            max = Math.max(max, g)
            max = Math.max(max, b)
            off += 4
        }
    }

    const delta = max - min;
    off = 0
    for (let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            data[off    ] = (data[off    ] - min) * 255 / delta
            data[off + 1] = (data[off + 1] - min) * 255 / delta
            data[off + 2] = (data[off + 2] - min) * 255 / delta
            off += 4
        }
    }

    ctx.putImageData(imageData, 0, 0)
}


domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;


        const paint = () => {
            const palette = getRandomPalette()

            ctx.fillStyle = palette[0 | Math.random() * palette.length];
            ctx.fillRect(0, 0, width, height);

            const count = 66;
            for (let i = 0; i < count*2/3; i++)
            {
                ctx.fillStyle = palette[0 | Math.random() * palette.length];
                randomShape();
            }
            canvasRGB(canvas, 0, 0, width, height, 200)
            autoContrast()
            for (let i = 0; i < count/3; i++)
            {
                ctx.fillStyle = Color.from( palette[0 | Math.random() * palette.length]).toRGBA(0.15);
                randomShape();
            }
        };


        paint();

        canvas.addEventListener("click", paint, true)
    }
);
