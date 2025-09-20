<p align="center">
  <img src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/ball-logo.png" alt="通用字幕翻译器" height="128" width="128" />
</p>

<h1 align="center">
  通用字幕翻译器
</h1>

<p align="center">
  <strong>任意网站的实时字幕翻译</strong>
</p>

<p align="center">
  <a href="README.md">
    <img src="https://img.shields.io/badge/README-English-yellow.svg" alt="English README">
  </a>
  <img src="https://img.shields.io/github/downloads/ChenYCL/chrome-extension-udemy-translate/total" alt="下载量">
  <img src="https://img.shields.io/github/package-json/v/ChenYCL/chrome-extension-udemy-translate/main" alt="版本">
  <a href="https://opensource.org/licenses/mit-license.php">
    <img src="https://badges.frapsoft.com/os/mit/mit.svg?v=103" alt="MIT License">
  </a>
</p>

## 🌟 关于本插件

一个强大的 Chrome 扩展，可以将任何网站上的字幕实时翻译成不同语言。不再局限于特定的视频平台，支持用户自定义任何网站的字幕翻译，配置灵活的选择器。

## 🎬 演示视频

https://github.com/user-attachments/assets/8089f430-894f-4abc-9c86-544739ab0f57

https://github.com/user-attachments/assets/de6300f6-af87-441a-9304-dd58b255a17a

![IMG_8903](https://github.com/user-attachments/assets/fff487b3-fb93-4702-bf22-325bfe72fa85)


## ✨ 主要特性

- 🌐 **通用支持** - 适用于任何有字幕的网站
- 🤖 **多种 AI 模型** - 支持 OpenAI API 和本地 Ollama
- 🎯 **自定义选择器** - 为任何网站定义 DOM 选择器
- ⚡ **实时翻译** - 无需刷新页面的即时翻译
- 🌍 **多语言支持** - 支持翻译到任何语言
- 🎨 **可定制界面** - 可调整字幕样式和位置
- 🔧 **简易配置** - 一键预设配置
- 🧪 **内置测试** - 直接在选项页面测试 API 配置

## 📦 安装方式

### 方式一：Chrome 网上应用店（推荐）

_即将上线 - 扩展将在 Chrome 网上应用店发布_

### 方式二：手动安装

1. **下载扩展**

   - 从 [Releases](https://github.com/ChenYCL/chrome-extension-udemy-translate/releases) 下载最新版本
   - 或克隆源代码自行构建

2. **在 Chrome 中安装**

   - 打开 Chrome 并访问 `chrome://extensions/`
   - 在右上角启用"开发者模式"
   - 点击"加载已解压的扩展程序"并选择扩展文件夹

3. **配置扩展**
   - 右键点击扩展图标 → 选项
   - 配置首选的 AI 模型（OpenAI 或 Ollama）
   - 添加网站配置以进行字幕翻译

## 🎯 支持的平台

- ✅ **Netflix** - 实时字幕翻译
- ✅ **YouTube** - 视频字幕支持
- ✅ **Amazon Prime Video** - 流媒体字幕
- ✅ **Disney+** - 多语言支持
- ✅ **HBO Max** - 高级内容翻译
- ✅ **Hulu** - 直播和点播内容
- ✅ **Paramount+** - 体育和娱乐
- ✅ **LinkedIn Learning** - 教育内容
- ✅ **Udemy** - 课程字幕
- ✅ **任何网站** - 自定义选择器配置

## 🚀 快速开始

### 步骤一：选择 AI 模型

**选项 A：OpenAI API（推荐）**

- 高质量翻译
- 多种模型选择
- 支持第三方兼容 API

**选项 B：本地 Ollama**

- 注重隐私的本地处理
- 无 API 费用
- 需要本地设置

### 步骤二：配置 API

1. **OpenAI 配置：**

   - 从 [OpenAI Platform](https://platform.openai.com/) 获取 API 密钥
   - 选择预设配置：
     - OpenAI 官方：`https://api.openai.com/v1`
     - 第三方服务：各种兼容 API
   - 使用内置测试工具测试配置

2. **Ollama 配置：**
   - 本地安装 Ollama
   - 设置 HTTPS 代理（参见 [local-https-proxy-ollama](https://github.com/ChenYCL/local-https-proxy-ollama)）
   - 配置本地端点

### 步骤三：添加网站配置

1. **访问选项页面**

   - 右键点击扩展图标 → 选项
   - 或点击扩展图标 → 设置

2. **添加网站配置**

   - 域名：`https://www.netflix.com`
   - 选择器：`.player-timedtext-text-container`（Netflix 字幕）
   - 保存配置

3. **测试翻译**
   - 访问配置的网站
   - 播放带字幕的视频
   - 翻译应自动出现

## ⚙️ 配置指南

### 🤖 OpenAI API 设置

#### 支持的服务

- **OpenAI 官方**：`https://api.openai.com/v1`
- **第三方兼容 API**：
  - OAIPro：`https://api.oaipro.com/v1`
  - UseAIHub：`https://api.useaihub.com/v1`
  - 任何 OpenAI 兼容服务

#### 配置步骤

1. **获取 API 密钥**

   - 访问 [OpenAI Platform](https://platform.openai.com/)
   - 创建账户并生成 API 密钥
   - 或使用第三方服务凭据

2. **配置扩展**
   - 选择 **OpenAI** 模型
   - 选择预设配置或输入自定义 URL
   - 输入您的 API 密钥
   - 选择模型（gpt-3.5-turbo、gpt-4 等）
   - 点击 **🧪 测试 API 配置** 进行验证

#### 故障排除

- **401 错误**：检查 API 密钥有效性
- **429 错误**：超出速率限制，检查配额
- **404 错误**：验证模型名称和端点 URL

### 🏠 Ollama 本地设置

#### 前置要求

- 本地 Ollama 安装
- Chrome 扩展兼容的 HTTPS 代理
- 充足的系统资源（推荐 4GB+ RAM）

#### 快速设置

```bash
# 1. 安装 Ollama
# 访问 https://ollama.ai 获取安装说明

# 2. 下载推荐模型
ollama pull qwen2:0.5b  # 轻量级，适合翻译

# 3. 设置 HTTPS 代理
git clone https://github.com/ChenYCL/local-https-proxy-ollama.git
cd local-https-proxy-ollama
./setup.sh  # macOS/Linux 或 setup.bat（Windows）

# 4. 启动代理服务器
npm start
```

#### 扩展配置

1. 选择 **Ollama** 模型
2. 设置 Base URL：`https://localhost:11435/v1`
3. 设置模型名称：`qwen2:0.5b`
4. API Key：`ollama`（任意值即可）

详细设置说明请参见：[local-https-proxy-ollama](https://github.com/ChenYCL/local-https-proxy-ollama)

## 🌐 自定义网站配置

### 添加新网站

1. **查找字幕选择器**

   - 打开浏览器开发者工具（F12）
   - 检查字幕元素
   - 复制 CSS 选择器

2. **添加配置**
   - 域名：完整网站 URL（如 `https://www.example.com`）
   - 选择器：字幕元素的 CSS 选择器
   - 保存并测试

### 常用选择器

- **Netflix**：`.player-timedtext-text-container`
- **YouTube**：`.ytp-caption-segment`
- **Amazon Prime**：`.atvwebplayersdk-captions-text`
- **Disney+**：`.dss-subtitle-renderer-cue`

## 🔧 高级功能

- **自定义翻译提示**：修改翻译指令
- **字幕样式设置**：自定义外观和位置
- **多域名支持**：同时支持多个网站
- **实时测试**：内置 API 配置测试

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
