export interface Activity {
  id?: string;
  compound_id: string;
  project_id: string;
  synthetic_id?: string;
  assay_id: string;
  activity_type: 'Ki' | 'IC50' | 'EC50';
  activity_relation: '>' | '<' | '=';
  activity_unit: string;
  activity_value: number;
  batch?: string;
  ref_activity_id?: string;
  note?: string;
}

export interface ActivityCreate extends Omit<Activity, 'id'> {}

export interface ActivityUpdate extends Partial<Omit<Activity, 'id'>> {}

export interface Assay {
  id: string;
  name: string;
  description?: string;
  note?: string;
}

export interface AssayCreate extends Omit<Assay, 'id'> {}

export interface Compound {
  id: string;
  name?: string;
  smiles?: string;
  project_id: string;
  batch?: number;
}

export interface Synthetic {
  id: string;
  compound_id: string;
  batch?: number;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}
