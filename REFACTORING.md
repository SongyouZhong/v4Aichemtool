# 数据分离重构说明

## 概述

本次重构将DataInputPage中的模拟数据和业务逻辑进行了分离，采用了更好的架构模式，提高了代码的可维护性和可测试性。

## 新的项目结构

### 1. 数据层 (`src/data/`)
- `mockData.ts` - 所有模拟数据的定义，包括：
  - 主参数下拉框选项
  - 项目表格数据
  - 化合物表格示例数据
  - 默认表单数据

### 2. 服务层 (`src/services/`)
- `dataService.ts` - 数据操作服务，包含：
  - `TableDataService` - 表格数据的CRUD操作
  - `ProjectService` - 项目配置相关操作
  - `FormDataService` - 表单数据验证和保存
  
- `ketcherService.ts` - Ketcher化学编辑器服务：
  - 封装与Ketcher的交互逻辑
  - 提供统一的SMILES操作接口
  - 处理PostMessage通信和直接API调用

### 3. 组合式函数 (`src/composables/`)
- `useTableData.ts` - 表格数据相关的状态和方法
- `useProjectManagement.ts` - 项目管理和表单数据的状态和方法
- `useKetcher.ts` - Ketcher编辑器相关的状态和方法

### 4. 类型定义 (`src/types/`)
- `data.ts` - 新增的数据相关类型定义

## 主要改进

### 1. 关注点分离
- **数据层**：仅负责数据定义
- **服务层**：负责数据操作和业务逻辑
- **组合层**：负责状态管理和UI逻辑
- **组件层**：仅负责UI渲染和用户交互

### 2. 可维护性提升
- 模拟数据集中管理，易于修改和扩展
- 服务层提供统一接口，便于后续切换到真实API
- 组合式函数提高代码复用性
- 类型安全保证代码质量

### 3. 可测试性提升
- 每个层都可以独立测试
- 服务层可以轻松模拟
- 组合式函数可以单独测试

### 4. 扩展性提升
- 新增数据类型只需在对应层添加
- 服务层易于扩展新功能
- 组合式函数可以跨组件复用

## 使用方式

### 在组件中使用
```vue
<script setup lang="ts">
import { useTableData } from '@/composables/useTableData'
import { useProjectManagement } from '@/composables/useProjectManagement'
import { useKetcher } from '@/composables/useKetcher'

// 使用组合式函数
const { tableData, addNewRow, deleteRow } = useTableData()
const { inputs, saveFormData } = useProjectManagement()
const { getSmiles, setMolecule } = useKetcher()
</script>
```

### 直接使用服务
```typescript
import { TableDataService } from '@/services/dataService'
import { ketcherService } from '@/services/ketcherService'

// 获取表格数据
const data = await TableDataService.getTableData()

// 获取SMILES
const smiles = await ketcherService.getSmiles()
```

## 迁移到真实API

当需要切换到真实API时，只需要：

1. 修改服务层的实现，将模拟数据替换为API调用
2. 组合式函数和组件层无需修改
3. 类型定义根据API响应调整

例如：
```typescript
// dataService.ts
export class TableDataService {
  static async getTableData(): Promise<TableRow[]> {
    // 从模拟数据切换到API调用
    const response = await fetch('/api/table-data')
    return response.json()
  }
}
```

## 最佳实践

1. **数据定义**：新增模拟数据时，请在 `mockData.ts` 中添加
2. **业务逻辑**：复杂的业务逻辑应放在服务层
3. **状态管理**：UI相关的状态管理使用组合式函数
4. **类型安全**：所有数据结构都应有对应的TypeScript类型定义
5. **错误处理**：服务层应该有完善的错误处理机制

## 注意事项

- 模拟数据仅用于开发和测试，生产环境应使用真实API
- 服务层的异步操作都包含了模拟延迟，以便测试加载状态
- Ketcher服务使用单例模式，确保全局只有一个实例

## 故障排除

### Ketcher 集成问题

如果遇到 "Ketcher frame not available" 错误，请检查：

1. **iframe 加载状态**：
   - 检查浏览器控制台是否有 "Ketcher iframe loaded" 日志
   - 确认 Ketcher iframe 的 src 路径是否正确：`/standalone/index.html`

2. **引用设置**：
   - 检查是否有 "Ketcher frame reference set" 日志
   - 验证 `ketcherFrame.value` 不为 null

3. **时序问题**：
   - Ketcher 需要约 3 秒时间完全初始化
   - 等待状态指示器显示 "✅ Ketcher is ready" 后再操作

4. **调试步骤**：
   ```javascript
   // 在浏览器控制台中检查 Ketcher 状态
   console.log('Ketcher frame:', document.getElementById('idKetcher'))
   console.log('Ketcher instance:', window.frames['idKetcher']?.ketcher)
   ```

### 常见解决方案

1. **刷新页面**：重新加载页面以重新初始化 Ketcher
2. **检查网络**：确保 Ketcher 静态文件加载正常
3. **清除缓存**：清除浏览器缓存后重试
4. **检查控制台**：查看详细的错误信息和调试日志
