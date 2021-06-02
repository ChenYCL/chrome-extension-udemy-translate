import { printLine } from './modules/print.js';

const hrefMap = {
  udemy: 'udemy',
  netflix: 'netflix',
  linkedin: 'linkedin',
  lynda: 'lynda',
  hulu: 'hulu',
  amazon: 'amazon',
  hbonow: 'hbonow',
  hbomax: 'hbomax',
  primevideo: 'primevideo',
  disneyplus: 'disneyplus',
  paramountplus: 'paramountplus',
};

const whatsPage = (href) => {
  for (let key in hrefMap) {
    if (href.includes(key)) {
      return hrefMap[key];
    }
  }
};

console.log(
  '%c 当前视频页面类型:',
  'background:red;color:white',
  whatsPage(window.location.href),
);

require(`./VideoType/${hrefMap[whatsPage(window.location.href)]}.ts`);

// switch (whatsPage(window.location.href)) {
//   case 'udemy':
//     require('./VideoType/udemy.ts');
//     break;
//   case 'netflix':
//     require('./VideoType/netflix.ts');
//     break;
//   case 'lynda':
//     require('./VideoType/lynda.ts');
//     break;
//   case 'hulu':
//     require('./VideoType/hulu.ts');
//     break;
//   case 'amazon':
//     require('./VideoType/amazon.ts');
//     break;
//   case 'hbo':
//     require('./VideoType/hbo.ts');
//     break;
//   case 'hbomax':
//     require('./VideoType/hbomax.ts');
//     break;
//   case 'primevideo':
//     require('./VideoType/primevideo.ts');
//     break;
//   case 'disneyplus':
//     require('./VideoType/disneyplus.ts');
//   case 'paramountplus':
//     require('./VideoType/paramountplus.ts');
//     break;
// }

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine('Using a function from the Print Module');
