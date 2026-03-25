export type ModuleKey =
  | 'dashboard'
  | 'finance'
  | 'campaigns'
  | 'events'
  | 'donations'
  | 'volunteers'
  | 'gamification'
  | 'certificates'
  | 'members'
  | 'reports'
  | 'organization'
  | 'portal'
  | 'publicPortal'
  | 'campaignInterests'

export type ModuleAccess = {
  module: ModuleKey
  canRead: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}

export type PermissionAction = 'read' | 'create' | 'update' | 'delete'

export function hasModuleAccess(
  modules: ModuleAccess[] | undefined,
  module: ModuleKey,
  action: PermissionAction = 'read',
) {
  const entry = modules?.find((m) => m.module === module)
  if (!entry) return false
  switch (action) {
    case 'create':
      return entry.canCreate === true
    case 'update':
      return entry.canUpdate === true
    case 'delete':
      return entry.canDelete === true
    default:
      return entry.canRead !== false
  }
}
