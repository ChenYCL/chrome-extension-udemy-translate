import axios from 'axios';
import qs from 'qs';
import md5 from 'md5';
import { getItem } from './localStorage';
import translate from 'google-translate-open-api';
import { deeplSupportSource } from "../../../constant";

export const youdaoRequset = async (text) => {
    let key = '';
    let id = '';
    let salt = await new Date().getTime();
    let language = await getItem('language');
    let from = await getItem('origin_lang');

    await getItem('trans_api').then((trans_api) => {
        key = trans_api['youdao']['key'];
        id = trans_api['youdao']['id'];
    });

    const data = {
        q: text,
        appKey: id,
        salt: salt,
        from: from,
        to: language === 'zh-cn' ? 'zh-CHS' : language,
        sign: md5(id + text + salt + key),
    };

    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'https://openapi.youdao.com/api',
    };

    const res = await axios(options);
    const [origin, translate] = [res.data.query, res['data']['translation'][0]];
    return { origin, translate };
};

export const googleTranslate = async (text) => {
    const language = await getItem('language');
    return translate(text, {
        tld: 'cn',
        to: language === 'zh' ? 'zh-CN' : language,
        browers: true,
    });
};

export const baiduRequest = async (text) => {
    let key = '';
    let id = '';
    let salt = await new Date().getTime();
    let language = await getItem('language');
    let from = await getItem('origin_lang');

    await getItem('trans_api').then((trans_api) => {
        key = trans_api['baidu']['key'];
        id = trans_api['baidu']['id'];
    });

    const params = {
        q: text,
        appid: id,
        salt: salt,
        from: from,
        to: language === 'zh-cn' ? 'zh' : language,
        sign: md5(id + text + salt + key),
    };

    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(params),
        url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    };

    let res = await axios(options);
    const { src, dst } = res.data.trans_result[0];

    if (dst !== '' && dst !== ' ' && dst !== undefined) {
        return {
            origin: text,
            translate: dst,
        };
    }
};

export const yandexRequest = async (text) => {
    let key = null;
    await getItem('trans_api').then((trans_api) => {
        key = trans_api['yandex']['id'];
    });

    let language = await getItem('language');
    let from = await getItem('origin_lang');
    from = from === 'auto' ? '' : from + '-';

    const params = {
        lang: from + (language === 'zh-cn' ? 'zh' : language),
        text,
        key,
    };

    const opt = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(params),
        url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
    };

    let res = await axios(opt);

    if (res.data.code === 200) {
        return {
            origin: text,
            translate: res.data.text[0],
        };
    } else {
        return {
            origin: text,
            translate: '接口配置错误',
        };
    }
};

export const deepLRequest = async (text) => {
    let language = await getItem('language');
    let from = await getItem('origin_lang');
    let key = '';

    await getItem('trans_api').then((trans_api) => {
        key = trans_api['deepl']['key'];
    });

    const data = {
        auth_key: key,
        text,
        source_lang: from,
        target_lang: 'zh-cn' ? 'ZH' : language.toUpperCase(),
    }

    if (deeplSupportSource.indexOf(String.prototype.toUpperCase.call(from)) === -1) {
        delete data.source_lang
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'https://api.deepl.com/v2/translate'
    }

    let res = await axios(options);

    if (res.status === 200) {
        const translatedText =
            res.data.translations && res.data.translations[0] && res.data.translations[0].text ?
            res.data.translations[0].text : '翻译失败'
        return {
            origin: text,
            translate: translatedText,
        };
    } else {
        return {
            origin: text,
            translate: '接口配置错误',
        };
    }
}

// @api: https://a-translator.royli.dev/
// @reference: https://www.v2ex.com/t/730356
// @wiki: https://www.notion.so/geekdada/8119484f98c74e989c0837f89e38a295?v=f57df852e6194f36bc5a0ea9cfc6c4a0
export const a_translatorRequest = async (text) => {
    let language = await getItem('language');
    let from = await getItem('origin_lang');
    let key = '';

    await getItem('trans_api').then((trans_api) => {
        key = trans_api['a_translator']['key'];
    });

    const data = {
        auth_key: key,
        text,
        source_lang: from,
        target_lang: 'zh-cn' ? 'ZH' : language.toUpperCase(),
    }

    if (deeplSupportSource.indexOf(String.prototype.toUpperCase.call(from)) === -1) {
        delete data.source_lang
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'https://a-translator-api.nerdynerd.org/v2/translate'
    }

    let res = await axios(options);

    if (res.status === 200) {
        const translatedText =
            res.data.translations && res.data.translations[0] && res.data.translations[0].text ?
                res.data.translations[0].text : '翻译失败'
        return {
            origin: text,
            translate: translatedText,
        };
    } else {
        return {
            origin: text,
            translate: '接口配置错误',
        };
    }
}
