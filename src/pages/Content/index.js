import { printLine } from './modules/print';
import './modules/utils';

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
    require('../Content/modules/udemy.js');
    // import（xx）.then(v=>v)
    break;
  case 'netflix':
    require('../Content/modules/netflix.js');
    break;
  case 'lynda':
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

