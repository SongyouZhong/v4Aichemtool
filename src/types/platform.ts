export interface PlatformCard {
  title: string;
  description: string;
  category: string;
  buttonText?: string;
  onClick?: () => void;
  permission?: string; // 访问权限代码
}

export interface SmallMoleculeTool extends PlatformCard {
  type: 'database' | 'ligand-generation' | 'pocket-generation' | 'interactive-design' | 'data-input' | 'synthetic-input' | 'user-management' | 'activity-input' | 'assay-management';
}

export interface ProteinTool extends PlatformCard {
  type: 'protac' | 'structure-prediction';
}
