import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const adminStatement = {
  ...defaultStatements,
} as const;

export const adminAcInstance = createAccessControl(adminStatement);

export const superuserRole = adminAcInstance.newRole({
  ...adminAc.statements,
  user: [...adminAc.statements.user, "impersonate-admins"],
});

export const adminRole = adminAcInstance.newRole({
  user: [],
  session: [],
});

export const landlordRole = adminAcInstance.newRole({
  user: [],
  session: [],
});

export const tenantRole = adminAcInstance.newRole({
  user: [],
  session: [],
});

export const caretakerRole = adminAcInstance.newRole({
  user: [],
  session: [],
});

export const adminRoles = {
  superuser: superuserRole,
  admin: adminRole,
  landlord: landlordRole,
  tenant: tenantRole,
  caretaker: caretakerRole,
};
