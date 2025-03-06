// 使用独特的命名空间前缀
const GP_PREFIX = 'gridea_push_';

// 存储API辅助函数
function GP_getStorageApi() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    return chrome.storage.sync;
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  } else {
    console.warn('Chrome storage API not available, using fallback storage');
    let fallbackStorage = {};
    return {
      get: function(keys, callback) {
        let result = {};
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            const value = localStorage.getItem(`${GP_PREFIX}${key}`);
            if (value !== null) {
              try {
                result[key] = JSON.parse(value);
              } catch (e) {
                result[key] = value;
              }
            }
          });
        } else if (typeof keys === 'object') {
          Object.keys(keys).forEach(key => {
            const value = localStorage.getItem(`${GP_PREFIX}${key}`);
            if (value !== null) {
              try {
                result[key] = JSON.parse(value);
              } catch (e) {
                result[key] = value;
              }
            } else {
              result[key] = keys[key];
            }
          });
        } else {
          const value = localStorage.getItem(`${GP_PREFIX}${keys}`);
          if (value !== null) {
            try {
              result[keys] = JSON.parse(value);
            } catch (e) {
              result[keys] = value;
            }
          }
        }
        callback(result);
      },
      set: function(items, callback) {
        Object.keys(items).forEach(key => {
          localStorage.setItem(`${GP_PREFIX}${key}`, JSON.stringify(items[key]));
        });
        if (callback) callback();
      }
    };
  }
}

// 安全地发送消息
function GP_sendMessageSafely(message, callback) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage(message, callback);
    } catch (e) {
      console.error('Failed to send message:', e);
      if (callback) {
        callback({success: false, error: 'Message sending failed'});
      }
    }
  } else {
    console.error('Chrome runtime API not available');
    if (callback) {
      callback({success: false, error: 'Runtime API not available'});
    }
  }
}

// 显示侧边栏
function GP_showSidebar() {
  let sidebar = document.querySelector(`.${GP_PREFIX}sidebar`);
  if (!sidebar) {
    // 创建侧边栏
    sidebar = document.createElement('div');
    sidebar.className = `${GP_PREFIX}sidebar word-slider`; // 添加原始的class以使用原始CSS
    document.body.appendChild(sidebar);

    // 添加样式
    const style = document.createElement('style');
    style.id = `${GP_PREFIX}style`;
    style.textContent = `
      /* 保持原始样式，但为所有选择器添加命名空间前缀 */
      .${GP_PREFIX}sidebar {
        position: fixed;
        top: 0;
        right: -350px;
        width: 350px;
        height: 100vh;
        background: var(--background-primary, #2B2B2C);
        transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 1px solid var(--border-color, #2F3336);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: var(--text-primary, #E7E9EA);
      }
      
      .${GP_PREFIX}sidebar.active {
        right: 0;
      }
      
      .${GP_PREFIX}header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color, #2F3336);
      }
      
      .${GP_PREFIX}header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary, #E7E9EA);
      }
      
      .${GP_PREFIX}collapse-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary, #71767B);
        border-radius: 50%;
        transition: background-color 0.2s;
      }
      
      .${GP_PREFIX}collapse-btn:hover {
        background-color: rgba(239, 243, 244, 0.1);
        color: var(--text-primary, #E7E9EA);
      }
      
      .${GP_PREFIX}sidebar label {
        font-size: 14px;
        margin-bottom: 8px;
        color: var(--text-primary, #E7E9EA);
        font-weight: 500;
        display: block;
      }
      
      .${GP_PREFIX}sidebar textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color, #2F3336);
        border-radius: 8px;
        resize: vertical;
        font-family: inherit;
        box-sizing: border-box;
        min-height: 500px;
        background-color: var(--background-tertiary, #202327);
        color: var(--text-primary, #E7E9EA);
        font-size: 14px;
        line-height: 1.5;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      
      .${GP_PREFIX}sidebar textarea:focus {
        outline: none;
        border-color: var(--primary-color, #1D9BF0);
        box-shadow: 0 0 0 1px var(--primary-color, #1D9BF0);
      }
      
      .${GP_PREFIX}button-group {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
      
      .${GP_PREFIX}sidebar button {
        background: var(--primary-color, #1D9BF0);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background-color 0.2s;
      }
      
      .${GP_PREFIX}sidebar button:hover {
        background: var(--primary-hover, #1A8CD8);
      }
      
      .${GP_PREFIX}status {
        margin-top: 16px;
        font-size: 14px;
        min-height: 20px;
        color: var(--text-secondary, #71767B);
        transition: color 0.2s;
      }
      
      .${GP_PREFIX}status-loading {
        color: var(--primary-color, #1D9BF0);
      }
      
      .${GP_PREFIX}status-success {
        color: #00BA7C;
      }
      
      .${GP_PREFIX}status-error {
        color: #F4212E;
      }
      
      .${GP_PREFIX}toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--background-secondary, #2B2B2C);
        color: var(--text-primary, #E7E9EA);
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s, transform 0.3s;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border: 1px solid var(--border-color, #2F3336);
        max-width: 280px;
      }
      
      .${GP_PREFIX}toast.active {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // 初始化侧边栏内容
    GP_initializeSidebar(sidebar);
  } else {
    sidebar.classList.add('active');
  }
}

// 初始化侧边栏内容
function GP_initializeSidebar(sidebar) {
  sidebar.innerHTML = `
    <div class="${GP_PREFIX}header">
      <h3>Gridea Push</h3>
      <button class="${GP_PREFIX}collapse-btn" title="折叠侧边栏">×</button>
    </div>
    <label>
      笔记内容（Markdown）：
      <textarea id="${GP_PREFIX}noteContent" rows="8" placeholder="请输入 Markdown 内容"></textarea>
    </label>
    <div class="${GP_PREFIX}button-group">
      <button id="${GP_PREFIX}saveNote">保存到 Gridea</button>
    </div>
    <div id="${GP_PREFIX}status" class="${GP_PREFIX}status"></div>
  `;
  sidebar.classList.add('active');

  // 折叠侧边栏
  sidebar.querySelector(`.${GP_PREFIX}collapse-btn`).addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  // 保存笔记
  sidebar.querySelector(`#${GP_PREFIX}saveNote`).addEventListener('click', () => {
    const markdownContent = sidebar.querySelector(`#${GP_PREFIX}noteContent`).value.trim();
    const status = sidebar.querySelector(`#${GP_PREFIX}status`);

    if (!markdownContent) {
      GP_showToast('请输入笔记内容！');
      return;
    }

    // 显示加载状态
    status.textContent = '正在保存';
    status.className = `${GP_PREFIX}status ${GP_PREFIX}status-loading`;

    // 安全地发送消息
    GP_sendMessageSafely(
      { action: `${GP_PREFIX}createNote`, markdownContent: markdownContent }, 
      (response) => {
        if (response && response.success) {
          status.textContent = '笔记已保存到 Gridea！';
          status.className = `${GP_PREFIX}status ${GP_PREFIX}status-success`;
          sidebar.querySelector(`#${GP_PREFIX}noteContent`).value = ''; // 清空输入框
        } else {
          const errorMsg = response && response.error ? response.error : '未知错误';
          status.textContent = `保存失败：${errorMsg}`;
          status.className = `${GP_PREFIX}status ${GP_PREFIX}status-error`;
        }
        setTimeout(() => { 
          status.textContent = ''; 
          status.className = `${GP_PREFIX}status`;
        }, 3000);
      }
    );
  });
}

// 显示提示消息
function GP_showToast(message) {
  // 检查是否已存在toast元素
  let toast = document.querySelector(`.${GP_PREFIX}toast`);
  if (toast) {
    toast.remove(); // 移除现有的toast
  }
  
  // 创建新的toast
  toast = document.createElement('div');
  toast.className = `${GP_PREFIX}toast`; 
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 显示toast
  setTimeout(() => {
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, 10);
}

// 消息监听器
function GP_setupMessageListener() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === `${GP_PREFIX}showSidebar`) {
          GP_showSidebar();
          sendResponse({ success: true });
          return true;
        }
      });
    } catch (e) {
      console.error('Failed to add message listener:', e);
    }
  } else {
    console.warn('Chrome messaging API not available');
  }
}

// 初始化消息监听
GP_setupMessageListener();

// 导出函数以供外部使用
if (typeof window !== 'undefined') {
  window[`${GP_PREFIX}showSidebar`] = GP_showSidebar;
}