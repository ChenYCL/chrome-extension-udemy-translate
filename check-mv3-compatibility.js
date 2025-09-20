#!/usr/bin/env node

/**
 * Chrome Extension Manifest V3 兼容性检查脚本
 * 检查常见的 MV2 到 MV3 迁移问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Chrome Extension Manifest V3 兼容性检查\n');

// 检查 manifest.json
function checkManifest() {
    console.log('📋 检查 manifest.json...');
    
    const manifestPath = path.join(__dirname, 'public/manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.log('❌ 未找到 manifest.json 文件');
        return false;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let issues = [];
    
    // 检查 manifest_version
    if (manifest.manifest_version !== 3) {
        issues.push('manifest_version 应该是 3');
    } else {
        console.log('✅ manifest_version: 3');
    }
    
    // 检查 background
    if (manifest.background) {
        if (manifest.background.page || manifest.background.scripts) {
            issues.push('background 应该使用 service_worker 而不是 page 或 scripts');
        } else if (manifest.background.service_worker) {
            console.log('✅ background: 使用 service_worker');
        }
    }
    
    // 检查 action vs browser_action
    if (manifest.browser_action) {
        issues.push('browser_action 已废弃，应使用 action');
    } else if (manifest.action) {
        console.log('✅ action: 正确使用');
    }
    
    // 检查权限
    const deprecatedPermissions = ['tabs', 'background', 'declarativeContent', 'contextMenus'];
    const usedDeprecatedPermissions = manifest.permissions?.filter(p => 
        deprecatedPermissions.includes(p)
    );
    
    if (usedDeprecatedPermissions?.length > 0) {
        console.log('⚠️  可能不必要的权限:', usedDeprecatedPermissions.join(', '));
        console.log('   建议检查是否真的需要这些权限');
    }
    
    // 检查 host_permissions
    if (manifest.permissions?.some(p => p.includes('://'))) {
        issues.push('URL 权限应该移到 host_permissions 中');
    } else if (manifest.host_permissions) {
        console.log('✅ host_permissions: 正确配置');
    }
    
    if (issues.length > 0) {
        console.log('❌ Manifest 问题:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        return false;
    }
    
    console.log('✅ Manifest V3 兼容性检查通过\n');
    return true;
}

// 检查代码中的废弃 API
function checkDeprecatedAPIs() {
    console.log('🔍 检查废弃的 Chrome API...');
    
    const deprecatedAPIs = [
        'chrome.extension',
        'chrome.browserAction',
        'chrome.pageAction',
        'chrome.background.page',
        'executeScript',
        'insertCSS'
    ];
    
    const filesToCheck = [
        'src/pages/background/index.ts',
        'src/pages/content/index.ts',
        'src/pages/popup/Popup.tsx',
        'src/pages/options/Options.tsx'
    ];
    
    let foundIssues = false;
    
    filesToCheck.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            deprecatedAPIs.forEach(api => {
                if (content.includes(api)) {
                    console.log(`⚠️  在 ${filePath} 中发现废弃 API: ${api}`);
                    foundIssues = true;
                }
            });
        }
    });
    
    if (!foundIssues) {
        console.log('✅ 未发现废弃的 Chrome API\n');
    } else {
        console.log('');
    }
    
    return !foundIssues;
}

// 检查消息传递模式
function checkMessagePassing() {
    console.log('📨 检查消息传递模式...');
    
    const backgroundPath = 'src/pages/background/index.ts';
    const contentPath = 'src/pages/content/index.ts';
    
    let issues = [];
    
    if (fs.existsSync(backgroundPath)) {
        const content = fs.readFileSync(backgroundPath, 'utf8');
        
        // 检查是否正确处理异步响应
        if (content.includes('chrome.runtime.onMessage.addListener') && 
            !content.includes('return true')) {
            issues.push('Background script 的消息监听器应该返回 true 以支持异步响应');
        }
        
        // 检查是否有错误处理
        if (content.includes('chrome.tabs.sendMessage') && 
            !content.includes('chrome.runtime.lastError')) {
            console.log('⚠️  建议在 sendMessage 中添加错误处理');
        }
    }
    
    if (fs.existsSync(contentPath)) {
        const content = fs.readFileSync(contentPath, 'utf8');
        
        // 检查是否有错误处理
        if (content.includes('chrome.runtime.sendMessage') && 
            !content.includes('chrome.runtime.lastError')) {
            console.log('⚠️  建议在 sendMessage 中添加错误处理');
        }
    }
    
    if (issues.length > 0) {
        console.log('❌ 消息传递问题:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        return false;
    }
    
    console.log('✅ 消息传递模式检查通过\n');
    return true;
}

// 检查文件结构
function checkFileStructure() {
    console.log('📁 检查文件结构...');
    
    const unnecessaryFiles = [
        'src/pages/background/index.html',
        'public/background.html'
    ];
    
    let foundUnnecessary = false;
    
    unnecessaryFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            console.log(`⚠️  发现不必要的文件: ${filePath} (MV3 不需要 background HTML)`);
            foundUnnecessary = true;
        }
    });
    
    if (!foundUnnecessary) {
        console.log('✅ 文件结构检查通过\n');
    } else {
        console.log('');
    }
    
    return !foundUnnecessary;
}

// 主检查函数
function runCompatibilityCheck() {
    console.log('开始 Chrome Extension Manifest V3 兼容性检查...\n');
    
    const results = [
        checkManifest(),
        checkDeprecatedAPIs(),
        checkMessagePassing(),
        checkFileStructure()
    ];
    
    const allPassed = results.every(result => result);
    
    console.log('📊 检查结果:');
    if (allPassed) {
        console.log('🎉 所有检查都通过！你的扩展已兼容 Manifest V3');
    } else {
        console.log('⚠️  发现一些问题，建议修复后重新检查');
    }
    
    console.log('\n💡 额外建议:');
    console.log('- 定期测试扩展在最新版 Chrome 中的功能');
    console.log('- 检查控制台是否有警告或错误信息');
    console.log('- 确保所有异步操作都有适当的错误处理');
    console.log('- 考虑使用 chrome.action API 替代旧的 browserAction');
    
    return allPassed;
}

// 运行检查
if (require.main === module) {
    runCompatibilityCheck();
}

module.exports = { runCompatibilityCheck };
