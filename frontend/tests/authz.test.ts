import {
  canAccessAdminArea,
  canCreateProject,
  canValidateFrameworkImport,
  canViewExports,
  canViewReadiness,
  getRestrictionMessage,
} from "@/lib/authz";

describe("authz helpers", () => {
  it("allows ADMIN and LEAD for governed surfaces", () => {
    expect(canAccessAdminArea({ role: "ADMIN" })).toBe(true);
    expect(canAccessAdminArea({ role: "LEAD" })).toBe(true);
    expect(canCreateProject({ role: "ADMIN" })).toBe(true);
    expect(canCreateProject({ role: "LEAD" })).toBe(true);
    expect(canViewReadiness({ role: "ADMIN" })).toBe(true);
    expect(canViewReadiness({ role: "LEAD" })).toBe(true);
    expect(canViewExports({ role: "ADMIN" })).toBe(true);
    expect(canViewExports({ role: "LEAD" })).toBe(true);
    expect(canValidateFrameworkImport({ role: "ADMIN" })).toBe(true);
    expect(canValidateFrameworkImport({ role: "LEAD" })).toBe(true);
  });

  it("denies non-admin/non-lead roles for governed surfaces", () => {
    expect(canAccessAdminArea({ role: "OWNER" })).toBe(false);
    expect(canCreateProject({ role: "OWNER" })).toBe(false);
    expect(canViewReadiness({ role: "OWNER" })).toBe(false);
    expect(canViewExports({ role: "OWNER" })).toBe(false);
    expect(canValidateFrameworkImport({ role: "OWNER" })).toBe(false);
  });

  it("returns stable user-facing restriction messages", () => {
    expect(getRestrictionMessage("adminArea")).toContain("ADMIN or LEAD");
    expect(getRestrictionMessage("projectCreation")).toContain("create or manage projects");
    expect(getRestrictionMessage("readiness")).toContain("readiness");
    expect(getRestrictionMessage("exports")).toContain("export");
    expect(getRestrictionMessage("frameworkImportValidation")).toContain("validate framework imports");
  });
});
