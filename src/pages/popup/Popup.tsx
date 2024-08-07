import React, { useState, useEffect } from 'react';
import { CompactPicker } from 'react-color';
import Icon128 from '../../utils/images/icon-128.png';
import './index.scss';
import { Avatar, Switch, Slider, Divider, List } from 'antd';
import {
  SettingFilled,
  RedEnvelopeOutlined,
  CloseSquareOutlined,
  GithubFilled
} from '@ant-design/icons';
import { getItem, setItem } from '../../utils/common';

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
const Popup = () => {
  const [status, setStatus] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundOpacity, setBackgroundOpacity] = useState(1)
  const [originFontSize, setOriginFontSize] = useState(22)
  const [originFontColor, setOriginColor] = useState('#ffffff')
  const [originFontWeight, setOriginFontWeight] = useState(700)
  const [translatedFontSize, setTranslatedFontSize] = useState(28)
  const [translatedFontColor, setTranslatedFontColor] = useState('#ffffff')
  const [translatedFontWeight, setTranslatedFontWeight] = useState(700)

  const [promotionStatus, setPromotionStatus] = useState(true);
  useEffect(() => {
    chrome.storage.local.get(null, function (data) {
      console.log(`popup page `,data)
      setStatus(data?.status)
      setBackgroundColor(data?.backgroundColor)
      setBackgroundOpacity(data?.backgroundOpacity)
      setOriginFontSize(data?.originFontSize)
      setOriginColor(data?.originFontColor)
      setOriginFontWeight(data?.originFontWeight)
      setTranslatedFontSize(data?.translatedFontSize)
      setTranslatedFontColor(data?.translatedFontColor)
      setTranslatedFontWeight(data?.translatedFontWeight)
    })
  }, []);

  const Setting = () => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        chrome.runtime.openOptionsPage();
      }
    );
  };

  // goto  promotion page
  const promotionPage = () => {
    setPromotionStatus(!promotionStatus);
  };




  return (
    <div>
      <div className={'header'}>
        <div className={'left'}>
          <Avatar
            style={{ verticalAlign: 'middle' }}
            src={Icon128}
          />
          <div className={'brand'}>Udemy Translate</div>
        </div>
        <div className={'right'}>
          {promotionStatus ? (
            <RedEnvelopeOutlined
              title={'特惠推广'}
              onClick={promotionPage}
              style={{ fontSize: '24px', marginRight: '10px', color: 'red' }}
            />
          ) : (
            <CloseSquareOutlined
              title={'关闭'}
              onClick={promotionPage}
              style={{ fontSize: '24px', marginRight: '10px', color: 'green' }}
            />
          )}
          <SettingFilled
            title={'设置'}
            onClick={Setting}
            style={{ fontSize: '24px' }}
          />
        </div>
      </div>
      <Divider style={{ padding: 0, margin: 0 }} />
      {promotionStatus ? (
        <div>
          <div className={'content'}>
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
              checked={status}
              onChange={
                (e: any) => {
                  setStatus(!status)
                  chrome.storage.local.set({ 'status': !status })
                }
              }
              style={{ fontSize: '4em' }}
            />
          </div>
          <List>
            <List.Item className={'flex'}>
              <span style={{ display: 'inlineBlock' }}>[背景色]</span>
              <CompactPicker
                colors={colors}
                color={backgroundColor}
                onChangeComplete={(color, event) => {
                  console.log(color)
                  setBackgroundColor(color?.hex)
                  chrome.storage.local.set({ 'backgroundColor': color.hex })
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
                onChange={(value:any) => {
                  setBackgroundOpacity(value)
                  chrome.storage.local.set({ 'backgroundOpacity': value })
                }}
                value={backgroundOpacity}
              />
            </List.Item>
            <List.Item className={'flex'}>
              <span>[原文大小]</span>
              <Slider
                style={{ width: '280px' }}
                onChange={(value:any) => {
                  setOriginFontSize(value)
                  chrome.storage.local.set({ 'originFontSize': value })
                }}
                value={originFontSize}
              />
            </List.Item>
            <List.Item className={'flex'}>
              <span>[原文颜色]</span>
              <CompactPicker
                // name="originFontColor"
                color={originFontColor}
                onChangeComplete={(color, event) => {
                  setOriginColor(color.hex)
                  chrome.storage.local.set({ 'originFontColor': color.hex })
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
                onChange={(value:any) => {
                  setOriginFontWeight(value)
                  chrome.storage.local.set({ 'originFontWeight': value })
                }}
                value={originFontWeight}
              />
            </List.Item>
            <List.Item className={'flex'}>
              <span>[译文大小]</span>
              <Slider
                style={{ width: '280px' }}
                onChange={(value:any) => {
                  setTranslatedFontSize(value)
                  chrome.storage.local.set({ 'translatedFontSize': value })
                }}
                value={translatedFontSize}
              />
            </List.Item>
            <List.Item className={'flex'}>
              <span>[译文颜色]</span>
              <CompactPicker
                // name="translatedFontColor"
                onChangeComplete={(color, event) => {
                  setTranslatedFontColor(color?.hex)
                  chrome.storage.local.set({ 'translatedFontColor': color?.hex })
                }}
                color={translatedFontColor}
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
                onChange={(value:any) => {
                  setTranslatedFontWeight(value)
                  chrome.storage.local.set({ 'translatedFontWeight': value })
                }}
                value={translatedFontWeight}
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
      ) : (
        <div
          style={{
            height: 'calc(100vh - 42px)',
            background: 'radial-gradient(white, rgb(51, 65, 76))',
          }}
        >
          <h1 style={{ textAlign: 'center', color: 'red' }}>专属优惠链接</h1>
          <ul style={{ listStyle: 'none' }}>
            <li>
              <a
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  fontSize: '24px',
                }}
                href="https://www.naifei.shop/?sid=YqDFNq"
                target="_blank"
              >
                1. 《奈飞小铺》新人专属特权优惠10元+5元(作者专属通道)
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Popup;
