export interface GlossaryRegisterMeta {
  name: string
  description: string
}
export const REGISTER_META_FILENAME = 'register.yaml';


export interface GlossaryBranding {
  name: string
  symbol?: string // file path relative to repository
}
export const BRANDING_FILENAME = 'branding.yaml';


export type GlossaryRegisterRoles = { [username: string]: { isManager?: true } }
export const ROLES_FILENAME = 'roles.yaml';
