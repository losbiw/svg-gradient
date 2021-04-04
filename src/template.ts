import { Gradient } from '../interfaces/Gradient.d'

interface Size{
    width: number,
    height: number
}

export const process = (path: string, id: string, gradient: Gradient): string => {
    const { width, height }: Size = extractSize(path);
    const view = extractViewBox(path);
    const filled = addFill(extractPath(path));
    const startColor = '#' + gradient.from;

    const svg = 
        `<svg viewBox="${ view || `0 0 ${width} ${height}` }"
                width="${ width }"
                height="${ height }"
                xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="${ gradient.from }" x1="0%" y1="0%" x2="100%" y2="0%"> 
                    <stop offset="0%" stop-color="${ startColor }"/> 
                    <stop offset="100%" stop-color="${ '#' + gradient.to }"/>
                </linearGradient>
                <mask id="${ id }" maskUnits="userSpaceOnUse" x="0" y="0" width="${ width }" height="${ height }">
                    ${ filled }
                </mask>
            </defs>
            <g mask="${ `url(#${id})` }">
                <rect className="original" x="0" y="0" width="${ width }" height="${ height }" fill="white" />
                <rect className="gradient" x="0" y="0" width="${ width }" height="${ height }" fill="${ `url(${ startColor })` }" />
            </g>
        </svg>`;
    
    const result = svg.replace(/\s\s+/g, " ");    
    return result
}

const extractPath = (path: string): string => {
    const regex = /<(path|circle)\b([\s\S]*?)\/>/g;
    const matches = path.match(regex) || [];
    
    if(matches.length !== 0) {
        path = '';
        matches.forEach(match => path += match);
    }

    return path
}

const extractSize = (svg: string): Size => {
    const width = svg.match(/width="([^"]+)"/);
    const height = svg.match(/height="([^"]+)"/);

    if(width?.[1] && height?.[1]) {
        const size: Size = {
            width: parseInt(width[1]),
            height: parseInt(height[1])
        }

        return size
    }
    else{
        return {
            width: 512,
            height: 512
        } as Size
    }
}

const extractViewBox = (svg: string): string | undefined => {
    const viewBox = svg.match(/viewBox="([^"]+)"/);

    if(viewBox?.[1]) return viewBox[1];
    else return undefined
}

const addFill = (path: string): string => {
    const fill = ' fill="white"/'
    const result = path.replace(/(\/)|(fill=\"(.*?)\"\/)/g, fill);
    
    return result
}