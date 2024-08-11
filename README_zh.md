<p align="center">
  <img src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/ball-logo.png" alt="Udemy
   Translate
  " height="128" width="128" />
</p>

<h4 align="center">
  Udemy Translate
</h4>

[![Build Status](https://img.shields.io/badge/README-English-yellow.svg)](README.md)
![GitHub All Releases](https://img.shields.io/github/downloads/ChenYCL/chrome-extension-udemy-translate/total)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/ChenYCL/chrome-extension-udemy-translate/v3.0.0)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

## 关于本插件

这是一个强大的Chrome扩展，可以将任何网站上的字幕实时翻译成不同语言。它不再局限于特定的视频平台，而是支持用户自定义任何网站的字幕翻译。

## 主要特性

- 支持任意网站的字幕翻译
- 使用OpenAI API进行高质量翻译
- 支持Ollama本地部署的AI模型
- 用户可自定义目标网站和DOM选择器
- 实时翻译，无需刷新页面
- 支持多语言翻译
- 可自定义字幕样式和位置
- [ ] 支持第三方专业翻译接口，openai和ollama翻译质量不可控



## 安装方式

第一种方式: 从Chrome网上应用店安装（链接待更新）

第二种方式：公众号下载,或者下载源代码构建

- 步骤 1:

关注公众号: 影音下午茶 回复 '工具下载'

打开你的谷歌或者 Edge 新版浏览器

![第一步](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/step1.png)

- 步骤 2:
开启开发者模式
![第二步](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/step2.png)
<img width="1423" alt="image" src="https://github.com/user-attachments/assets/ca4853d9-4369-4135-b9a3-80a1c985a0f7">


效果如下

![Show](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/show.png)

![Show](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/netflix.png)

![Show](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/lynda.png)

![Show](https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/master/example/hulu.jpg)


## 版本

v3.0.0

## 功能点

- [x] 基本翻译

- [x] Netflix 视频支持

- [x] Lynda 视频支持

- [x] Linkedin 视频支持

- [x] Hbo now 视频支持

- [x] Hbo max 视频支持

- [x] Hulu 视频支持

- [x] Amazon 视频支持

- [x] paramountplus 视频支持

- [x] Disneyplus 视频支持

- [x] simplilearn.com 支持

- [x] Yandex 翻译接口接入

- [x] Azure Cognitive Services
    
- [x] openai
    
- [x] ollama
      
- [x] 字幕样式等

## 使用方法
- 安装扩展后，点击扩展图标打开配置面板
- 选择翻译API（OpenAI或Ollama）
- 输入必要的API密钥或配置信息
- 添加您想要翻译字幕的网站域名和对应的DOM选择器
- 保存设置并刷新目标网页
  
## API配置

- OpenAI配置
1. 在配置面板中选择OpenAI
2. 输入您的OpenAI API密钥
3. 选择合适的模型（如gpt-3.5-turbo）
4. 配置代理url


- Ollama本地配置（需要安装nodejs环境）
1. 安装Ollama：访问 Ollama官网https://ollama.com/ 下载并安装
2. 拉取所需模型：
```bash
ollama pull gemma2:2b
```
3.在扩展配置面板中选择Ollama

4. 输入Ollama服务的URL（默认为 http://localhost:11434）
5. 本地开启 ollama serve
6. 代理本地ollama到https
   1. https://github.com/tinny-tool/https-local-cli 下载当前项目 并在目录下使用npm link , 生成本地ssl等文件
   2. https://github.com/tinny-tool/ollama-proxy-https 使用当前项目，使用npm start 开启代理服务，实现本地接口翻译（速度最快，延时最低）


## 自定义网站配置
1. 在配置面板中，添加您想要翻译字幕的网站域名
2. 为该网站指定正确的DOM选择器，以定位字幕元素
3. 保存设置并刷新目标网页以生效

## 注意事项
确保您有足够的API使用额度
Ollama本地部署需要较高的硬件配置，请根据您的设备性能选择合适的模型
首次使用可能需要一些时间来加载和初始化模型


# 合作推广

公众号联系

# 欢迎关注公众号

有相关的插件使用教程，关注回复 '翻译工具' 即可获取，关注回复'工具下载'获取最新版本，同时定期分享值得观看的音视频资讯

  <img  src="https://raw.githubusercontent.com/ChenYCL/chrome-extension-udemy-translate/master/example/qrcode.BMP" alt="" height="148" width="148" />

# 打赏专线 ☕️

### 支付宝

  <img  src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/alipay.JPG" alt="" height="148" width="148" />

### 微信

  <img  src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/wechat.JPG" alt="" height="148" width="148" />
  
### 交流

[tg 交流](https://t.me/joinchat/Gs1RFzD5MpIwJ7S-)

<img  src="https://i.loli.net/2021/01/12/Vti5GPdqxjN3ETL.jpg" alt="" height="148" width="148" />

# 代码贡献

欢迎提交！只需发送 PR 以获得修复和文档更新，并预先打开新功能的问题。确保测试通过，并且覆盖率保持较高。谢谢
