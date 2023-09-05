export const modes = [
  'manage',
  'audit',
  'reference',
  'integration',
  'external',
] as const;

export type UIMode = typeof modes[number];

export interface UIModeInfo {
  mode: UIMode;
  label: string;
  description: string;
  enabled?: boolean;
}

export function modeToMeta(mode: UIMode): UIModeInfo {
  switch (mode) {
    case 'manage':
      return {
        mode,
        label       : 'Manage',
        description : "Manage and build out organization's process models",
        enabled     : true,
      };
    case 'audit':
      return {
        mode,
        label       : 'Audit',
        description : 'Plan and execute audits, manage NC, CAPA, etc.',
        enabled     : true,
      };
    case 'reference':
      return {
        mode,
        label       : 'Reference Authoring',
        description : 'Author standard reference models, convert from existing standards, etc.',
        enabled     : true,
      };
    case 'integration':
      return {
        mode,
        label       : 'Integration',
        description : "Start background services for integration with organization's systems",
        enabled     : false,
      };
    case 'external':
      return {
        mode,
        label       : 'External Auditor',
        description : 'Execute external audits as an external auditor, manage NC, CAPA, audit reports.',
        enabled     : false,
      };
  }
}
