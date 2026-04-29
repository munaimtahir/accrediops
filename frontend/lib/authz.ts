import { UserRole, UserSummary } from "@/types";

type RoleAwareUser = Pick<UserSummary, "role"> | null | undefined;

const ADMIN_LEAD_ROLES: UserRole[] = ["ADMIN", "LEAD"];
const ADMIN_ONLY_ROLES: UserRole[] = ["ADMIN"];

function hasAnyRole(user: RoleAwareUser, roles: readonly UserRole[]) {
  return Boolean(user && roles.includes(user.role));
}

export function canAccessAdminArea(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export function canCreateProject(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export function canViewReadiness(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export function canViewExports(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export function canManageClientProfiles(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export function canExecuteOverrides(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_ONLY_ROLES);
}

export function canValidateFrameworkImport(user: RoleAwareUser) {
  return hasAnyRole(user, ADMIN_LEAD_ROLES);
}

export type RestrictionFeature =
  | "adminArea"
  | "projectCreation"
  | "readiness"
  | "exports"
  | "clientProfiles"
  | "overrideExecution"
  | "frameworkImportValidation";

const restrictionMessages: Record<RestrictionFeature, string> = {
  adminArea: "Only ADMIN or LEAD can access the admin area.",
  projectCreation: "Only ADMIN or LEAD can create or manage projects.",
  readiness: "Only ADMIN or LEAD can access readiness views.",
  exports: "Only ADMIN or LEAD can access export generation and history.",
  clientProfiles: "Only ADMIN or LEAD can manage client profiles and variable previews.",
  overrideExecution: "Only ADMIN can execute governed reopen overrides.",
  frameworkImportValidation: "Only ADMIN or LEAD can validate framework imports.",
};

export function getRestrictionMessage(feature: RestrictionFeature) {
  return restrictionMessages[feature];
}
