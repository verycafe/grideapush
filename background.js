// 定义一个统一的命名空间前缀
const GP_PREFIX = 'gridea_push_';

// 初始化右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: `${GP_PREFIX}openSidebar`,
    title: "Open Gridea Push Sidebar",
    contexts: ["all"]
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === `${GP_PREFIX}openSidebar` && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: `${GP_PREFIX}showSidebar` });
  }
});

// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: `${GP_PREFIX}showSidebar` }, (response) => {
      if (chrome.runtime.lastError) {
        // 如果无法发送消息，尝试注入内容脚本
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['sidebar.js']
        }, () => {
          // 注入后重新尝试发送消息
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: `${GP_PREFIX}showSidebar` });
          }, 100);
        });
      }
    });
  }
});

// 处理来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === `${GP_PREFIX}createNote`) {
    GP_createNote(message.markdownContent, sendResponse);
    return true; // 保持消息通道开放以异步响应
  }
});

// 发送笔记到 Gridea API
function GP_createNote(markdownContent, sendResponse) {
  chrome.storage.sync.get(["apiToken"], (result) => {
    const token = result.apiToken;
    if (!token) {
      sendResponse({ success: false, error: "请在设置中配置您的 Gridea API 令牌！" });
      return;
    }

    const url = "https://web.gridea.dev/api/v1/note";
    fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "data": {
          "markdown": markdownContent
        }
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API 请求失败：${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
  });
}