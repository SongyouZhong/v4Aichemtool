export interface PlatformCard {
  title: string;
  description: string;
  category: string;
  buttonText?: string;
  onClick?: () => void;
}

export interface SmallMoleculeTool extends PlatformCard {
  type: 'database' | 'ligand-generation' | 'pocket-generation' | 'interactive-design';
}

export interface ProteinTool extends PlatformCard {
  type: 'protac' | 'structure-prediction';
}
