<p align="center">
  <img src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/ball-logo.png" alt="Universal Subtitle Translator" height="128" width="128" />
</p>

<h1 align="center">
  Universal Subtitle Translator
</h1>

<p align="center">
  <strong>Real-time subtitle translation for any website</strong>
</p>

<p align="center">
  <a href="README_zh.md">
    <img src="https://img.shields.io/badge/README-中文-yellow.svg" alt="Chinese README">
  </a>
  <img src="https://img.shields.io/github/downloads/ChenYCL/chrome-extension-udemy-translate/total" alt="Downloads">
  <img src="https://img.shields.io/github/package-json/v/ChenYCL/chrome-extension-udemy-translate/main" alt="Version">
  <a href="https://opensource.org/licenses/mit-license.php">
    <img src="https://badges.frapsoft.com/os/mit/mit.svg?v=103" alt="MIT License">
  </a>
</p>

## 🌟 About This Extension

A powerful Chrome extension that translates subtitles from any website into different languages in real-time. No longer limited to specific video platforms - supports user-defined subtitle translation for any website with customizable selectors.

## 🎬 Demo Videos

https://github.com/user-attachments/assets/8089f430-894f-4abc-9c86-544739ab0f57

https://github.com/user-attachments/assets/de6300f6-af87-441a-9304-dd58b255a17a

![IMG_8903](https://github.com/user-attachments/assets/c0c50090-864f-405d-84f0-3e7ce47e0f3e)


## ✨ Key Features

- 🌐 **Universal Support** - Works on any website with subtitles
- 🤖 **Multiple AI Models** - OpenAI API and local Ollama support
- 🎯 **Custom Selectors** - Define your own DOM selectors for any site
- ⚡ **Real-time Translation** - Instant translation without page refresh
- 🌍 **Multi-language** - Supports translation to any language
- 🎨 **Customizable UI** - Adjustable subtitle style and position
- 🔧 **Easy Configuration** - One-click preset configurations
- 🧪 **Built-in Testing** - Test API configurations directly in options

## 📦 Installation

### Method 1: Chrome Web Store (Recommended)

_Coming soon - Extension will be available on Chrome Web Store_

### Method 2: Manual Installation

1. **Download the Extension**

   - Download the latest release from [Releases](https://github.com/ChenYCL/chrome-extension-udemy-translate/releases)
   - Or clone and build from source

2. **Install in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension folder

3. **Configure the Extension**
   - Right-click the extension icon → Options
   - Configure your preferred AI model (OpenAI or Ollama)
   - Add website configurations for subtitle translation

## 🎯 Supported Platforms

- ✅ **Netflix** - Real-time subtitle translation
- ✅ **YouTube** - Video subtitle support
- ✅ **Amazon Prime Video** - Streaming subtitles
- ✅ **Disney+** - Multi-language support
- ✅ **HBO Max** - Premium content translation
- ✅ **Hulu** - Live and on-demand content
- ✅ **Paramount+** - Sports and entertainment
- ✅ **LinkedIn Learning** - Educational content
- ✅ **Udemy** - Course subtitles
- ✅ **Any Website** - Custom selector configuration

## 🚀 Quick Start

### Step 1: Choose Your AI Model

**Option A: OpenAI API (Recommended)**

- High-quality translation
- Multiple model options
- Supports third-party compatible APIs

**Option B: Local Ollama**

- Privacy-focused local processing
- No API costs
- Requires local setup

### Step 2: Configure API

1. **OpenAI Configuration:**

   - Get API key from [OpenAI Platform](https://platform.openai.com/)
   - Choose from preset configurations:
     - OpenAI Official: `https://api.openai.com/v1`
     - Third-party services: Various compatible APIs
   - Test configuration with built-in testing tool

2. **Ollama Configuration:**
   - Install Ollama locally
   - Set up HTTPS proxy (see [local-https-proxy-ollama](https://github.com/ChenYCL/local-https-proxy-ollama))
   - Configure local endpoint

### Step 3: Add Website Configuration

1. **Access Options Page**

   - Right-click extension icon → Options
   - Or click extension icon → Settings

2. **Add Website Configuration**

   - Domain: `https://www.netflix.com`
   - Selector: `.player-timedtext-text-container` (for Netflix subtitles)
   - Save configuration

3. **Test Translation**
   - Visit configured website
   - Play video with subtitles
   - Translation should appear automatically

## ⚙️ Configuration Guide

### 🤖 OpenAI API Setup

#### Supported Services

- **OpenAI Official**: `https://api.openai.com/v1`
- **Third-party Compatible APIs**:
  - OAIPro: `https://api.oaipro.com/v1`
  - UseAIHub: `https://api.useaihub.com/v1`
  - Any OpenAI-compatible service

#### Configuration Steps

1. **Get API Key**

   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create account and generate API key
   - Or use third-party service credentials

2. **Configure Extension**
   - Select **OpenAI** model
   - Choose preset configuration or enter custom URL
   - Enter your API key
   - Select model (gpt-3.5-turbo, gpt-4, etc.)
   - Click **🧪 Test API Configuration** to verify

#### Troubleshooting

- **401 Error**: Check API key validity
- **429 Error**: Rate limit exceeded, check quota
- **404 Error**: Verify model name and endpoint URL

### 🏠 Ollama Local Setup

#### Prerequisites

- Local Ollama installation
- HTTPS proxy for Chrome extension compatibility
- Sufficient system resources (4GB+ RAM recommended)

#### Quick Setup

```bash
# 1. Install Ollama
# Visit https://ollama.ai for installation instructions

# 2. Download recommended model
ollama pull qwen2:0.5b  # Lightweight, good for translation

# 3. Set up HTTPS proxy
git clone https://github.com/ChenYCL/local-https-proxy-ollama.git
cd local-https-proxy-ollama
./setup.sh  # macOS/Linux or setup.bat for Windows

# 4. Start proxy server
npm start
```

#### Extension Configuration

1. Select **Ollama** model
2. Set Base URL: `https://localhost:11435/v1`
3. Set Model Name: `qwen2:0.5b`
4. API Key: `ollama` (any value works)

For detailed setup instructions, see: [local-https-proxy-ollama](https://github.com/ChenYCL/local-https-proxy-ollama)

## 🌐 Custom Website Configuration

### Adding New Websites

1. **Find Subtitle Selector**

   - Open browser developer tools (F12)
   - Inspect subtitle elements
   - Copy CSS selector

2. **Add Configuration**
   - Domain: Full website URL (e.g., `https://www.example.com`)
   - Selector: CSS selector for subtitle elements
   - Save and test

### Common Selectors

- **Netflix**: `.player-timedtext-text-container`
- **YouTube**: `.ytp-caption-segment`
- **Amazon Prime**: `.atvwebplayersdk-captions-text`
- **Disney+**: `.dss-subtitle-renderer-cue`

## 🔧 Advanced Features

- **Custom Translation Prompts**: Modify translation instructions
- **Subtitle Styling**: Customize appearance and position
- **Multiple Domains**: Support multiple websites simultaneously
- **Real-time Testing**: Built-in API configuration testing

## Cooperation Promotion

Contact via WeChat Official Account

## Welcome to Follow the WeChat Official Account

There are related plugin usage tutorials. Follow and reply 'Translation Tool' to get it. Follow and reply '工具下载' to get the latest version. Regular sharing of audiovisual information worth watching.

<img src="https://raw.githubusercontent.com/ChenYCL/chrome-extension-udemy-translate/master/example/qrcode.BMP" alt="" height="148" width="148" />

## Donation Channel ☕️

### Discount

[1watchtv.com](https://1watchtv.com)

### Alipay

<img src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/alipay.JPG" alt="" height="148" width="148" />

### WeChat

<img src="https://github.com/ChenYCL/chrome-extension-udemy-translate/raw/v2.0.0/example/wechat.JPG" alt="" height="148" width="148" />

## Communication

[Telegram Group](https://t.me/joinchat/Gs1RFzD5MpIwJ7S-)

<img src="https://i.loli.net/2021/01/12/Vti5GPdqxjN3ETL.jpg" alt="" height="148" width="148" />

## Code Contribution

Contributions are welcome! Just send a PR for fixes and documentation updates, and open an issue for new features beforehand. Make sure tests pass and coverage remains high. Thank you!
