import React, { Component } from 'react';
import './Options.scss';
import { Card, Input, message, Radio, Select } from 'antd';
import { getItem, setItem } from '../Content/modules/localStorage';
import * as THREE from 'three';
import chroma from 'chroma-js';
import { GithubFilled } from '@ant-design/icons';

function App() {
  const conf = {
    nx: 40,
    ny: 100,
    cscale: chroma.scale(['#2175D8', '#DC5DCE', '#CC223D', '#F07414', '#FDEE61', '#74C425']).mode('lch'),
    darken: -1,
    angle: Math.PI / 3,
    timeCoef: 0.1,
  };

  let renderer, scene, camera;
  let width, height;
  const { randFloat: rnd } = THREE.Math;

  const uTime = { value: 0 }, uTimeCoef = { value: conf.timeCoef };
  const polylines = [];

  init();

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    camera = new THREE.PerspectiveCamera();

    updateSize();
    window.addEventListener('resize', updateSize, false);
    document.body.addEventListener('click', initRandomScene);

    initScene();
    requestAnimationFrame(animate);
  }

  function initScene() {
    scene = new THREE.Scene();
    const vertexShader = `
      uniform float uTime, uTimeCoef;
      uniform float uSize;
      uniform mat2 uMat2;
      uniform vec3 uRnd1;
      uniform vec3 uRnd2;
      uniform vec3 uRnd3;
      uniform vec3 uRnd4;
      uniform vec3 uRnd5;
      attribute vec3 next, prev;
      attribute float side;
      varying vec2 vUv;

      vec2 dp(vec2 sv) {
        return (1.5 * sv * uMat2);
      }

      void main() {
        vUv = uv;

        vec2 pos = dp(position.xy);

        // Well... I know I should update geometry instead...
        // Computing normal here is not needed
        // vec2 sprev = dp(prev.xy);
        // vec2 snext = dp(next.xy);
        // vec2 tangent = normalize(snext - sprev);
        // vec2 normal = vec2(-tangent.y, tangent.x);
        // float dist = length(snext - sprev);
        // normal *= smoothstep(0.0, 0.02, dist);

        vec2 normal = dp(vec2(1, 0));
        normal *= uSize;

        float time = uTime * uTimeCoef;
        vec3 rnd1 = vec3(cos(time * uRnd1.x + uRnd3.x), cos(time * uRnd1.y + uRnd3.y), cos(time * uRnd1.z + uRnd3.z));
        vec3 rnd2 = vec3(cos(time * uRnd2.x + uRnd4.x), cos(time * uRnd2.y + uRnd4.y), cos(time * uRnd2.z + uRnd4.z));
        normal *= 1.0
          + uRnd5.x * (cos((position.y + rnd1.x) * 20.0 * rnd1.y) + 1.0)
          + uRnd5.y * (sin((position.y + rnd2.x) * 20.0 * rnd2.y) + 1.0)
          + uRnd5.z * (cos((position.y + rnd1.z) * 20.0 * rnd2.z) + 1.0);
        pos.xy -= normal * side;

        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(mix(uColor1, uColor2, vUv.x), 1.0);
      }
    `;

    const dx = 2 / (conf.nx), dy = -2 / (conf.ny - 1);
    const ox = -1 + dx / 2, oy = 1;
    const mat2 = Float32Array.from([Math.cos(conf.angle), -Math.sin(conf.angle), Math.sin(conf.angle), Math.cos(conf.angle)]);
    for (let i = 0; i < conf.nx; i++) {
      const points = [];
      for (let j = 0; j < conf.ny; j++) {
        const x = ox + i * dx, y = oy + j * dy;
        points.push(new THREE.Vector3(x, y, 0));
      }
      const polyline = new Polyline({ points });
      polylines.push(polyline);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime,
          uTimeCoef,
          uMat2: { value: mat2 },
          uSize: { value: 1.5 / conf.nx },
          uRnd1: { value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)) },
          uRnd2: { value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)) },
          uRnd3: { value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)) },
          uRnd4: { value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)) },
          uRnd5: { value: new THREE.Vector3(rnd(0.2, 0.5), rnd(0.3, 0.6), rnd(0.4, 0.7)) },
          uColor1: { value: new THREE.Color(conf.cscale(i / conf.nx).hex()) },
          uColor2: { value: new THREE.Color(conf.cscale(i / conf.nx).darken(conf.darken).hex()) },
        },
        vertexShader,
        fragmentShader,
      });
      const mesh = new THREE.Mesh(polyline.geometry, material);
      scene.add(mesh);
    }
  }

  function initRandomScene() {
    conf.nx = Math.floor(rnd(20, 200));
    conf.cscale = randomCScale();
    conf.darken = rnd(0, 1) > 0.5 ? rnd(-4, -0.5) : rnd(0.5, 4);
    conf.angle = rnd(0, 2 * Math.PI);
    uTimeCoef.value = rnd(0.05, 0.2);
    disposeScene();
    initScene();
  }

  function disposeScene() {
    for (let i = 0; i < scene.children.length; i++) {
      const mesh = scene.children[i];
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    scene.dispose();
  }

  function randomCScale() {
    const colors = [], n = 2 + Math.floor(rnd(0, 4));
    for (let i = 0; i < n; i++) {
      colors.push(chroma.random());
    }
    return chroma.scale(colors).mode('lch');
  }

  function animate(t) {
    uTime.value = t * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function updateSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
  }
}

// adapted from https://github.com/oframe/ogl/blob/master/src/extras/Polyline.js
const Polyline = (function() {
  const tmp = new THREE.Vector3();

  class Polyline {
    constructor(params) {
      const { points } = params;
      this.points = points;
      this.count = points.length;
      this.init();
      this.updateGeometry();
    }

    init() {
      this.geometry = new THREE.BufferGeometry();
      this.position = new Float32Array(this.count * 3 * 2);
      this.prev = new Float32Array(this.count * 3 * 2);
      this.next = new Float32Array(this.count * 3 * 2);
      const side = new Float32Array(this.count * 1 * 2);
      const uv = new Float32Array(this.count * 2 * 2);
      const index = new Uint16Array((this.count - 1) * 3 * 2);

      for (let i = 0; i < this.count; i++) {
        const i2 = i * 2;
        side.set([-1, 1], i2);
        const v = i / (this.count - 1);
        uv.set([0, v, 1, v], i * 4);

        if (i === this.count - 1) continue;
        index.set([i2 + 0, i2 + 1, i2 + 2], (i2 + 0) * 3);
        index.set([i2 + 2, i2 + 1, i2 + 3], (i2 + 1) * 3);
      }

      this.geometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
      this.geometry.setAttribute('prev', new THREE.BufferAttribute(this.prev, 3));
      this.geometry.setAttribute('next', new THREE.BufferAttribute(this.next, 3));
      this.geometry.setAttribute('side', new THREE.BufferAttribute(side, 1));
      this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
    }

    updateGeometry() {
      this.points.forEach((p, i) => {
        p.toArray(this.position, i * 3 * 2);
        p.toArray(this.position, i * 3 * 2 + 3);

        if (!i) {
          tmp.copy(p).sub(this.points[i + 1]).add(p);
          tmp.toArray(this.prev, i * 3 * 2);
          tmp.toArray(this.prev, i * 3 * 2 + 3);
        } else {
          p.toArray(this.next, (i - 1) * 3 * 2);
          p.toArray(this.next, (i - 1) * 3 * 2 + 3);
        }

        if (i === this.points.length - 1) {
          tmp.copy(p).sub(this.points[i - 1]).add(p);
          tmp.toArray(this.next, i * 3 * 2);
          tmp.toArray(this.next, i * 3 * 2 + 3);
        } else {
          p.toArray(this.prev, (i + 1) * 3 * 2);
          p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
        }
      });

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.prev.needsUpdate = true;
      this.geometry.attributes.next.needsUpdate = true;
    }
  }

  return Polyline;
})();

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
    origin_lang:'auto',
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

  originChoose = async (value)=>{
    console.log(`selected ${value}`);
    await setItem('origin_lang', value);
    await this.setState({
      origin_lang: value,
    });
    await message.success(`切换为：${value}`);
  }

  onBlur = () => {
    console.log('blur');
  };


  onFocus = () => {
    console.log('focus');
  };


  onSearch = (val) => {
    console.log('search:', val);
  };

  componentDidMount() {
    App();
  }

  UNSAFE_componentWillMount() {
    const keyMap = [
      'trans_way',
      'language',
      'trans_api',
      'origin_lang'
    ];
    keyMap.forEach(async (key, idx) => {
      let o = {};
      o[key] = await getItem(key);
      this.setState(o);
    });

  }

  inputHandle = async e => {
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
    const { trans_api: { youdao, baidu, yandex } } = this.state;
    return <div className="OptionsContainer">
      <Card className="Card" title="ID&Key" bordered={false}>
        <Radio.Group onChange={this.chooseWay} value={this.state.trans_way}>
          <section>
            <Radio value={'youdao'}>有道云API</Radio>
            <p style={{ padding: '15px' }}>
              <Input name='youdao-id' onChange={this.inputHandle} placeholder="ID" value={youdao.id}
                     style={{ width: '400px' }}/>
              <Input name='youdao-key' onChange={this.inputHandle} placeholder="KEY" value={youdao.key}
                     style={{ width: '400px', marginTop: '10px', marginLeft: '10px' }}/>
            </p>
          </section>
          <section>
            <Radio value={'baidu'}>百度云API</Radio>
            <p style={{ padding: '15px' }}>
              <Input name='baidu-id' onChange={this.inputHandle} placeholder="ID" value={baidu.id}
                     style={{ width: '400px' }}/>
              <Input name='baidu-key' onChange={this.inputHandle} placeholder="KEY/密钥" value={baidu.key}
                     style={{ width: '400px', marginTop: '10px', marginLeft: '10px' }}/>
            </p>
          </section>
          <section>
            <Radio value={'google'}>谷歌</Radio>
          </section>
          <section>
            <Radio value={'yandex'}>Yandex</Radio>
            <p style={{ padding: '15px' }}>
              <Input name='yandex-id' onChange={this.inputHandle} placeholder="ID" value={yandex.id}
                     style={{ width: '400px' }}/>
              {/*<Input placeholder="KEY" style={{width:'400px',marginLeft:'20px'}}/>*/}
            </p>
          </section>
          <section>
            <Radio value={'deepl'} disabled>Deepl 人工智能API</Radio>
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
          onChange={this.onChange}
          onSearch={this.onSearch}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option key={1} value={'auto'}>自动识别</Option>
          <Option key={2} value={'ja'}>Japanese</Option>
          <Option key={3} value={'ko'}>Korean</Option>
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
          {
            Object.entries(languageList).map(item => <Option key={item[1]} value={item[1]}>{item[0]}</Option>)
          }
        </Select>
      </Card>

      <Card className="Card" title="About Api/Api注册" bordered={false}>
        <a href="https://fanyi-api.baidu.com/api/trans/product/desktop" target='__blank'>百度API</a>&nbsp;&nbsp;
        <a href="https://ai.youdao.com/index.s" target='__blank'>有道云API</a>&nbsp;&nbsp;
        <a href="https://translate.yandex.com/developers/keys" target='__blank'>Yandex</a>&nbsp;&nbsp;
        {/*<a href="www.google.com" target='__blank'>Google</a>*/}
      </Card>
      <Card className="Card" title="字幕下载/Subtile Download" bordered={false}>
        <p>实验功能</p>
      </Card>

      <Card className="Card" title="关于" bordered={false}>
        <p>如果觉得不错，👏star <a href='https://github.com/ChenYCL/chrome-extension-udemy-translate'
                            target='__blank'><GithubFilled
          style={{ fontSize: '28px', color: '#08c' }}/></a> ，您的star是我维护的动力，哈哈</p>
      </Card>
    </div>;
  }
}

export default Options;
