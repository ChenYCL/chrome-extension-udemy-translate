import axios from 'axios';
import qs from 'qs';
import md5 from 'md5';
import { getItem, setItem } from './localStorage';
import translate from 'google-translate-open-api';


export const youdaoRequset = async (text) => {
  let key = '';
  let id = '';
  let origin = '';
  let translate = '';
  let salt = await (new Date()).getTime();
  let language = await getItem('language');

  await getItem('trans_api').then(trans_api => {
    key = trans_api['youdao']['key'];
    id = trans_api['youdao']['id'];
  });

  const data = {
    q: text,
    appKey: id,
    salt: salt,
    from: 'auto',
    to: language,
    sign: md5(id + text + salt + key),
  };

  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: 'https://openapi.youdao.com/api',
  };

  let res = await axios(options);
  [origin, translate] = [res.data.query, res['data']['translation'][0]];
  return { origin, translate };
};

export const googleTranslate = async (text)=>{
  const language = await getItem('language');
  return translate(text, {
    tld: 'cn',
    to: language === 'zh' ? 'zh-CN' : language,
    browers: true,
  });
};


