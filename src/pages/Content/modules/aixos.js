import axios from 'axios';
import qs from 'qs';
import md5 from 'md5';
import { getItem } from './localStorage';
import translate from 'google-translate-open-api';

export const youdaoRequset = async(text) => {
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

export const googleTranslate = async(text) => {
    const language = await getItem('language');
    return translate(text, {
        tld: 'cn',
        to: language === 'zh' ? 'zh-CN' : language,
        browers: true,
    });
};

export const baiduRequest = async(text) => {
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

export const yandexRequest = async(text) => {
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

// new version
export const deeplRequest = async(text) => {};