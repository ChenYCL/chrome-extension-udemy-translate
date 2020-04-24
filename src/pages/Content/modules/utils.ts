/*
Utils js
 */

/**
 * replace subtitle to screen
 * @param domClass
 * @param textInfo:object {origin,translate}
 */
export const dealSubtitle = (
  domClass: string,
  request: { origin: string; translate: string }
) => {
  chrome.storage.sync.get(null, (items) => {
    const subtitle = `<div class="SUBTILTE"
    style="
    position: absolute;
    bottom:30px;
    width:100%;
    text-align: center;
    margin: 0 .5em 1em;
    padding: 20px 8px;
    white-space: pre-line;
    writing-mode: horizontal-tb;
    unicode-bidi: plaintext;
    direction: ltr;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    background: ${items['backgroundColor']};
    opacity: ${items['backgroundColor']};
  ">
     <div class="origin_subtitle"
      style="
          color:${items['origin_color']} !important;
          font-weight:${items['origin_weight']} !important;
          font-size:${items['origin_font']}px !important;;
      "
     >${request.origin}</div>
      <div class="translate_subtitle"
      style="
          color: ${items['trans_color']} !important;
          font-weight:${items['trans_weight']} !important;
          font-size: ${items['trans_font']}px !important;
      "
      >${request.translate}</div>
  </div>`;
    let hasSubtitleDom = $('div.SUBTILTE').length === 0;
    if (hasSubtitleDom) {
      $(domClass).after(subtitle);
    } else {
      $('div.SUBTILTE').remove();
      $(domClass).after(subtitle);
    }
  });
};

export function win() {
  window['listStyle'] = [];
}

/**
 * hidden subtitle function
 * @param hideClassName
 */
export const hiddenSubtitleCssInject = (hideClassName: string[]) => {
  let css = '';

  hideClassName.forEach((item) => {
    css += `${hideClassName}{display:none !important} \n`;
  });
  let style = $(`<style id='chrome-extension-plugin-css'>
    ${css}
  </style>`);
  $('body').append(style);
  return style;
  // const head = document.getElementsByTagName('head')[0];
  // const style = document.createElement('style');
  // style.id = 'chrome-extension-plugin-css';
  // style.appendChild(document.createTextNode(css));
  // head.appendChild(style);
};
