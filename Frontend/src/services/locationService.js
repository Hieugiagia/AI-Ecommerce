import { validateDivisions } from './locationModel.js';
let promise;
export function loadDivisions() {
  if (!promise) promise=fetch('/data/vietnam-divisions.json').then(async response=>{
    if(!response.ok)throw new Error('Không tải được danh sách tỉnh/thành.');
    return validateDivisions(await response.json());
  }).catch(error=>{promise=null;throw error;});
  return promise;
}
