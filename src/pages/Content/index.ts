import { printLine } from './modules/print.js';

const hrefMap = {
  udemy: 'udemy',
  netflix: 'netflix',
  lynda: 'lynda',
  hulu: 'hulu',
  amazon: 'amazon',
  hbo: 'hbo',
};

const whatsPage = (href) => {
  for (let key in hrefMap) {
    if (href.includes(key)) {
      return hrefMap[key];
    }
  }
};

console.log('%c 当前视频页面类型:', 'background:red;color:white', whatsPage(window.location.href));

switch (whatsPage(window.location.href)) {
  case 'udemy':
    require('./modules/udemy.ts');
    break;
  case 'netflix':
    require('./modules/netflix.ts');
    break;
  case 'lynda':
    require('./modules/lynda.ts');
    break;
  case 'hulu':
    break;
  case 'amazon':
    break;
  case 'hbo':
    break;
}

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine('Using a function from the Print Module');

