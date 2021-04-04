import { Gradient } from './Gradient.d'

export default interface Config {
    base: string,
    outDir: string,
    directories: string[],
    gradient: Gradient,
    custom: {
        [key: string]: {
            [key: string]: Custom
        }
    }
}

interface Custom {
    origin?: string,
    gradient: Gradient
}