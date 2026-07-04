// security/getUserRoutes.js
import groups from '../pages/RouteSetup/routeGroups';

export const getAllowedRoutesForUser = (user) => {

  const userRole = user?.role;
  const allowedRoutes = [];

  groups.forEach(group => {
    group.items.forEach(item => {
      
      if (!item.roles || item.roles.includes(userRole)) {
        allowedRoutes.push(item.path);
      }
    });
  });
  return allowedRoutes;
};