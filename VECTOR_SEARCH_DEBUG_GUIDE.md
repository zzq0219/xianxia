# 向量搜索调试指南

## 问题：搜索"小舞"完全没有结果

### 可能的原因和解决方案

#### 原因1：记忆还没有向量化 ⭐最常见
**症状**：搜索任何内容都没有结果

**检查方法**：
1. 打开浏览器开发者工具（F12）
2. 切换到 Console（控制台）标签
3. 输入以下代码检查向量数据库：
```javascript
// 检查IndexedDB中的向量数据
const request = indexedDB.open('XianxiaVectorStore', 1);
request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = () => {
        const vectors = getAllRequest.result;
        console.log(`数据库中共有 ${vectors.length} 个向量`);
        console.log('向量列表:', vectors);
        
        // 检查是否有包含"小舞"的向量
        const xiaowuVectors = vectors.filter(v => 
            v.text.includes('小舞') || 
            (v.metadata.involvedCharacters && v.metadata.involvedCharacters.includes('小舞'))
        );
        console.log(`包含"小舞"的向量数量: ${xiaowuVectors.length}`);
        console.log('小舞相关向量:', xiaowuVectors);
    };
};
```

**解决方案**：
1. 打开记忆界面
2. 点击"向量化"按钮
3. 选择包含"小舞"的记忆
4. 点击"向量化已选"按钮
5. 等待向量化完成（会显示进度条）

---

#### 原因2：向量化配置未启用
**症状**：向量化按钮是灰色的，或者提示"向量化功能未启用"

**检查方法**：
在控制台输入：
```javascript
// 检查向量化配置
const gameState = JSON.parse(localStorage.getItem('gameState'));
console.log('向量化配置:', gameState.vectorConfig);
```

**解决方案**：
1. 打开设置（点击齿轮图标）
2. 找到"向量化设置"部分
3. 确保"启用向量化"开关是打开的
4. 配置API信息：
   - API URL（OpenAI或Ollama）
   - API Key
   - 模型名称

---

#### 原因3：API配置错误
**症状**：向量化时报错，或者一直显示"正在向量化"

**检查方法**：
查看浏览器控制台的错误信息，可能看到：
- `Failed to fetch`
- `API key invalid`
- `Network error`

**解决方案**：
1. 检查API URL是否正确
   - OpenAI: `https://api.openai.com/v1`
   - Ollama本地: `http://localhost:11434`
2. 检查API Key是否有效
3. 如果使用Ollama，确保Ollama服务正在运行
4. 检查网络连接

---

#### 原因4：相似度阈值太高
**症状**：有些搜索有结果，有些没有

**检查方法**：
在语义搜索面板中，展开"高级选项"，查看相似度阈值设置。

**解决方案**：
1. 在语义搜索界面
2. 展开"高级选项"
3. 将相似度阈值调低（例如从70%降到60%）
4. 重新搜索

---

#### 原因5：向量化时使用了不同的embedding模型
**症状**：搜索结果不准确或完全没有结果

**原因**：向量化记忆时用的是模型A，搜索时用的是模型B，两个模型的向量空间不兼容。

**检查方法**：
```javascript
// 检查向量的模型
const request = indexedDB.open('XianxiaVectorStore', 1);
request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = () => {
        const vectors = getAllRequest.result;
        const models = [...new Set(vectors.map(v => v.model))];
        console.log('数据库中使用的模型:', models);
        
        const currentModel = JSON.parse(localStorage.getItem('gameState')).vectorConfig.model;
        console.log('当前配置的模型:', currentModel);
        
        if (models.length > 1 || !models.includes(currentModel)) {
            console.warn('⚠️ 警告：向量模型不一致！');
            console.warn('建议清空向量数据库并重新向量化');
        }
    };
};
```

**解决方案**：
1. 确保始终使用同一个embedding模型
2. 如果更换了模型，需要清空并重新向量化所有记忆

---

## 完整的调试步骤

### 步骤1：检查向量数据库
```javascript
// 在浏览器控制台执行
(async function checkVectorDB() {
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('XianxiaVectorStore', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const vectors = await new Promise(resolve => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
    
    console.log('=== 向量数据库检查 ===');
    console.log(`总向量数: ${vectors.length}`);
    
    if (vectors.length === 0) {
        console.error('❌ 数据库是空的！请先向量化一些记忆。');
        return;
    }
    
    // 按分类统计
    const byCategory = {};
    vectors.forEach(v => {
        byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    });
    console.log('按分类统计:', byCategory);
    
    // 检查metadata完整性
    const incomplete = vectors.filter(v => 
        !v.metadata.timestamp || 
        !v.metadata.realTimestamp
    );
    console.log(`元数据不完整的向量: ${incomplete.length}`);
    
    // 检查"小舞"相关
    const xiaowu = vectors.filter(v => 
        v.text.includes('小舞') || 
        (v.metadata.involvedCharacters && v.metadata.involvedCharacters.includes('小舞'))
    );
    console.log(`包含"小舞"的向量: ${xiaowu.length}`);
    if (xiaowu.length > 0) {
        console.log('小舞相关向量示例:', xiaowu[0]);
    }
    
    console.log('===================');
})();
```

### 步骤2：测试向量化API
```javascript
// 测试embedding API是否正常工作
(async function testVectorAPI() {
    const gameState = JSON.parse(localStorage.getItem('gameState'));
    const config = gameState.vectorConfig;
    
    console.log('=== 测试向量化API ===');
    console.log('配置:', config);
    
    if (!config.enabled) {
        console.error('❌ 向量化功能未启用');
        return;
    }
    
    if (!config.apiKey && !config.apiUrl.includes('localhost')) {
        console.error('❌ API Key未配置');
        return;
    }
    
    try {
        // 尝试向量化一个测试文本
        const testText = "这是一个测试";
        console.log(`正在测试向量化: "${testText}"`);
        
        // 这里需要调用实际的向量化服务
        // 由于无法直接访问，建议在UI中测试
        console.log('✅ API配置看起来正常，请在向量化管理界面测试');
        
    } catch (error) {
        console.error('❌ API测试失败:', error);
    }
    
    console.log('===================');
})();
```

### 步骤3：测试搜索功能
```javascript
// 测试语义搜索
(async function testSearch() {
    console.log('=== 测试语义搜索 ===');
    
    // 检查是否有向量
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('XianxiaVectorStore', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['vectors'], 'readonly');
    const store = transaction.objectStore('vectors');
    const count = await new Promise(resolve => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
    });
    
    if (count === 0) {
        console.error('❌ 没有向量可以搜索！');
        console.log('请先：1. 打开记忆界面 → 2. 点击向量化按钮 → 3. 选择并向量化记忆');
        return;
    }
    
    console.log(`✅ 数据库中有 ${count} 个向量`);
    console.log('现在可以在语义搜索界面测试搜索功能');
    console.log('提示：如果搜索不到结果，尝试：');
    console.log('  1. 降低相似度阈值（高级选项）');
    console.log('  2. 取消分类过滤');
    console.log('  3. 使用更通用的搜索词');
    
    console.log('===================');
})();
```

## 快速修复清单

- [ ] 确认向量化功能已启用
- [ ] 确认API配置正确（URL + Key）
- [ ] 在记忆界面向量化了包含"小舞"的记忆
- [ ] 向量化成功完成（看到成功提示）
- [ ] 在语义搜索中搜索"小舞"
- [ ] 如果没结果，降低相似度阈值
- [ ] 如果还是没结果，检查分类过滤

## 如果所有方法都不行

尝试以下"终极"调试方法：

### 方法1：清空并重新向量化
```javascript
// ⚠️ 警告：这会删除所有向量数据！
indexedDB.deleteDatabase('XianxiaVectorStore');
console.log('向量数据库已清空，请重新向量化记忆');
```

### 方法2：查看详细错误日志
1. F12打开开发者工具
2. 切换到Network（网络）标签
3. 执行向量化操作
4. 查看API请求的详细信息和错误

### 方法3：使用本地Ollama测试
如果API有问题，可以尝试本地Ollama：
1. 安装Ollama
2. 运行 `ollama pull nomic-embed-text`
3. 在设置中配置：
   - API URL: `http://localhost:11434`
   - 模型: `nomic-embed-text`
4. 重新向量化和搜索

## 联系支持

如果问题仍未解决，请提供：
1. 浏览器控制台的完整日志
2. 向量数据库检查的输出
3. 向量化配置截图
4. 搜索界面的截图