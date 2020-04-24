import React, { Component } from 'react';
import './Options.scss';
import { Card, Input, message, Radio, Select } from 'antd';
import { getItem, setItem } from '../Content/modules/localStorage';
import { GithubFilled } from '@ant-design/icons';

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

class Options extends Component {
  state = {
    trans_way: 'youdao',
    language: 'zh',
    origin_lang: 'auto',
    trans_api: {
      youdao: {
        id: '',
        key: '',
      },
      baidu: {
        id: '',
        key: '',
      },
      yandex: {
        id: '',
      },
    },
  };

  chooseWay = async (e) => {
    console.log(`trans_way ${e.target.value}`);
    await setItem('trans_way', e.target.value);
    await this.setState({
      trans_way: e.target.value,
    });
    await message.success(`当前选中：${e.target.value}`);
  };

  onChange = async (value) => {
    console.log(`selected ${value}`);
    await setItem('language', value);
    await this.setState({
      language: value,
    });
    await message.success(`将翻译为：${value}`);
  };

  originChoose = async (value) => {
    console.log(`selected ${value}`);
    await setItem('origin_lang', value);
    await this.setState({
      origin_lang: value,
    });
    await message.success(`切换为：${value}`);
  };

  onBlur = () => {
    console.log('blur');
  };

  onFocus = () => {
    console.log('focus');
  };

  onSearch = (val) => {
    console.log('search:', val);
  };

  componentDidMount() {}

  UNSAFE_componentWillMount() {
    const keyMap = ['trans_way', 'language', 'trans_api', 'origin_lang'];
    keyMap.forEach(async (key, idx) => {
      let o = {};
      o[key] = await getItem(key);
      this.setState(o);
    });
  }

  inputHandle = async (e) => {
    const [type, key] = e.target.name.split('-');
    let { trans_api } = this.state;
    let obj = {};
    obj[type] = {};
    obj[type][key] = e.target.value;
    obj[type] = {
      ...trans_api[type],
      ...obj[type],
    };
    let newObj = { ...trans_api, ...obj };
    await setItem('trans_api', newObj);
    await this.setState({
      trans_api: newObj,
    });
    console.log(this.state);
  };

  render() {
    const {
      trans_api: { youdao, baidu, yandex },
    } = this.state;
    return (
      <div className="OptionsContainer">
        <Card className="Card" title="ID&Key" bordered={false}>
          <Radio.Group onChange={this.chooseWay} value={this.state.trans_way}>
            <section>
              <Radio value={'youdao'}>有道云API</Radio>
              <p style={{ padding: '15px' }}>
                <Input
                  name="youdao-id"
                  onChange={this.inputHandle}
                  placeholder="ID"
                  value={youdao.id}
                  style={{ width: '400px' }}
                />
                <Input
                  name="youdao-key"
                  onChange={this.inputHandle}
                  placeholder="KEY"
                  value={youdao.key}
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
                  name="baidu-id"
                  onChange={this.inputHandle}
                  placeholder="ID"
                  value={baidu.id}
                  style={{ width: '400px' }}
                />
                <Input
                  name="baidu-key"
                  onChange={this.inputHandle}
                  placeholder="KEY/密钥"
                  value={baidu.key}
                  style={{
                    width: '400px',
                    marginTop: '10px',
                    marginLeft: '10px',
                  }}
                />
              </p>
            </section>
            <section>
              <Radio value={'google'}>谷歌</Radio>
            </section>
            <section>
              <Radio value={'yandex'}>Yandex</Radio>
              <p style={{ padding: '15px' }}>
                <Input
                  name="yandex-id"
                  onChange={this.inputHandle}
                  placeholder="ID"
                  value={yandex.id}
                  style={{ width: '400px' }}
                />
                {/*<Input placeholder="KEY" style={{width:'400px',marginLeft:'20px'}}/>*/}
              </p>
            </section>
            <section>
              <Radio value={'deepl'} disabled>
                Deepl 人工智能API
              </Radio>
              {/*<p style={{ padding: '15px' }}>*/}
              {/*  <Input name='yandex-id' onChange={this.inputHandle} placeholder="ID" value={yandex.id}*/}
              {/*         style={{ width: '400px' }}/>*/}
              {/*</p>*/}
            </section>
          </Radio.Group>
        </Card>
        <Card className="Card" title="Origin Language/原字幕" bordered={false}>
          <p>Origin Language</p>
          <Select
            value={this.state.origin_lang}
            showSearch
            style={{ width: 400 }}
            placeholder="Select origin language"
            optionFilterProp="children"
            onChange={this.originChoose}
            onSearch={this.onSearch}
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
            value={this.state.language}
            showSearch
            style={{ width: 400 }}
            placeholder="Select a language translate"
            optionFilterProp="children"
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onSearch={this.onSearch}
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
          {/*<a href="www.google.com" target='__blank'>Google</a>*/}
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
}

export default Options;
