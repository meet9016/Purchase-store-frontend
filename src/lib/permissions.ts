import { RolePermission, User } from './storeData';

export type FeatureName =
  | 'Leads'
  | 'User'
  | 'Department Management'
  | 'Lead Statuses'
  | 'Lead Sources'
  | 'Category'
  | 'Product'
  | 'Stock'
  | 'City Master'
  | 'Reports'
  | 'Purchase Requests'
  | 'Purchase Orders'
  | 'Goods Receipt (GRN)'
  | 'Store Outward'
  | 'Vendor Invoices'
  | 'Payment Requests'
  | 'Payment Entries';

export type CapabilityType = 'viewGlobal' | 'viewOwn' | 'create' | 'update' | 'delete';

/**
 * Checks whether the current user's role has permission for a specific feature capability.
 * Admin always has full bypass permission.
 */
export function hasPermission(
  rolePermissions: RolePermission[],
  currentUser: User | null,
  feature: FeatureName,
  capability: CapabilityType = 'create'
): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'Admin') return true;

  const rolePerm = rolePermissions.find(rp => rp.role.toLowerCase() === currentUser.role.toLowerCase());
  if (!rolePerm || !rolePerm.permissions) return false;

  const featPerm = rolePerm.permissions[feature];
  if (!featPerm) return false;

  return !!featPerm[capability];
}

/**
 * Returns the view scope ('global', 'own', or 'none') for a feature.
 * Admin is always 'global'.
 */
export function getViewScope(
  rolePermissions: RolePermission[],
  currentUser: User | null,
  feature: FeatureName
): 'global' | 'own' | 'none' {
  if (!currentUser) return 'none';
  if (currentUser.role === 'Admin') return 'global';

  const rolePerm = rolePermissions.find(rp => rp.role.toLowerCase() === currentUser.role.toLowerCase());
  if (!rolePerm || !rolePerm.permissions) return 'none';

  const featPerm = rolePerm.permissions[feature];
  if (!featPerm) return 'none';

  if (featPerm.viewGlobal) return 'global';
  if (featPerm.viewOwn) return 'own';
  return 'none';
}

/**
 * Checks if a user has any view permission (Global or Own) for a feature.
 */
export function canViewFeature(
  rolePermissions: RolePermission[],
  currentUser: User | null,
  feature: FeatureName
): boolean {
  return getViewScope(rolePermissions, currentUser, feature) !== 'none';
}
