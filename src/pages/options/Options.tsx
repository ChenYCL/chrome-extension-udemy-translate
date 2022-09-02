// 👇️ ts-nocheck ignores all ts errors in the file
// @ts-nocheck

import React, { useEffect } from 'react';
import './index.scss';
import { Card, Input, message, Radio, Select } from 'antd';
import { GithubFilled } from '@ant-design/icons';

const setItem = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({
      [key]: value
    }, function () {
      resolve(true)
    }
    )
  })
}

message.config({
  top: 50,
  duration: 2,
  maxCount: 1,
});

const { Option } = Select;
const languageList = {
  Afrikaans: 'af',
  Albanian: 'sq',
  Amharic: 'am',
  Arabic: 'ar',
  Armenian: 'hy',
  Azerbaijani: 'az',
  Basque: 'eu',
  Belarusian: 'be',
  Bengali: 'bn',
  Bosnian: 'bs',
  Bulgarian: 'bg',
  Catalan: 'ca',
  Cebuano: 'ceb',
  Chichewa: 'ny',
  'Chinese Simplified': 'zh-cn',
  'Chinese Traditional': 'zh-tw',
  Corsican: 'co',
  Croatian: 'hr',
  Czech: 'cs',
  Danish: 'da',
  Dutch: 'nl',
  English: 'en',
  Esperanto: 'eo',
  Estonian: 'et',
  Filipino: 'tl',
  Finnish: 'fi',
  French: 'fr',
  Frisian: 'fy',
  Galician: 'gl',
  Georgian: 'ka',
  German: 'de',
  Greek: 'el',
  Gujarati: 'gu',
  'Haitian Creole': 'ht',
  Hausa: 'ha',
  Hawaiian: 'haw',
  Hebrew: 'iw',
  Hindi: 'hi',
  Hmong: 'hmn',
  Hungarian: 'hu',
  Icelandic: 'is',
  Igbo: 'ig',
  Indonesian: 'id',
  Irish: 'ga',
  Italian: 'it',
  Japanese: 'ja',
  Javanese: 'jw',
  Kannada: 'kn',
  Kazakh: 'kk',
  Khmer: 'km',
  Korean: 'ko',
  'Kurdish (Kurmanji)': 'ku',
  Kyrgyz: 'ky',
  Lao: 'lo',
  Latin: 'la',
  Latvian: 'lv',
  Lithuanian: 'lt',
  Luxembourgish: 'lb',
  Macedonian: 'mk',
  Malagasy: 'mg',
  Malay: 'ms',
  Malayalam: 'ml',
  Maltese: 'mt',
  Maori: 'mi',
  Marathi: 'mr',
  Mongolian: 'mn',
  'Myanmar (Burmese)': 'my',
  Nepali: 'ne',
  Norwegian: 'no',
  Pashto: 'ps',
  Persian: 'fa',
  Polish: 'pl',
  Portuguese: 'pt',
  Punjabi: 'ma',
  Romanian: 'ro',
  Russian: 'ru',
  Samoan: 'sm',
  'Scots Gaelic': 'gd',
  Serbian: 'sr',
  Sesotho: 'st',
  Shona: 'sn',
  Sindhi: 'sd',
  Sinhala: 'si',
  Slovak: 'sk',
  Slovenian: 'sl',
  Somali: 'so',
  Spanish: 'es',
  Sundanese: 'su',
  Swahili: 'sw',
  Swedish: 'sv',
  Tajik: 'tg',
  Tamil: 'ta',
  Telugu: 'te',
  Thai: 'th',
  Turkish: 'tr',
  Ukrainian: 'uk',
  Urdu: 'ur',
  Uzbek: 'uz',
  Vietnamese: 'vi',
  Welsh: 'cy',
  Xhosa: 'xh',
  Yiddish: 'yi',
  Yoruba: 'yo',
  Zulu: 'zu',
};

const Options = () => {
  const [language, setLan] = React.useState('zh');
  const [origin_lang, setOrignLang] = React.useState('auto');
  const [youdao_id, setYouDaoId] = React.useState('');
  const [youdao_key, setYouDaoKey] = React.useState('');
  const [baidu_id, setBaiduId] = React.useState('');
  const [baidu_key, setBaiduKey] = React.useState('');
  const [yandex_key, setYandexKey] = React.useState('');
  const [a_translater_key, setTranslateKey] = React.useState('');
  const [deepl_key, setDeeplKey] = React.useState('');
  const [caiyun_key, setCaiyunKey] = React.useState('');
  const [microsoftTranslate_key, setMicrosoftKey] = React.useState('');
  const [trans_way, setTransway] = React.useState('youdao');

  useEffect(() => {
    chrome.storage.local.get("trans_way", function ({ trans_way }) {
      console.log('tras', trans_way)
      setTransway(trans_way)
    })
    chrome.storage.local.get('language', function ({ language }) {
      setLan(language)
    })
    chrome.storage.local.get('origin_lang', function ({ origin_lang }) {
      setOrignLang(origin_lang)
    })
    chrome.storage.local.get('youdao_id', function ({ youdao_id }) {
      console.log(`youdao_id`, youdao_id)
      setYouDaoId(youdao_id)
    })
    chrome.storage.local.get('youdao_key', function ({ youdao_key }) {
      setYouDaoKey(youdao_key)
    })
    chrome.storage.local.get('baidu_id', function ({ baidu_id }) {
      setBaiduId(baidu_id)
    })
    chrome.storage.local.get('baidu_key', function ({ baidu_key }) {
      setBaiduKey(baidu_key)
    })
    chrome.storage.local.get('yandex_key', function ({ yandex_key }) {
      setYandexKey(yandex_key)
    })
    chrome.storage.local.get('a_translater_key', function ({ a_translater_key }) {
      setTranslateKey(a_translater_key)
    })
    chrome.storage.local.get('deepl_key', function ({ deepl_key }) {
      setDeeplKey(deepl_key)
    })
    chrome.storage.local.get('caiyun_key', function ({ caiyun_key }) {
      setCaiyunKey(caiyun_key)
    })
    chrome.storage.local.get('microsoftTranslate_key', function ({ microsoftTranslate_key }) {
      setMicrosoftKey(microsoftTranslate_key)
    })
  }, [])





  const chooseWay = async (e: any) => {
    console.log(`trans_way ${e.target.value}`);
    setItem('trans_way', e.target.value);
    setTransway(e.target.value)
    await message.success(`当前选中：${e.target.value}`);
  };

  const onChange = async (value: any) => {
    console.log(`selected ${value}`);
    await setItem('language', value);
    setLan(value)
    await message.success(`将翻译为：${value}`);
  };

  const originChoose = async (value: any) => {
    console.log(`selected ${value}`);
    await setItem('origin_lang', value);
    setOrignLang(value)
    await message.success(`切换为：${value}`);
  };

  const onBlur = () => {
    console.log('blur');
  };

  const onFocus = () => {
    console.log('focus');
  };

  const onSearch = (val: any) => {
    console.log('search:', val);
  };





  return (
    <div className="OptionsContainer">
      <Card className="Card" title="ID&Key" bordered={false}>
        <Radio.Group onChange={chooseWay} value={trans_way}>
          <section>
            <Radio value={'youdao'}>有道云API</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="youdao_id"
                onChange={(e) => {
                  setYouDaoId(e.target.value)
                  setItem('youdao_id', e.target.value)
                }}
                placeholder="ID"
                value={youdao_id}
                style={{ width: '400px' }}
              />
              <Input
                name="youdao_key"
                onChange={(e) => {
                  setYouDaoKey(e.target.value)
                  setItem('youdao_key', e.target.value)
                }}
                placeholder="KEY"
                value={youdao_key}
                style={{
                  width: '400px',
                  marginTop: '10px',
                  marginLeft: '10px',
                }}
              />
            </p>
          </section>
          <section>
            <Radio value={'baidu'}>百度云API</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="baidu_id"
                onChange={(e) => {
                  setBaiduId(e.target.value)
                  setItem('baidu_id', e.target.value)
                }}
                placeholder="ID"
                value={baidu_id}
                style={{ width: '400px' }}
              />
              <Input
                name="baidu_key"
                onChange={(e) => {
                  setBaiduKey(e.target.value)
                  setItem('baidu_key', e.target.value)
                }}
                placeholder="KEY/密钥"
                value={baidu_key}
                style={{
                  width: '400px',
                  marginTop: '10px',
                  marginLeft: '10px',
                }}
              />
            </p>
          </section>
          <section>
            <Radio value={'yandex'}>Yandex</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="yandex_key"
                onChange={(e) => {
                  setYandexKey(e.target.value)
                  setItem('yandex_key', e.target.value)
                }}
                placeholder="ID"
                value={yandex_key}
                style={{ width: '400px' }}
              />
              {/*<Input placeholder="KEY" style={{width:'400px',marginLeft:'20px'}}/>*/}
            </p>
          </section>
          <section>
            <Radio value={'deepl'}>Deepl 人工智能API</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="deepl_key"
                onChange={(e) => {
                  setDeeplKey(e.target.value)
                  setItem('deepl_key', e.target.value)
                }}
                placeholder="key"
                value={deepl_key}
                style={{ width: '400px' }}
              />
            </p>
          </section>
          <section>
            <Radio value={'a_translator'}>A tranltator</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="a_translater_key"
                onChange={(e) => {
                  setTranslateKey(e.target.value)
                  setItem('a_translater_key', e.target.value)
                }}
                placeholder="key"
                value={a_translater_key}
                style={{ width: '400px' }}
              />
            </p>
          </section>
          <section>
            <Radio value={'caiyun'}>彩云</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="caiyun_key"
                onChange={(e) => {
                  setCaiyunKey(e.target.value)
                  setItem('caiyun_key', e.target.value)
                }}
                placeholder="密钥"
                value={caiyun_key}
                style={{ width: '400px' }}
              />
            </p>
          </section>
          <section>
            <Radio value={'microsofttranslate'}>Azure Cognitive Services</Radio>
            <p style={{ padding: '15px' }}>
              <Input
                name="microsoftTranslate_key"
                onChange={(e) => {
                  setMicrosoftKey(e.target.value)
                  setItem('microsoftTranslate_key', e.target.value)
                }}
                placeholder="密钥"
                value={microsoftTranslate_key}
                style={{ width: '400px' }}
              />
            </p>
          </section>
        </Radio.Group>
      </Card>
      <Card className="Card" title="Origin Language/原字幕" bordered={false}>
        <p>Origin Language</p>
        <Select
          value={origin_lang}
          showSearch
          style={{ width: 400 }}
          placeholder="Select origin language"
          optionFilterProp="children"
          onChange={originChoose}
          onSearch={onSearch}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option key={1} value={'auto'}>
            自动识别
          </Option>
          <Option key={2} value={'ja'}>
            Japanese
          </Option>
          <Option key={3} value={'ko'}>
            Korean
          </Option>
        </Select>
      </Card>
      <Card className="Card" title="Subtitle/字幕" bordered={false}>
        <p>Translate to </p>
        <Select
          value={language}
          showSearch
          style={{ width: 400 }}
          placeholder="Select a language translate"
          optionFilterProp="children"
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onSearch={onSearch}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {Object.entries(languageList).map((item) => (
            <Option key={item[1]} value={item[1]}>
              {item[0]}
            </Option>
          ))}
        </Select>
      </Card>

      <Card className="Card" title="About Api/Api注册" bordered={false}>
        <a
          href="https://fanyi-api.baidu.com/api/trans/product/desktop"
          target="__blank"
        >
          百度API
        </a>
        &nbsp;&nbsp;
        <a href="https://ai.youdao.com/index.s" target="__blank">
          有道云API
        </a>
        &nbsp;&nbsp;
        <a
          href="https://translate.yandex.com/developers/keys"
          target="__blank"
        >
          Yandex
        </a>
        &nbsp;&nbsp;
        <a href="https://www.deepl.com/" target="__blank">
          deepl
        </a>
        &nbsp;&nbsp;
        <a href="https://a-translator.royli.dev/" target="__blank">
          a-translator
        </a>
        &nbsp;&nbsp;
        <a href="https://dashboard.caiyunapp.com/user/sign_in/" target="__blank">
          彩云
        </a>
        &nbsp;&nbsp;
        <a href="https://docs.microsoft.com/zh-cn/azure/cognitive-services/Translator/quickstart-translator?tabs=csharp" target="__blank">
          Azure Cognitive Services
        </a>
      </Card>
      <Card
        className="Card"
        title="字幕下载/Subtile Download"
        bordered={false}
      >
        <p>实验功能</p>
      </Card>

      <Card className="Card" title="关于" bordered={false}>
        <p>
          如果觉得不错，👏star{' '}
          <a
            href="https://github.com/ChenYCL/chrome-extension-udemy-translate"
            target="__blank"
          >
            <GithubFilled style={{ fontSize: '28px', color: '#08c' }} />
          </a>{' '}
          ，您的star是我维护的动力，哈哈
        </p>
      </Card>
    </div>
  );
}

export default Options;

