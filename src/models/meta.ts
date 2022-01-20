/**
 * Codes in this folder are initial codes for the extension.
 * I (Wai Kit) am not sure what the effect is.
 * Ignored so far.
 */

export interface GlossaryRegisterMeta {
  name: string;
  description: string;
}
export const REGISTER_META_FILENAME = 'register.yaml';

export interface GlossaryBranding {
  name: string;
  symbol?: string; // file path relative to repository
}
export const BRANDING_FILENAME = 'branding.yaml';

export type GlossaryRegisterRoles = {
  [username: string]: { isManager?: true };
};
export const ROLES_FILENAME = 'roles.yaml';
