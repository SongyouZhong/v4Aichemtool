// 化合物数据聚合的组合式函数
// 负责聚合合成信息和活性信息

import { ref } from 'vue'
import { SyntheticApiService } from '@/services/syntheticApi'
import { activityApi } from '@/services/activityApi'
import { PAGINATION_CONFIG } from '@/services/apiConfig'
import type { Compound } from '@/types/data'

export interface SynthesisInfo {
  quantity_summary: string
  synthesis_count: number
}

export interface ActivityInfo {
  has_activity: boolean
  activity_summary: string
  activity_count: number
}

export interface AggregatedCompound extends Compound {
  quantity_summary: string
  synthesis_count: number
  has_activity: boolean
  activity_summary: string
  activity_count: number
}

export function useCompoundAggregation() {
  const loading = ref(false)

  /**
   * 计算单个化合物的合成信息
   */
  const calculateSynthesisInfo = async (compoundId: string): Promise<SynthesisInfo> => {
    try {
      const response = await SyntheticApiService.getSyntheticsByCompound(compoundId, 1, 1000) // 获取所有记录
      const synthetics = response.items || []

      const synthesis_count = synthetics.length

      // 计算数量汇总
      const unitTotals: Record<string, number> = {}
      
      for (const synthetic of synthetics) {
        if (synthetic.mass && synthetic.unit) {
          if (!unitTotals[synthetic.unit]) {
            unitTotals[synthetic.unit] = 0
          }
          unitTotals[synthetic.unit] += synthetic.mass
        }
      }

      // 格式化数量显示
      const quantityParts: string[] = []
      for (const [unit, total] of Object.entries(unitTotals)) {
        quantityParts.push(`${total}${unit}`)
      }

      const quantity_summary = quantityParts.length > 0 ? quantityParts.join('+') : '-'

      return {
        quantity_summary,
        synthesis_count
      }
    } catch (error) {
      console.error(`Error calculating synthesis info for compound ${compoundId}:`, error)
      return {
        quantity_summary: '-',
        synthesis_count: 0
      }
    }
  }

  /**
   * 计算单个化合物的活性信息
   */
  const calculateActivityInfo = async (compoundId: string): Promise<ActivityInfo> => {
    try {
      const response = await activityApi.getByCompound(compoundId, { page: 1, size: PAGINATION_CONFIG.MAX_SIZE }) // 获取所有记录
      const activities = response.items || []

      const has_activity = activities.length > 0
      const activity_count = activities.length

      // 计算活性汇总
      let activity_summary = '-'
      
      if (activities.length > 0) {
        const activityTypes: Record<string, string[]> = {}

        for (const activity of activities) {
          if (activity.activity_type && activity.activity_value !== null && activity.activity_value !== undefined) {
            // 构建活性值显示文本
            const relation = activity.activity_relation || ''
            const value = activity.activity_value
            const unit = activity.activity_unit || ''
            const activityType = activity.activity_type

            // 格式化数值显示
            let valueStr: string
            if (value === Math.floor(value)) {
              valueStr = `${Math.floor(value)}`
            } else {
              valueStr = `${value.toFixed(2)}`.replace(/\.?0+$/, '')
            }

            const activityText = `${relation}${valueStr}${unit}`

            if (!activityTypes[activityType]) {
              activityTypes[activityType] = []
            }
            activityTypes[activityType].push(activityText)
          }
        }

        // 构建汇总显示，每个活性类型分行
        const typeSummaries: string[] = []
        for (const [activityType, values] of Object.entries(activityTypes)) {
          if (values.length === 1) {
            typeSummaries.push(`${activityType}: ${values[0]}`)
          } else {
            const displayValues = values.slice(0, 2)
            const moreIndicator = values.length > 2 ? '...' : ''
            typeSummaries.push(`${activityType}: ${displayValues.join(', ')}${moreIndicator}`)
          }
        }

        activity_summary = typeSummaries.length > 0 ? typeSummaries.join('\n') : '-'
      }

      return {
        has_activity,
        activity_summary,
        activity_count
      }
    } catch (error) {
      console.error(`Error calculating activity info for compound ${compoundId}:`, error)
      return {
        has_activity: false,
        activity_summary: '-',
        activity_count: 0
      }
    }
  }

  /**
   * 为化合物列表聚合合成和活性信息
   */
  const aggregateCompoundsInfo = async (compounds: Compound[]): Promise<AggregatedCompound[]> => {
    if (!compounds || compounds.length === 0) {
      return []
    }

    loading.value = true

    try {
      // 并行获取所有化合物的合成和活性信息
      const aggregationPromises = compounds.map(async (compound) => {
        const [synthesisInfo, activityInfo] = await Promise.all([
          calculateSynthesisInfo(compound.id),
          calculateActivityInfo(compound.id)
        ])

        return {
          ...compound,
          ...synthesisInfo,
          ...activityInfo
        } as AggregatedCompound
      })

      const aggregatedCompounds = await Promise.all(aggregationPromises)
      return aggregatedCompounds
    } catch (error) {
      console.error('Error aggregating compounds info:', error)
      // 返回基础化合物信息，不包含聚合数据
      return compounds.map(compound => ({
        ...compound,
        quantity_summary: '-',
        synthesis_count: 0,
        has_activity: false,
        activity_summary: '-',
        activity_count: 0
      })) as AggregatedCompound[]
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量获取化合物ID对应的合成信息（优化版本）
   */
  const batchCalculateSynthesisInfo = async (compoundIds: string[]): Promise<Record<string, SynthesisInfo>> => {
    const result: Record<string, SynthesisInfo> = {}
    
    // 这里可以优化为批量查询，如果后端支持的话
    // 目前使用并行请求
    const promises = compoundIds.map(async (compoundId) => {
      const info = await calculateSynthesisInfo(compoundId)
      result[compoundId] = info
    })

    await Promise.all(promises)
    return result
  }

  /**
   * 批量获取化合物ID对应的活性信息（优化版本）
   */
  const batchCalculateActivityInfo = async (compoundIds: string[]): Promise<Record<string, ActivityInfo>> => {
    const result: Record<string, ActivityInfo> = {}
    
    // 这里可以优化为批量查询，如果后端支持的话
    // 目前使用并行请求
    const promises = compoundIds.map(async (compoundId) => {
      const info = await calculateActivityInfo(compoundId)
      result[compoundId] = info
    })

    await Promise.all(promises)
    return result
  }

  return {
    loading,
    calculateSynthesisInfo,
    calculateActivityInfo,
    aggregateCompoundsInfo,
    batchCalculateSynthesisInfo,
    batchCalculateActivityInfo
  }
}
