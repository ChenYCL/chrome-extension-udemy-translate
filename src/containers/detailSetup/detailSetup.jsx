import React, { useState, useEffect } from 'react';
import { CompactPicker } from 'react-color';
import Icon128 from '../../assets/img/icon-128.png';
import './detailSetup.scss';
import { Avatar, Switch, Slider, Divider, List } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import { GithubFilled } from '@ant-design/icons';
import { getItem, setItem } from '../../pages/Content/modules/localStorage';

const colors = [
  'transparent',
  '#4D4D4D',
  '#999999',
  '#FFFFFF',
  '#F44E3B',
  '#FE9200',
  '#FCDC00',
  '#DBDF00',
  '#A4DD00',
  '#68CCCA',
  '#73D8FF',
  '#AEA1FF',
  '#FDA1FF',
  '#333333',
  '#808080',
  '#cccccc',
  '#D33115',
  '#E27300',
  '#FCC400',
  '#B0BC00',
  '#68BC00',
  '#16A5A5',
  '#009CE0',
  '#7B64FF',
  '#FA28FF',
  '#000000',
  '#666666',
  '#B3B3B3',
  '#9F0500',
  '#C45100',
  '#FB9E00',
  '#808900',
  '#194D33',
  '#0C797D',
  '#0062B1',
  '#653294',
  '#AB149E',
];
const DetailComponent = () => {
  const [valueMap, setValues] = useState({
    status: false,
    backgroundColor: '#000000',
    backgroundOpacity: 1,
    origin_font: 22,
    origin_color: '#ffffff',
    origin_weight: 700,
    trans_font: 28,
    trans_color: '#ffffff',
    trans_weight: 700,
  });

  //--------------------------------- read storage
  useEffect(() => {
    const obj = {};
    const keyMap = [
      'status',
      'backgroundColor',
      'backgroundOpacity',
      'origin_color',
      'origin_font',
      'origin_weight',
      'trans_color',
      'trans_font',
      'trans_weight',
    ];

    keyMap.forEach((item, idx) => {
      let t = {};
      getItem(item).then((value) => {
        t[item] = value;
        Object.assign(obj, t);
      });
    });

    setTimeout(() => {
      setValues({
        ...valueMap,
        ...obj,
      });
    }, 50);
  }, []);

  //---------------------------------
  // goto setting page
  const Setting = () => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function(tabs) {
        chrome.runtime.openOptionsPage();
      }
    );
  };

  const wrapperSetColor = (func, params) => {
    const { color, event, key } = params;
    func(color, event, key);
  };

  const setColor = ({ hex }, event, key) => {
    setItem(key, hex).then(() => {
      let o = {};
      o[key] = hex;
      setValues({
        ...valueMap,
        ...o,
      });
    });
  };

  return (
    <div>
      <div className={'header'}>
        <div className={'left'}>
          <Avatar
            style={{ verticalAlign: 'middle' }}
            size="large"
            src={Icon128}
          />
          <div className={'brand'}>Udemy Translate</div>
        </div>
        <div className={'right'}>
          <SettingFilled onClick={Setting} style={{ fontSize: '24px' }} />
        </div>
      </div>
      <Divider style={{ padding: 0, margin: 0 }} />
      <div className={'content'}>
        <Switch
          checkedChildren="开"
          unCheckedChildren="关"
          checked={valueMap.status}
          onChange={() => {
            setItem('status', !valueMap.status).then(() => {
              setValues({
                ...valueMap,
                status: !valueMap.status,
              });
            });
          }}
          style={{ fontSize: '4em' }}
        />
      </div>
      <List>
        <List.Item className={'flex'}>
          <span style={{ display: 'inlineBlock' }}>[背景色]</span>
          <CompactPicker
            colors={colors}
            color={valueMap.backgroundColor}
            onChangeComplete={(color, event) => {
              wrapperSetColor(setColor, {
                color,
                event,
                key: 'backgroundColor',
              });
            }}
            className={'CompactPicker'}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[背景透明]</span>
          <Slider
            style={{ width: '280px' }}
            min={0}
            max={1}
            step={0.1}
            onChange={(value) => {
              setValues({
                ...valueMap,
                backgroundOpacity: value,
              });
              setItem('backgroundOpacity', value);
            }}
            value={valueMap.backgroundOpacity}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[原文大小]</span>
          <Slider
            style={{ width: '280px' }}
            onChange={(value) => {
              setValues({
                ...valueMap,
                origin_font: value,
              });
              setItem('origin_font', value);
            }}
            value={valueMap.origin_font}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[原文颜色]</span>
          <CompactPicker
            name="origin_color"
            color={valueMap.origin_color}
            onChangeComplete={(color, event) => {
              wrapperSetColor(setColor, { color, event, key: 'origin_color' });
            }}
            className={'CompactPicker'}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[原文粗细]</span>
          <Slider
            style={{ width: '280px' }}
            min={100}
            max={700}
            step={100}
            onChange={(value) => {
              setValues({
                ...valueMap,
                origin_weight: value,
              });
              setItem('origin_weight', value);
            }}
            value={valueMap.origin_weight}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[译文大小]</span>
          <Slider
            style={{ width: '280px' }}
            onChange={(value) => {
              setValues({
                ...valueMap,
                trans_font: value,
              });
              setItem('trans_font', value);
            }}
            value={valueMap.trans_font}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[译文颜色]</span>
          <CompactPicker
            name="trans_color"
            color={valueMap.trans_color}
            onChangeComplete={(color, event) => {
              wrapperSetColor(setColor, { color, event, key: 'trans_color' });
            }}
            className={'CompactPicker'}
          />
        </List.Item>
        <List.Item className={'flex'}>
          <span>[译文粗细]</span>
          <Slider
            style={{ width: '280px' }}
            min={100}
            max={700}
            step={100}
            onChange={(value) => {
              setValues({
                ...valueMap,
                trans_weight: value,
              });
              setItem('trans_weight', value);
            }}
            value={valueMap.trans_weight}
          />
        </List.Item>
        <List.Item>
          <a
            href="https://github.com/ChenYCL/chrome-extension-udemy-translate"
            target="__blank"
          >
            <GithubFilled
              style={{
                fontSize: '28px',
                color: 'black',
                marginLeft: '20px',
                cursor: 'pointer',
              }}
            />
            有问题
          </a>
        </List.Item>
      </List>
    </div>
  );
};

export default DetailComponent;
