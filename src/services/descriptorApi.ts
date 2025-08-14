import { apiClient } from './apiClient';

// 分子描述符相关类型定义
export interface StructuralDescriptors {
  smiles: string;
  maximum_graph_length: number;
  number_of_rings: number;
  number_of_aromatic_rings: number;
  number_of_aliphatic_rings: number;
  number_atoms_in_largest_ring: number;
}

export interface LipinskiDescriptors {
  smiles: string;
  hba_lipinski: number;
  hbd_lipinski: number;
  mol_weight: number;
  lipinski_violations: number;
  lipinski_compliant: boolean;
}

export interface FlexibilityPolarityDescriptors {
  smiles: string;
  number_of_rotatable_bonds: number;
  slog_p: number;
  tpsa: number;
}

export interface StereochemistryDescriptors {
  smiles: string;
  number_of_stereo_centers: number;
}

export interface DruglikenessDescriptors {
  smiles: string;
  sa: number;
  qed: number;
}

export interface AllDescriptors {
  smiles: string;
  // 分子结构描述符
  maximum_graph_length: number;
  number_of_rings: number;
  number_of_aromatic_rings: number;
  number_of_aliphatic_rings: number;
  number_atoms_in_largest_ring: number;
  // Lipinski规则相关描述符
  hba_lipinski: number;
  hbd_lipinski: number;
  mol_weight: number;
  lipinski_violations: number;
  lipinski_compliant: boolean;
  // 分子柔性和极性描述符
  number_of_rotatable_bonds: number;
  slog_p: number;
  tpsa: number;
  // 立体化学描述符
  number_of_stereo_centers: number;
  // 药物性质评价描述符
  sa: number;
  qed: number;
}

export class DescriptorApiService {
  private static baseUrl = '/descriptors';

  /**
   * 获取分子结构描述符
   */
  static async getStructuralDescriptors(smiles: string): Promise<StructuralDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/structural`, {
      params: { smiles }
    });
    return response.data as StructuralDescriptors;
  }

  /**
   * 获取Lipinski规则相关描述符
   */
  static async getLipinskiDescriptors(smiles: string): Promise<LipinskiDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/lipinski`, {
      params: { smiles }
    });
    return response.data as LipinskiDescriptors;
  }

  /**
   * 获取分子柔性和极性描述符
   */
  static async getFlexibilityPolarityDescriptors(smiles: string): Promise<FlexibilityPolarityDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/flexibility-polarity`, {
      params: { smiles }
    });
    return response.data as FlexibilityPolarityDescriptors;
  }

  /**
   * 获取立体化学描述符
   */
  static async getStereochemistryDescriptors(smiles: string): Promise<StereochemistryDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/stereochemistry`, {
      params: { smiles }
    });
    return response.data as StereochemistryDescriptors;
  }

  /**
   * 获取药物性质评价描述符
   */
  static async getDruglikenessDescriptors(smiles: string): Promise<DruglikenessDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/druglikeness`, {
      params: { smiles }
    });
    return response.data as DruglikenessDescriptors;
  }

  /**
   * 获取所有描述符
   */
  static async getAllDescriptors(smiles: string): Promise<AllDescriptors> {
    const response = await apiClient.get(`${this.baseUrl}/all`, {
      params: { smiles }
    });
    return response.data as AllDescriptors;
  }

  /**
   * 批量获取描述符
   */
  static async getBatchDescriptors(smilesList: string[]): Promise<AllDescriptors[]> {
    const response = await apiClient.post(`${this.baseUrl}/batch`, smilesList);
    return response.data as AllDescriptors[];
  }
}
