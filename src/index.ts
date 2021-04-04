import * as path from 'path';
import * as oldfs from 'fs';
import * as template from './template'
import isSvg from 'is-svg';
import { promises as fs } from 'fs';

import Config from '../interfaces/Config.d';
import { Gradient } from '../interfaces/Gradient';

const main = async(): Promise<void> => {
    const { base, outDir, gradient, directories: nested, custom: customIcons } = getConfig();
    const exists = await fs.stat(base);
    let directories = nested;

    if(exists.isDirectory()) {
        if(!oldfs.existsSync(outDir)) await fs.mkdir(outDir);
        if(!nested) directories = [''];

        for(const directory of directories){
            const customGroup = customIcons[directory];
            const dir = path.join(base, directory);
            const outPath = path.join(outDir, directory);

            const fileList = oldfs.readdirSync(dir);

            if(!oldfs.existsSync(outPath)) await fs.mkdir(outPath);
            
            if(customGroup) {
                for(const custom in customGroup) {
                    const index = fileList.indexOf(custom);

                    if(index > 0) {
                        fileList.splice(index, 1);
                    }
                    
                    const { origin, gradient: customGradient } = customGroup[custom];

                    const { file: filePath } = resolvePaths(dir, outPath, origin || custom);
                    const { output } = resolvePaths(dir, outPath, custom);

                    convertSvg(filePath, output, customGradient);
                }
            }

            for(const file of fileList) {
                const { file: filePath, output } = resolvePaths(dir, outPath, file);
                convertSvg(filePath, output, gradient);
            }
        }
    }
    else if(exists.isFile()) { //change nahui
        const outName = path.basename(base);
        const resultPath = path.join(__dirname, '../', outName);
        const { file, output } = resolvePaths(base, resultPath, '');

        convertSvg(file, output, gradient);
    }
}

const convertSvg = (filePath: string, output: string, gradient: Gradient) => {
    const { name, ext } = path.parse(filePath);
    const content = readSvg(filePath, ext);

    if(content instanceof Error) {
        console.error(content.message);
    }
    else {
        const svg = template.process(content, name, gradient);
        fs.writeFile(output, svg, 'utf-8');
    }
}

const readSvg = (filePath: string, ext: string): string | Error => {
    if(ext === '.svg') {
        const content = oldfs.readFileSync(filePath, 'utf-8');

        if(isSvg(content)) return content
        else return Error('The file does not contain an svg markup');
    }
    else return Error('The file is not of ".svg" extension');
}

const resolvePaths = (base: string, outDir: string, name: string) => {
    const file = path.resolve(base, name);
    const output = path.resolve(outDir, name);

    return {
        file,
        output
    }
}

const getConfig = (): Config => {
    const cfgPath = path.join(__dirname, '../config.json');
    const rawConfig = oldfs.readFileSync(cfgPath, 'utf-8');

    return JSON.parse(rawConfig) as Config;
}

main();