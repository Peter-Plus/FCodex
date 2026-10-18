import fs from 'node:fs/promises';
export async function fadePort(){
 let value=process.env.FADE_PORT;
 if(!value){try{value=JSON.parse((await fs.readFile(new URL('../.fade-session.json',import.meta.url),'utf8')).replace(/^\uFEFF/,'')).port}catch{value=19222}}
 const port=Number(value);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid Fade debug port');return port;
}
