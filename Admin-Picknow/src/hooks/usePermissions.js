import { PERMISSIONS, ACTIONS } from '../constants/permissions';

const usePermissions = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const hasPermission = (module, action) => {
    if (!currentUser) return false;
    
    // Super admin has all permissions
    if (currentUser.role === 'super_admin') return true;
    
    // Check if user has specific permission
    return Array.isArray(currentUser.permissions?.[module]) && 
           currentUser.permissions[module].includes(action);
  };

  const canRead = (module) => hasPermission(module, ACTIONS.READ);
  const canWrite = (module) => hasPermission(module, ACTIONS.WRITE);
  const canDelete = (module) => hasPermission(module, ACTIONS.DELETE);

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    isSuperAdmin: currentUser?.role === 'super_admin',
    currentUser
  };
};

export default usePermissions; 