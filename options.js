document.addEventListener('DOMContentLoaded', () => {
    // 加载已保存的 API 令牌
    chrome.storage.sync.get(['apiToken'], (result) => {
      const apiTokenInput = document.getElementById('apiToken');
      apiTokenInput.value = result.apiToken || '';
    });
  
    document.getElementById('save').addEventListener('click', () => {
      const apiToken = document.getElementById('apiToken').value.trim();
      const status = document.getElementById('status');
    
      if (!apiToken) {
        status.textContent = '请输入有效的 API 令牌！';
        status.style.color = '#f44336'; // 错误信息显示为红色
        setTimeout(() => { status.textContent = ''; }, 3000);
        return;
      }
    
      chrome.storage.sync.set({ apiToken: apiToken }, () => {
        status.textContent = 'API 令牌已保存！';
        status.style.color = '#4CAF50'; // 成功信息显示为绿色
        setTimeout(() => { status.textContent = ''; }, 3000);
      });
    });
  });