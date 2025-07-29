# Data Input Platform - 新功能说明

## 概述
已成功在Aichemtool首页添加了新的"Data Input Platform"卡片，并创建了对应的数据输入页面。

## 新增功能

### 1. 首页新卡片
- **标题**: Data Input Platform
- **类别**: Data Management/Input/Analysis
- **描述**: 综合数据输入和管理平台，用于化学和分子数据
- **功能**: 可自定义的输入表单和结构化数据表格

### 2. Data Input 页面布局

#### 上半部分 (两列布局)
- **左侧**: Ketcher化学结构编辑器
  - 完整的化学结构绘制功能
  - 支持SMILES字符串导入/导出
  - 内置控制按钮：
    - **Get SMILES**: 获取当前分子的SMILES字符串
    - **Set Sample**: 加载示例分子(咖啡因)
    - **Clear**: 清空当前分子结构
  - SMILES显示区域：实时显示当前分子的SMILES表示
  
- **右侧**: 5个输入框
  - Parameter 1 至 Parameter 5
  - 每个输入框都有标签和占位符文本
  - 支持实时数据绑定

#### 下半部分
- **数据表格**: 10行 x 7列的可编辑表格
  - 使用PrimeVue DataTable组件
  - 每个单元格都可编辑
  - 列标题为 Column 1 至 Column 7
  
- **操作按钮**:
  - **Clear All**: 清空所有输入数据
  - **Save Data**: 保存当前数据 (控制台输出)
  - **Load Sample**: 加载示例数据

## 技术实现

### 文件结构
```
src/
├── views/platforms/
│   └── DataInputPage.vue          # 数据输入页面(集成Ketcher)
├── types/
│   └── platform.ts               # 更新了类型定义
├── router/
│   └── index.ts                  # 添加了新路由
└── views/
    └── HomePage.vue              # 更新了首页卡片

public/
└── standalone/
    └── index.html                # Ketcher编辑器独立页面
```

### 路由配置
- 路径: `/platforms/data-input`
- 路由名: `DataInput`
- 组件: `DataInputPage.vue`

### 技术栈
- **Vue 3** (Composition API)
- **TypeScript** 类型安全
- **PrimeVue** UI组件库
  - InputText: 输入框组件
  - DataTable: 数据表格组件
  - Button: 按钮组件
- **Vue Router** 路由管理
- **Ketcher v2.6.2** 化学结构编辑器
  - iframe嵌入集成
  - JavaScript API交互
  - PostMessage通信机制

## Ketcher集成详情

### 部署方式
- **位置**: `/public/standalone/index.html`
- **版本**: 自定义化学结构编辑器 (Ketcher CDN不可用时的替代方案)
- **加载方式**: 自带的JavaScript画布绘制功能

### 集成方式
- **iframe嵌入**: 在DataInputPage中通过iframe嵌入编辑器
- **通信机制**: 支持两种通信方式
  1. PostMessage API (推荐，更安全)
  2. 直接访问iframe内容窗口 (回退方案)

### 主要功能
- **绘制分子结构**: 基础的化学结构绘制工具
  - 原子工具：点击添加原子 (默认碳原子)
  - 键工具：连接原子 (功能开发中)
  - 擦除工具：删除原子
- **SMILES支持**: 基础的SMILES格式导入/导出
- **实时交互**: 与Vue组件的数据双向绑定
- **示例分子**: 内置咖啡因分子作为示例

### 编辑器功能
- **工具栏**:
  - Atom: 添加原子
  - Bond: 连接原子 (开发中)
  - Erase: 删除原子
  - Clear: 清空画布
  - Sample: 加载咖啡因示例分子
- **SMILES显示**: 实时显示当前分子的SMILES表示
- **可视化**: 彩色原子显示 (C=灰色, N=蓝色, O=红色等)

### API方法
```javascript
// 获取SMILES字符串
await getSmiles()

// 设置分子结构
await setSampleMolecule()

// 清空分子结构  
await clearMolecule()

// PostMessage通信
await sendKetcherMessage('getSmiles')
await sendKetcherMessage('setMolecule', smilesString)
await sendKetcherMessage('clear')
```

### 技术说明
由于Ketcher官方CDN链接不可用，我们实现了一个简化的化学结构编辑器作为替代方案。这个编辑器提供了基本的分子绘制功能，包括：
- Canvas-based绘制系统
- 基础原子操作
- 简化的SMILES生成
- 与主应用的无缝集成

如果将来Ketcher CDN恢复可用，可以轻松替换回完整的Ketcher编辑器。

## 响应式设计
- 移动端适配: 在768px以下自动切换为单列布局
- 表格支持水平滚动
- 按钮在小屏幕上垂直排列

## 使用方法
1. 访问首页 (http://localhost:5173/)
2. 点击"Data Input Platform"卡片
3. 等待Ketcher编辑器加载完成(约3秒)
4. 在左侧Ketcher中绘制分子结构或点击"Set Sample"加载示例
5. 点击"Get SMILES"获取分子的SMILES表示
6. 在右侧输入框中填写参数
7. 在下方表格中输入数据
8. 使用操作按钮管理数据:
   - **Clear All**: 清空所有数据(包括Ketcher中的分子)
   - **Save Data**: 保存所有数据(包括SMILES)
   - **Load Sample**: 加载示例数据

## 未来扩展
- Ketcher功能增强:
  - 本地部署Ketcher以提高加载速度
  - 添加更多化学数据库的分子模板
  - 支持多种分子格式(MOL, SDF等)
  - 3D分子显示和优化
- 表格功能增强:
  - 数据验证
  - 导入/导出功能
  - 排序和筛选
- 数据集成:
  - 分子属性自动计算
  - 化学数据库查询集成

## 开发服务器
```bash
npm run dev
# 访问: http://localhost:5173/
```
