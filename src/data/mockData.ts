// 模拟数据文件
// 用于开发和测试阶段，生产环境应该从API获取数据

import type { TableRow, ProjectData, MainParameterOption } from '@/types'

// 主参数下拉框选项
export const mainParameterOptions: MainParameterOption[] = [
  { label: 'Project Alpha', value: 'project_alpha' },
  { label: 'Project Beta', value: 'project_beta' },
  { label: 'Project Gamma', value: 'project_gamma' },
  { label: 'Project Delta', value: 'project_delta' }
]

// 项目管理数据
export const projectTableData: ProjectData[][] = [
  [
    { label: 'Project Name', value: 'Chemical Analysis Platform' },
    { label: 'Status', value: 'Active' }
  ],
  [
    { label: 'Start Date', value: '2024-01-15' },
    { label: 'End Date', value: '2024-12-31' }
  ]
]

// 化合物表格数据
export const sampleTableData: TableRow[] = [
  {
    id: 1,
    name: 'Caffeine',
    batch: 'CHM-2024-001',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CN1C%3DNC2%3DC1C(%3DO)N(C(%3DO)N2C)C/PNG',
    description: 'Central nervous system stimulant, commonly found in coffee and tea',
    attachments: ['caffeine_analysis.pdf', 'nmr_data.xlsx', 'purity_report.doc']
  },
  {
    id: 2,
    name: 'Aspirin',
    batch: 'PHM-2024-002',
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)OC1%3DCC%3DCC%3DC1C(%3DO)O/PNG',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief',
    attachments: ['aspirin_synthesis.pdf', 'quality_control.xlsx']
  },
  {
    id: 3,
    name: 'Glucose',
    batch: 'BIO-2024-003',
    smiles: 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C(%5BC%40%40H%5D1%5BC%40H%5D(%5BC%40%40H%5D(%5BC%40H%5D(%5BC%40H%5D(O1)O)O)O)O)O/PNG',
    description: 'Simple sugar and primary energy source for cellular metabolism',
    attachments: ['glucose_purity.pdf']
  },
  {
    id: 4,
    name: 'Ibuprofen',
    batch: 'PHM-2024-004',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(C)CC1%3DCC%3DC(C%3DC1)C(C)C(%3DO)O/PNG',
    description: 'Nonsteroidal anti-inflammatory drug for pain and fever reduction',
    attachments: ['ibuprofen_specs.pdf', 'dissolution_test.xlsx', 'stability_study.doc']
  },
  {
    id: 5,
    name: 'Benzene',
    batch: 'ORG-2024-005',
    smiles: 'C1=CC=CC=C1',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C1%3DCC%3DCC%3DC1/PNG',
    description: 'Aromatic hydrocarbon, important industrial solvent and precursor',
    attachments: ['benzene_safety.pdf', 'gc_ms_analysis.xlsx']
  },
  {
    id: 6,
    name: 'Ethanol',
    batch: 'SOL-2024-006',
    smiles: 'CCO',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCO/PNG',
    description: 'Common alcohol used as solvent and in pharmaceutical preparations',
    attachments: ['ethanol_purity.pdf']
  },
  {
    id: 7,
    name: 'Morphine',
    batch: 'NAR-2024-007',
    smiles: 'CN1CC[C@]23C4=C5C=CC(=O)C=C5CC[C@H]2[C@H]1CC6=C3C(=C(C=C6)O)O4',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CN1CC%5BC%40%5D23C4%3DC5C%3DCC(%3DO)C%3DC5CC%5BC%40H%5D2%5BC%40H%5D1CC6%3DC3C(%3DC(C%3DC6)O)O4/PNG',
    description: 'Opioid analgesic used for severe pain management',
    attachments: ['morphine_analysis.pdf', 'controlled_substance_log.xlsx', 'batch_record.doc']
  },
  {
    id: 8,
    name: 'Paracetamol',
    batch: 'PHM-2024-008',
    smiles: 'CC(=O)NC1=CC=C(C=C1)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)NC1%3DCC%3DC(C%3DC1)O/PNG',
    description: 'Acetaminophen, widely used analgesic and antipyretic medication',
    attachments: ['paracetamol_testing.pdf', 'dissolution_profile.xlsx']
  },
  {
    id: 9,
    name: 'Vitamin C',
    batch: 'VIT-2024-009',
    smiles: 'C([C@@H]([C@@H]([C@H](C(=O)C(=O)O)O)O)O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C(%5BC%40%40H%5D(%5BC%40%40H%5D(%5BC%40H%5D(C(%3DO)C(%3DO)O)O)O)O)O/PNG',
    description: 'Essential vitamin, ascorbic acid, important antioxidant',
    attachments: ['vitamin_c_assay.pdf', 'stability_data.xlsx', 'antioxidant_test.doc']
  },
  {
    id: 10,
    name: 'Dopamine',
    batch: 'NEU-2024-010',
    smiles: 'C1=CC(=C(C=C1CCN)O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C1%3DCC(%3DC(C%3DC1CCN)O)O/PNG',
    description: 'Neurotransmitter involved in reward and motivation pathways',
    attachments: ['dopamine_synthesis.pdf', 'hplc_method.xlsx']
  },
  {
    id: 11,
    name: 'Penicillin G',
    batch: 'ANT-2024-011',
    smiles: 'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC1(%5BC%40%40H%5D(N2%5BC%40H%5D(S1)%5BC%40%40H%5D(C2%3DO)NC(%3DO)CC3%3DCC%3DCC%3DC3)C(%3DO)O)C/PNG',
    description: 'Beta-lactam antibiotic used to treat bacterial infections',
    attachments: ['penicillin_potency.pdf', 'microbiological_assay.xlsx', 'impurity_profile.doc']
  },
  {
    id: 12,
    name: 'Cholesterol',
    batch: 'STE-2024-012',
    smiles: 'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C%5BC%40H%5D(CCCC(C)C)%5BC%40H%5D1CC%5BC%40%40H%5D2%5BC%40%40%5D1(CC%5BC%40H%5D3%5BC%40H%5D2CC%3DC4%5BC%40%40%5D3(CC%5BC%40%40H%5D(C4)O)C)C/PNG',
    description: 'Sterol molecule essential for cell membrane structure and function',
    attachments: ['cholesterol_analysis.pdf', 'lipid_profile.xlsx']
  },
  {
    id: 13,
    name: 'Codeine',
    batch: 'NAR-2024-013',
    smiles: 'COC1=C2C3=C(C[C@@H]4N(CC[C@@]35C2=C(C=C1)OC6=C5C(=CC=C6)O4)C)C=C3',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/COC1%3DC2C3%3DC(C%5BC%40%40H%5D4N(CC%5BC%40%40%5D35C2%3DC(C%3DC1)OC6%3DC5C(%3DCC%3DC6)O4)C)C%3DC3/PNG',
    description: 'Opioid analgesic used for mild to moderate pain relief',
    attachments: ['codeine_purity.pdf', 'opioid_screening.xlsx', 'batch_documentation.doc']
  },
  {
    id: 14,
    name: 'Warfarin',
    batch: 'ANT-2024-014',
    smiles: 'CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O',
    smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)CC(C1%3DCC%3DCC%3DC1)C2%3DC(C3%3DCC%3DCC%3DC3OC2%3DO)O/PNG',
    description: 'Anticoagulant medication used to prevent blood clots',
    attachments: ['warfarin_stability.pdf', 'coagulation_test.xlsx']
  },
  {
    id: 15,
    name: 'Insulin',
    batch: 'PEP-2024-015',
    smiles: 'CCC(C)C[C@@H](C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CC1=CC=CC=C1)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CC2=CC=C(C=C2)O)C(=O)N[C@@H]([C@@H](C)O)C(=O)N[C@@H](CCCCN)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](C(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](C)C(=O)N[C@@H](CC3=CC=CC=C3)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](C)C(=O)N[C@@H](CC4=CC=C(C=C4)O)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](C(C)C)C(=O)O)NC(=O)[C@H](CC5=CNC6=CC=CC=C65)NC(=O)[C@H](CO)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CO)NC(=O)[C@H](CC7=CC=C(C=C7)O)NC(=O)[C@H](CCCCN)NC(=O)[C@H](CC8=CC=CC=C8)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC9=CNC1=CC=CC=C91)N',
    smilesImage: '',
    description: 'Protein hormone essential for glucose metabolism regulation',
    attachments: ['insulin_bioactivity.pdf', 'protein_analysis.xlsx', 'stability_chamber.doc', 'endotoxin_test.pdf']
  }
]

// 默认输入表单数据
export const defaultInputData = {
  mainParameter: null as string | null,
  compoundName: '',
  compoundBatch: '',
  compoundSmiles: '',
  compoundNote: ''
}

// 示例输入数据
export const sampleInputData = {
  mainParameter: 'project_alpha',
  compoundName: 'Sample Compound A',
  compoundBatch: 'BATCH-2024-001',
  compoundSmiles: 'CCO',
  compoundNote: 'Test compound for demonstration'
}
