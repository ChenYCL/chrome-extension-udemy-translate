const $ = require('jquery')

export {
    $
}


export const getItem = (key: string) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (value) => {
            resolve(value[key])
        })
    })
}





/**
 * replace subtitle to screen
 * @param domClass
 * @param textInfo:object {origin,translate}
 */
export const dealSubtitle = (
    domClass: string,
    request: { origin: string; translate: string }
) => {
    chrome.storage.local.get(null, (items) => {
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
      opacity: ${items['backgroundOpacity']};
    ">
       <div class="origin_subtitle"
        style="
            color:${items['originColor']} !important;
            font-weight:${items['originWeight']} !important;
            font-size:${items['originFont']}px !important;;
        "
       >${request.origin}</div>
        <div class="translate_subtitle"
        style="
            color: ${items['transColor']} !important;
            font-weight:${items['transWeight']} !important;
            font-size: ${items['transFont']}px !important;
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
    // @ts-ignore
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

    // const head = document.getElementsByTagName('head')[0];
    // const style = document.createElement('style');
    // style.id = 'chrome-extension-plugin-css';
    // style.appendChild(document.createTextNode(css));
    // head.appendChild(style);
};



export function loadCssCode(id: string, code: string) {
    var style = document.createElement('style')
    style.type = 'text/css'
    // @ts-ignore
    style.rel = 'stylesheet'
    style.id = id
    try {
        //for Chrome Firefox Opera Safari
        style.appendChild(document.createTextNode(code))
    } catch (ex) {
        //for IE
        // @ts-ignore
        style.styleSheet.cssText = code
    }
    var head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
}

export function injectCss(domClass = '.well--container--2edq4') {
    if(typeof domClass === 'string'){
        if (document.querySelector(domClass) && document.querySelector(domClass)!.classList?.value.split(' ').map(c => '.' + c).includes(domClass)) {
            document.querySelector(domClass)!.className += ' __web-inspector-hide-shortcut__'
        }
    }else{
        /// dom object 
        // @ts-ignore
        if(domClass && !domClass.classList.value!.split(' ').includes('__web-inspector-hide-shortcut__')){
            //@ts-ignore
            domClass.className += ' __web-inspector-hide-shortcut__'
        }
    }
 
    if (!document.querySelector('style[id=chrome-extension-plugin-css]')) {
        loadCssCode('chrome-extension-plugin-css', '.__web-inspector-hide-shortcut__, .__web-inspector-hide-shortcut__ *, .__web-inspector-hidebefore-shortcut__::before, .__web-inspector-hideafter-shortcut__::after { display: none !important; }')
    }
}


export async function delayInjectCss(dom = '.well--container--2edq4') {
    let plugin_status = await getItem('status');
    if (plugin_status) {
        let _timer = setInterval(function () {
            injectCss(dom)
            if (document.querySelector('style[id=chrome-extension-plugin-css]')) {
                clearInterval(_timer)
            }
        }, 2000)
    } else {
        document.querySelector('style[id=chrome-extension-plugin-css]')?.remove();
        document.querySelector('.SUBTILTE')?.remove();
    }
}

export function getOriginText(dom = '.well--container--2edq4') {
    try {
        let obj_text = '';
        if(typeof dom === 'string'){
            obj_text = document.querySelector(dom) ? document.querySelector<HTMLElement>(dom)!.innerText : ''
        }else{
            // @ts-ignore
            obj_text = dom.innerText ? dom.innerText : ''
        }
        if (obj_text !== undefined) {
            obj_text = obj_text.replace('<br>', ' ').replace(/\n/g, ' ')
        }
        return obj_text;
    } catch (err) {
        return ''
    }
}