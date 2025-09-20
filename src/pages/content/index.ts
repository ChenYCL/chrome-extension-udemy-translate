import debounce from 'lodash/debounce'

interface StorageData {
  status: boolean
  apiKey: string
  baseURL: string
  prompt: string
  domConfigs: DomConfig[]
  backgroundColor?: string
  backgroundOpacity?: string
  originFontColor?: string
  originFontWeight?: string
  originFontSize?: string
  translatedFontColor?: string
  translatedFontWeight?: string
  translatedFontSize?: string
  // 新增字幕位置配置
  subtitlePosition?: 'bottom' | 'top' | 'center' | 'custom'
  subtitleX?: number
  subtitleY?: number
  subtitleWidth?: number
  subtitleHeight?: number
  isDraggable?: boolean
}

interface DomConfig {
  domain: string
  selector: string
}

const CONFIG = {
  DEFAULT_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.75)',
  DEFAULT_OPACITY: '0.8',
  DEFAULT_ORIGIN_FONT_COLOR: 'white',
  DEFAULT_TRANSLATED_FONT_COLOR: 'yellow',
  DEFAULT_FONT_WEIGHT: 'normal',
  DEFAULT_FONT_SIZE: '16',
  CHECK_INTERVAL: 300, // 0.3 秒 - 更频繁的检测
  // 新增默认位置配置
  DEFAULT_SUBTITLE_POSITION: 'bottom' as const,
  DEFAULT_SUBTITLE_WIDTH: 600,
  DEFAULT_SUBTITLE_HEIGHT: 120,
  DEFAULT_DRAGGABLE: true,
}

class TranslationManager {
  private isActive: boolean = true
  private intervalId: number | null = null
  private lastSubtitleContent: string = ''
  private lastSubtitleTimestamp: number = 0
  private translationCache: Map<string, string> = new Map()
  private videoWrapper: HTMLElement | null = null
  private subtitleTimeout: number | null = null
  // 新增浮动字幕容器相关属性
  private floatingSubtitle: HTMLElement | null = null
  private isDragging: boolean = false
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 }
  private mutationObserver: MutationObserver | null = null

  constructor() {}

  public async start() {
    console.log('TranslationManager starting...')
    await this.initialize()
    this.registerEventListeners()
    console.log('TranslationManager started')
  }

  private registerEventListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'STATUS_CHANGED') {
        this.handleStatusChange(message.status)
      }
    })

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        this.handleStorageChange(changes)
      }
    })

    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange()
    })
  }

  private async initialize() {
    try {
      const { status, domConfigs } = await this.getStorageData()
      if (status && this.isDomainAllowed(domConfigs)) {
        console.log('Initial setup: Starting translation')
        this.startTranslation()
      } else {
        console.log(
          'Initial setup: Translation not enabled or domain not allowed',
        )
      }
    } catch (error) {
      console.error('Initial setup error:', error)
    }
  }

  private async getStorageData(): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.id) {
        reject(new Error('Extension context invalidated'))
        return
      }
      chrome.storage.local.get(null, (result) => {
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError)
          : resolve(result as StorageData)
      })
    })
  }

  private isDomainAllowed(domConfigs: DomConfig[]): DomConfig | undefined {
    const currentDomain = window.location.origin
    return domConfigs?.find((config) => currentDomain === config.domain)
  }

  private startTranslation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
    }
    this.getStorageData()
      .then(({ domConfigs }) => {
        const matchedConfig = this.isDomainAllowed(domConfigs)
        if (matchedConfig) {
          this.createHideOriginalSubtitleStyle(matchedConfig.selector)
          this.setupMutationObserver(matchedConfig.selector)
        }
      })
      .catch((error) => {
        console.error('Error in startTranslation:', error)
      })
    this.intervalId = window.setInterval(
      () => this.checkAndTranslate(),
      CONFIG.CHECK_INTERVAL,
    )
  }

  private stopTranslation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }
    this.cleanupSubtitles()
    this.showOriginalSubtitle()
  }

  private checkAndTranslate = debounce(async () => {
    if (!this.isActive) {
      return
    }

    try {
      const { status, domConfigs } = await this.getStorageData()

      if (!status) {
        return
      }

      const matchedConfig = this.isDomainAllowed(domConfigs)

      if (matchedConfig) {
        console.log(
          '🔍 Using selector:',
          JSON.stringify(matchedConfig.selector),
        )

        // 验证选择器
        if (matchedConfig.selector.includes('..')) {
          console.error(
            '❌ Selector contains double dots:',
            matchedConfig.selector,
          )
          return
        }

        let rootElements: NodeListOf<Element>
        try {
          rootElements = document.querySelectorAll(matchedConfig.selector)
          console.log('📊 Found elements:', rootElements.length)
        } catch (error) {
          console.error(
            '❌ Invalid selector in checkAndTranslate:',
            matchedConfig.selector,
            error,
          )
          return
        }

        // 获取所有字幕文本并去重
        const allTexts = Array.from(rootElements)
          .map((element) => element.textContent?.trim())
          .filter((text) => text && text.length > 0)

        // 去除重复文本，只保留唯一值
        const uniqueTexts = allTexts.filter(
          (text, index, array) => array.indexOf(text) === index,
        )

        // 只处理最新的、不重复的字幕
        if (uniqueTexts.length > 0) {
          // 取最后一个非空文本作为当前字幕
          const currentText = uniqueTexts[uniqueTexts.length - 1]
          const currentTimestamp = Date.now()

          // 优化检测逻辑：检查内容变化和时间间隔
          const isNewContent = currentText !== this.lastSubtitleContent
          const isSignificantTimeGap =
            currentTimestamp - this.lastSubtitleTimestamp > 1000 // 1秒

          if (currentText && (isNewContent || isSignificantTimeGap)) {
            console.log('🎯 New subtitle detected:', currentText)
            console.log(
              '📅 Time since last:',
              currentTimestamp - this.lastSubtitleTimestamp,
              'ms',
            )
            this.lastSubtitleContent = currentText
            this.lastSubtitleTimestamp = currentTimestamp
            this.translateText(currentText, matchedConfig.selector)
          }
        }
      }
    } catch (error) {
      console.error('Error in checkAndTranslate:', error)
    }
  }, 100) // 减少防抖延迟到100ms

  private setupMutationObserver(selector: string) {
    // 清理现有的观察器
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }

    // 创建新的观察器
    this.mutationObserver = new MutationObserver((mutations) => {
      let hasSubtitleChange = false

      mutations.forEach((mutation) => {
        // 检查是否有字幕相关的变化
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData'
        ) {
          const target = mutation.target as Element

          // 检查变化的节点是否与字幕选择器匹配
          if (target.matches && target.matches(selector)) {
            hasSubtitleChange = true
          }

          // 检查子节点是否包含字幕元素
          if (target.querySelector && target.querySelector(selector)) {
            hasSubtitleChange = true
          }
        }
      })

      // 如果检测到字幕变化，立即触发检查
      if (hasSubtitleChange) {
        console.log('🔄 MutationObserver detected subtitle change')
        this.checkAndTranslate()
      }
    })

    // 开始观察整个文档的变化
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: false,
    })

    console.log('👁️ MutationObserver setup for selector:', selector)
  }

  private async translateText(text: string, selector: string) {
    if (!text.trim()) return

    if (this.translationCache.has(text)) {
      const translatedText = this.translationCache.get(text)!
      console.log('📋 Using cached translation:', text, '->', translatedText)
      this.updateSubtitle(text, translatedText)
      return
    }

    try {
      // 使用 Promise 包装 sendMessage 以更好地处理错误
      const sendMessagePromise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'TRANSLATE_TEXT',
            text: text,
            targetLanguage: 'Chinese',
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError)
              return
            }
            resolve(response)
          },
        )
      })

      const response = (await sendMessagePromise) as any

      if (response && response.type === 'TRANSLATED_TEXT') {
        let translatedText = response.translatedText.split('@@@')[0].trim()
        translatedText = translatedText
          .replace(/\n/g, ' ')
          .replace(/@/g, ' ')
          .trim()

        this.translationCache.set(text, translatedText)
        this.updateSubtitle(text, translatedText)
      } else if (response && response.type === 'TRANSLATION_ERROR') {
        console.error('Translation failed:', response.error)
      }
    } catch (error) {
      console.error('Error sending translation request:', error)
      // 如果是连接错误或扩展上下文失效，可能是 background script 未加载或插件重新加载
      if (
        error &&
        ((error as any).message?.includes('Could not establish connection') ||
          (error as any).message?.includes('Extension context invalidated'))
      ) {
        console.log(
          'Background script may not be loaded yet or extension reloaded, retrying in 2 seconds...',
        )
        setTimeout(() => this.translateText(text, selector), 2000)
      }
    }
  }

  private createHideOriginalSubtitleStyle(selector: string) {
    console.log(
      '🔍 Creating hide style for selector:',
      JSON.stringify(selector),
    )

    // 验证选择器格式
    if (!selector || typeof selector !== 'string') {
      console.error('❌ Invalid selector:', selector)
      return
    }

    // 检查是否有双点号问题
    if (selector.includes('..')) {
      console.error('❌ Selector contains double dots:', selector)
      return
    }

    try {
      // 测试选择器是否有效
      document.querySelectorAll(selector)
    } catch (error) {
      console.error('❌ Invalid CSS selector:', selector, error)
      return
    }

    const styleId = 'hide-original-subtitle-style'
    let style = document.getElementById(styleId) as HTMLStyleElement | null

    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }

    style.textContent = `
      ${selector} {
        display: none !important;
      }
    `

    console.log('✅ Hide style created successfully for:', selector)
  }

  private showOriginalSubtitle() {
    const styleElement = document.getElementById('hide-original-subtitle-style')
    if (styleElement) {
      styleElement.remove()
    }
  }

  private updateSubtitle(originalText: string, translatedText: string) {
    console.log('🔥translation:', originalText, '->', translatedText)

    this.getStorageData()
      .then((items: StorageData) => {
        this.createOrUpdateFloatingSubtitle(originalText, translatedText, items)
      })
      .catch((error) => {
        console.error('Error getting storage data:', error)
      })
  }

  private createOrUpdateFloatingSubtitle(
    originalText: string,
    translatedText: string,
    items: StorageData,
  ) {
    // 创建或获取浮动字幕容器
    if (!this.floatingSubtitle) {
      this.floatingSubtitle = this.createFloatingSubtitleContainer(items)
      document.body.appendChild(this.floatingSubtitle)
    }

    // 更新字幕内容
    this.updateFloatingSubtitleContent(
      originalText,
      translatedText,
      items,
      this.floatingSubtitle,
    )

    // 设置自动隐藏
    if (this.subtitleTimeout !== null) {
      clearTimeout(this.subtitleTimeout)
    }

    this.subtitleTimeout = window.setTimeout(() => {
      if (this.floatingSubtitle) {
        this.floatingSubtitle.style.display = 'none'
      }
      this.subtitleTimeout = null
    }, 3000)
  }

  private createFloatingSubtitleContainer(items: StorageData): HTMLElement {
    const container = document.createElement('div')
    container.className = 'udemy-translate-floating-subtitle'
    container.id = 'udemy-translate-floating-subtitle'

    const position = items.subtitlePosition || CONFIG.DEFAULT_SUBTITLE_POSITION
    const width = items.subtitleWidth || CONFIG.DEFAULT_SUBTITLE_WIDTH
    const height = items.subtitleHeight || CONFIG.DEFAULT_SUBTITLE_HEIGHT
    const isDraggable = items.isDraggable ?? CONFIG.DEFAULT_DRAGGABLE

    // 计算初始位置
    const initialPosition = this.calculateInitialPosition(
      position,
      width,
      height,
    )

    // 使用保存的位置或默认位置
    const x = items.subtitleX ?? initialPosition.x
    const y = items.subtitleY ?? initialPosition.y

    const backgroundColor =
      items.backgroundColor || CONFIG.DEFAULT_BACKGROUND_COLOR
    const opacity = items.backgroundOpacity || CONFIG.DEFAULT_OPACITY

    container.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      min-height: ${height}px;
      background-color: ${backgroundColor};
      opacity: ${opacity};
      border-radius: 8px;
      padding: 12px;
      z-index: 2147483647;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      transition: all 0.2s ease;
      cursor: ${isDraggable ? 'move' : 'default'};
      user-select: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    `

    // 添加拖拽功能
    if (isDraggable) {
      this.addDragFunctionality(container)
    }

    // 添加右键菜单（用于配置）
    this.addContextMenu(container)

    return container
  }

  private calculateInitialPosition(
    position: string,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    switch (position) {
      case 'top':
        return {
          x: (viewportWidth - width) / 2,
          y: 50,
        }
      case 'center':
        return {
          x: (viewportWidth - width) / 2,
          y: (viewportHeight - height) / 2,
        }
      case 'bottom':
      default:
        return {
          x: (viewportWidth - width) / 2,
          y: viewportHeight - height - 100,
        }
    }
  }

  private updateFloatingSubtitleContent(
    originalText: string,
    translatedText: string,
    items: StorageData,
    container: HTMLElement,
  ) {
    container.innerHTML = ''
    container.style.display = 'flex'

    const originalSubtitle = document.createElement('div')
    originalSubtitle.className = 'original-subtitle'
    originalSubtitle.style.cssText = `
      color: ${items.originFontColor || CONFIG.DEFAULT_ORIGIN_FONT_COLOR};
      font-weight: ${items.originFontWeight || CONFIG.DEFAULT_FONT_WEIGHT};
      font-size: ${items.originFontSize || CONFIG.DEFAULT_FONT_SIZE}px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      margin-bottom: 8px;
      line-height: 1.4;
    `
    originalSubtitle.textContent = originalText

    const translatedSubtitle = document.createElement('div')
    translatedSubtitle.className = 'translated-subtitle'
    translatedSubtitle.style.cssText = `
      color: ${
        items.translatedFontColor || CONFIG.DEFAULT_TRANSLATED_FONT_COLOR
      };
      font-weight: ${items.translatedFontWeight || CONFIG.DEFAULT_FONT_WEIGHT};
      font-size: ${items.translatedFontSize || CONFIG.DEFAULT_FONT_SIZE}px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      line-height: 1.4;
    `
    translatedSubtitle.textContent = translatedText

    container.appendChild(originalSubtitle)
    container.appendChild(translatedSubtitle)
  }

  private addDragFunctionality(container: HTMLElement) {
    let startX = 0
    let startY = 0
    let initialX = 0
    let initialY = 0

    const handleMouseDown = (e: MouseEvent) => {
      this.isDragging = true
      startX = e.clientX
      startY = e.clientY
      initialX = container.offsetLeft
      initialY = container.offsetTop

      container.style.cursor = 'grabbing'
      container.style.transition = 'none'

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const newX = initialX + deltaX
      const newY = initialY + deltaY

      // 边界检查
      const maxX = window.innerWidth - container.offsetWidth
      const maxY = window.innerHeight - container.offsetHeight

      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))

      container.style.left = `${clampedX}px`
      container.style.top = `${clampedY}px`
    }

    const handleMouseUp = () => {
      if (this.isDragging) {
        this.isDragging = false
        container.style.cursor = 'move'
        container.style.transition = 'all 0.2s ease'

        // 保存位置
        this.saveSubtitlePosition(container.offsetLeft, container.offsetTop)

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }

    container.addEventListener('mousedown', handleMouseDown)
  }

  private addContextMenu(container: HTMLElement) {
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.showPositionMenu(e.clientX, e.clientY)
    })
  }

  private showPositionMenu(x: number, y: number) {
    // 移除现有菜单
    const existingMenu = document.getElementById('subtitle-position-menu')
    if (existingMenu) {
      existingMenu.remove()
    }

    const menu = document.createElement('div')
    menu.id = 'subtitle-position-menu'
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 8px 0;
      z-index: 2147483648;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: white;
      min-width: 150px;
    `

    const positions = [
      { label: '顶部', value: 'top' },
      { label: '中央', value: 'center' },
      { label: '底部', value: 'bottom' },
      { label: '重置位置', value: 'reset' },
    ]

    positions.forEach((pos) => {
      const item = document.createElement('div')
      item.textContent = pos.label
      item.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      `
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
      })
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent'
      })
      item.addEventListener('click', () => {
        this.handlePositionChange(pos.value)
        menu.remove()
      })
      menu.appendChild(item)
    })

    document.body.appendChild(menu)

    // 点击其他地方关闭菜单
    setTimeout(() => {
      document.addEventListener('click', () => menu.remove(), { once: true })
    }, 100)
  }

  private async handlePositionChange(position: string) {
    if (position === 'reset') {
      // 重置到默认位置
      await this.saveSubtitlePosition(null, null, 'bottom')
    } else {
      await this.saveSubtitlePosition(null, null, position)
    }

    // 重新创建字幕容器
    if (this.floatingSubtitle) {
      this.floatingSubtitle.remove()
      this.floatingSubtitle = null
    }
  }

  private async saveSubtitlePosition(
    x?: number | null,
    y?: number | null,
    position?: string,
  ) {
    try {
      const updateData: Partial<StorageData> = {}

      if (x !== null && x !== undefined) updateData.subtitleX = x
      if (y !== null && y !== undefined) updateData.subtitleY = y
      if (position) updateData.subtitlePosition = position as any

      await chrome.storage.local.set(updateData)
    } catch (error) {
      console.error('Error saving subtitle position:', error)
    }
  }

  private cleanupSubtitles() {
    // 清理浮动字幕
    if (this.floatingSubtitle) {
      this.floatingSubtitle.remove()
      this.floatingSubtitle = null
    }

    // 清理旧的字幕系统
    if (this.videoWrapper) {
      const subtitleElement = this.videoWrapper.querySelector(
        '.translated-wrapper',
      )
      if (subtitleElement) {
        subtitleElement.remove()
      }
    }

    if (this.subtitleTimeout !== null) {
      clearTimeout(this.subtitleTimeout)
      this.subtitleTimeout = null
    }
  }

  public handleStatusChange(status: boolean) {
    console.log('Status changed:', status)
    if (status) {
      this.getStorageData()
        .then(({ domConfigs }) => {
          if (this.isDomainAllowed(domConfigs)) {
            console.log('Status changed to active, starting translation')
            this.startTranslation()
          } else {
            console.log('Status changed to active, but domain not allowed')
          }
        })
        .catch((error) => {
          console.error('Error in STATUS_CHANGED:', error)
        })
    } else {
      console.log('Status changed to inactive, stopping translation')
      this.stopTranslation()
    }
  }

  public handleStorageChange(changes: {
    [key: string]: chrome.storage.StorageChange
  }) {
    console.log('Storage changed:', changes)
    if (changes.status || changes.domConfigs) {
      this.getStorageData()
        .then(({ status, domConfigs }) => {
          if (status && this.isDomainAllowed(domConfigs)) {
            console.log('Status or domConfigs changed, starting translation')
            this.startTranslation()
          } else {
            console.log('Status or domConfigs changed, stopping translation')
            this.stopTranslation()
          }
        })
        .catch((error) => {
          console.error('Error in storage change:', error)
        })
    }
    if (changes.apiKey || changes.baseURL || changes.prompt) {
      this.getStorageData()
        .then(({ domConfigs }) => {
          if (this.isDomainAllowed(domConfigs)) {
            console.log('API settings changed, triggering translation')
            this.checkAndTranslate()
          } else {
            console.log('API settings changed, but domain not allowed')
          }
        })
        .catch((error) => {
          console.error('Error in storage change:', error)
        })
    }
  }

  public handleVisibilityChange() {
    this.isActive = !document.hidden
    console.log('Visibility changed, isActive:', this.isActive)
    if (this.isActive) {
      this.getStorageData()
        .then(({ status, domConfigs }) => {
          if (status && this.isDomainAllowed(domConfigs)) {
            console.log('Page became visible, starting translation')
            this.startTranslation()
          } else {
            console.log(
              'Page became visible, but translation not enabled or domain not allowed',
            )
          }
        })
        .catch((error) => {
          console.error('Error in visibility change:', error)
        })
    } else {
      console.log('Page became hidden, stopping translation')
      this.stopTranslation()
    }
  }
}

const translationManager = new TranslationManager()

// Start the translation manager when the content script loads
translationManager.start()

// Also start the translation manager when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  translationManager.start()
})
