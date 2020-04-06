/*
Utils js
 */

/**
 * replace subtitle to screen
 * @param domClass
 * @param textInfo:object {origin,translate}
 */
export const dealSubtitle = (domClass:string,textInfo:{origin:string,translate:string})=>{

}

/**
 * hidden subtitle function
 * @param hideClassName
 */
export const hiddenSubtitleCssInject = (hideClassName:string[])=>{
  let css = '';
  hideClassName.forEach(item=>{
    css +=  `${hideClassName}{display:none !important} \n`
  });
  const head = document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.id = 'chrome-extension-plugin-css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}