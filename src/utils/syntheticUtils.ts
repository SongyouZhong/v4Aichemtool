/**
 * 合成记录相关的工具函数
 */

/**
 * 生成合成名称
 * @param compoundName 化合物名称
 * @param batch 批次号
 * @returns 生成的合成名称 (格式: 化合物名称-批次号)
 */
export function generateSyntheticName(compoundName: string, batch: number): string {
  if (!compoundName || batch === null || batch === undefined) {
    return '';
  }
  
  // 清理化合物名称，去除前后空格
  const cleanCompoundName = compoundName.trim();
  
  if (!cleanCompoundName) {
    return '';
  }
  
  return `${cleanCompoundName}-${batch}`;
}

/**
 * 验证合成名称格式
 * @param syntheticName 合成名称
 * @returns 是否为有效格式
 */
export function isValidSyntheticName(syntheticName: string): boolean {
  if (!syntheticName) return false;
  
  // 基本格式验证：包含"-"字符串且后面跟数字
  return /^.+-\d+$/.test(syntheticName);
}

/**
 * 从合成名称中提取批次号
 * @param syntheticName 合成名称
 * @returns 批次号，如果提取失败返回null
 */
export function extractBatchFromSyntheticName(syntheticName: string): number | null {
  if (!syntheticName) return null;
  
  const match = syntheticName.match(/-(\d+)$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * 从合成名称中提取化合物名称
 * @param syntheticName 合成名称
 * @returns 化合物名称，如果提取失败返回空字符串
 */
export function extractCompoundNameFromSyntheticName(syntheticName: string): string {
  if (!syntheticName) return '';
  
  const index = syntheticName.lastIndexOf('-');
  if (index > 0) {
    return syntheticName.substring(0, index);
  }
  
  return syntheticName;
}
