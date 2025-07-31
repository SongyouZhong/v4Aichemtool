# 项目结构总览

## 重构后的项目结构

```
src/
├── components/           # 可复用组件
│   ├── Topbar.vue
│   ├── layout/
│   └── platform/
├── composables/          # 组合式函数 (新增)
│   ├── useAuth.ts
│   ├── useTableData.ts        # 表格数据管理
│   ├── useProjectManagement.ts # 项目管理和表单
│   └── useKetcher.ts          # Ketcher编辑器
├── data/                 # 数据层 (新增)
│   └── mockData.ts            # 模拟数据定义
├── router/               # 路由配置
│   └── index.ts
├── services/             # 服务层 (新增)
│   ├── dataService.ts         # 数据操作服务
│   └── ketcherService.ts      # Ketcher服务
├── stores/               # 状态管理
│   ├── auth.ts
│   └── index.ts
├── types/                # 类型定义
│   ├── auth.ts
│   ├── platform.ts
│   ├── data.ts               # 数据相关类型 (新增)
│   └── index.ts
├── views/                # 页面组件
│   ├── HomePage.vue
│   ├── LoginPage.vue
│   └── platforms/
│       ├── ProteinPage.vue
│       ├── SmallMoleculePage.vue
│       └── DataInputPage.vue  # 重构后的页面
├── assets/               # 静态资源
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 架构分层

### 1. 数据层 (Data Layer)
- **位置**: `src/data/`
- **职责**: 定义模拟数据和静态配置
- **特点**: 无业务逻辑，纯数据定义

### 2. 服务层 (Service Layer)
- **位置**: `src/services/`
- **职责**: 数据操作、API调用、业务逻辑
- **特点**: 可复用、可测试、与UI解耦

### 3. 组合层 (Composition Layer)
- **位置**: `src/composables/`
- **职责**: 状态管理、逻辑复用、响应式数据
- **特点**: Vue 3 Composition API、跨组件复用

### 4. 展示层 (Presentation Layer)
- **位置**: `src/views/`, `src/components/`
- **职责**: UI渲染、用户交互、事件处理
- **特点**: 关注UI逻辑，依赖组合层

## 数据流向

```
用户交互 → 展示层 → 组合层 → 服务层 → 数据层
                ↓
            响应式更新 ← 状态变化 ← 数据处理 ← 数据获取
```

## 重构优势

### 1. 可维护性
- 代码职责清晰，易于定位和修改
- 模块化设计，降低耦合度

### 2. 可测试性
- 每层都可独立测试
- 依赖注入便于Mock

### 3. 可扩展性
- 新功能易于添加
- 现有功能易于修改

### 4. 可复用性
- 组合式函数可跨组件使用
- 服务层可在多个场景使用

## 开发指南

### 添加新功能
1. 在 `types/` 中定义数据类型
2. 在 `data/` 中添加模拟数据（如需要）
3. 在 `services/` 中实现业务逻辑
4. 在 `composables/` 中封装状态管理
5. 在组件中使用组合式函数

### 切换到真实API
1. 修改 `services/` 中的实现
2. 其他层无需修改

### 添加新的模拟数据
1. 在 `data/mockData.ts` 中添加
2. 在 `types/data.ts` 中定义类型
3. 在对应服务中使用
