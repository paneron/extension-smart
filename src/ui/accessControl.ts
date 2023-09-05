import { modes } from '@/ui/modes';
import type { UIMode } from '@/ui/modes';

export const generalUserRoles = [
  'tester',
  'organizationOwner',
  'organizationAdmin',
  'externalAuditor',
  'internalAuditor',
  'internalAuditee',
  'guest',
] as const;
export type GeneralUserRole = typeof generalUserRoles[number];

export const roles = [
  'owner',
  'author',
  'collaborator',
  'guest',
] as const;
export type Role = typeof roles[number];

export const actions = [
  'read',
  'write',
  'delete',
  'show',
  'list',
  'manage',
] as const;
export type Action = typeof actions[number];

export const principals = [
  'mapping',
  'referenceModel',
  'implementationModel',
  'dataRegistry',
  'auditReport',
  'internalAuditReport',
  'externalAuditReport',
  'auditProgramme',
  'externalAuditProgramme',
  'internalAuditProgramme',
  'auditCAPA',
  'internalAuditCAPA',
  'externalAuditCAPA',
  'auditNC',
  'internalAuditNC',
  'externalAuditNC',
  'auditOFI',
  'internalAuditOFI',
  'externalAuditOFI',
] as const;
export type Principal = typeof principals[number];

// TODO: implement logic to get proper role
export function getUserRole(): GeneralUserRole {
  return 'tester';
}

export function getAvailableModesFor(role: GeneralUserRole): UIMode[] {
  switch (role) {
    case 'tester':
      return ['manage', 'audit', 'reference', 'integration', 'external'];
    case 'guest':
      return [];
    case 'internalAuditor':
      return ['audit'];
    case 'internalAuditee':
      return ['audit'];
    case 'externalAuditor':
      return ['external'];
    case 'organizationOwner':
      return ['manage', 'audit', 'reference', 'integration'];
    case 'organizationAdmin':
      return ['manage', 'audit', 'reference', 'integration'];
  }
  return [];
}

export function getAvailableModes(): UIMode[] {
  const role = getUserRole();
  return getAvailableModesFor(role);
}

/**
 * Get list of accessible Principals for a given UI mode.
 * This can determine which mode button to show.
 */
export function modeToPrincipals(mode: UIMode): Principal[] {
  switch (mode) {
    case 'manage':
      return [
        'mapping',
        'implementationModel',
        'dataRegistry',
      ];
    case 'audit':
      return [
        'mapping',
        'implementationModel',
        'dataRegistry',
        'referenceModel',
        'auditReport',
        'internalAuditReport',
        'externalAuditReport',
        'auditProgramme',
        'externalAuditProgramme',
        'internalAuditProgramme',
        'auditCAPA',
        'internalAuditCAPA',
        'externalAuditCAPA',
        'auditNC',
        'internalAuditNC',
        'externalAuditNC',
        'auditOFI',
        'internalAuditOFI',
        'externalAuditOFI',
      ];
    case 'reference':
      return [
        'referenceModel',
      ];
    case 'integration':
      return [
      ];
    case 'external':
      return [
        'mapping',
        'implementationModel',
        'dataRegistry',
        'referenceModel',
        'auditReport',
        'internalAuditReport',
        'externalAuditReport',
        'auditProgramme',
        'externalAuditProgramme',
        'internalAuditProgramme',
        'auditCAPA',
        'internalAuditCAPA',
        'externalAuditCAPA',
        'auditNC',
        'internalAuditNC',
        'externalAuditNC',
        'auditOFI',
        'internalAuditOFI',
        'externalAuditOFI',
      ];
  }
}
