const { execFileSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { URL } = require("node:url");

const DEFAULT_BASE_URL = "http://127.0.0.1:18080";

function runPythonSeedScript(baseUrl) {
  const repoRoot = resolve(__dirname, "../../..");
  const backendDir = resolve(repoRoot, "backend");
  const venvPython = resolve(backendDir, ".venv/bin/python");
  const pythonBinary = existsSync(venvPython) ? venvPython : "python3";
  const host = new URL(baseUrl).hostname || "127.0.0.1";
  const seedScript = `
from django.contrib.auth import get_user_model
from apps.accounts.models import ClientProfile, Department
from apps.frameworks.models import Framework, Area, Standard
from apps.indicators.models import Indicator
from apps.masters.choices import DocumentTypeChoices, EvidenceTypeChoices, RoleChoices

User = get_user_model()
department, _ = Department.objects.get_or_create(name="E2E")
def ensure_user(username, role, *, is_staff=False, is_superuser=False):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "role": role,
            "department": department,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
            "is_active": True,
        },
    )
    changed = False
    if user.role != role:
        user.role = role
        changed = True
    if user.department_id != department.id:
        user.department = department
        changed = True
    if user.is_staff != is_staff:
        user.is_staff = is_staff
        changed = True
    if user.is_superuser != is_superuser:
        user.is_superuser = is_superuser
        changed = True
    if not user.is_active:
        user.is_active = True
        changed = True
    if changed:
        user.save()
    user.set_password("x")
    user.save(update_fields=["password"])
    return user

ensure_user("e2e_admin", RoleChoices.ADMIN, is_staff=True, is_superuser=True)
ensure_user("e2e_lead", RoleChoices.LEAD)
ensure_user("e2e_owner", RoleChoices.OWNER)
ensure_user("e2e_reviewer", RoleChoices.REVIEWER)
ensure_user("e2e_approver", RoleChoices.APPROVER)

framework, _ = Framework.objects.get_or_create(
    name="E2E Framework",
    defaults={"description": "Playwright-seeded framework for deterministic create/init tests."},
)
area, _ = Area.objects.get_or_create(
    framework=framework,
    code="E2E-A1",
    defaults={"name": "E2E Area", "description": "Seed area", "sort_order": 1},
)
standard, _ = Standard.objects.get_or_create(
    framework=framework,
    code="E2E-S1",
    defaults={"area": area, "name": "E2E Standard", "description": "Seed standard", "sort_order": 1},
)
if standard.area_id != area.id:
    standard.area = area
    standard.save(update_fields=["area"])
Indicator.objects.get_or_create(
    framework=framework,
    area=area,
    standard=standard,
    code="E2E-IND-001",
    defaults={
        "text": "E2E seeded indicator",
        "required_evidence_description": "Upload evidence for E2E indicator",
        "evidence_type": EvidenceTypeChoices.DOCUMENT,
        "document_type": DocumentTypeChoices.POLICY,
        "fulfillment_guidance": "Attach a controlled evidence item.",
        "minimum_required_evidence_count": 1,
        "is_active": True,
        "is_recurring": True,
        "recurrence_frequency": "MONTHLY",
        "recurrence_mode": "EITHER",
        "sort_order": 1,
        "reusable_template_allowed": True,
    },
)
indicator = Indicator.objects.get(framework=framework, code="E2E-IND-001")
changed = False
if not indicator.is_recurring:
    indicator.is_recurring = True
    changed = True
if indicator.recurrence_frequency == "NONE":
    indicator.recurrence_frequency = "MONTHLY"
    changed = True
if indicator.recurrence_mode != "EITHER":
    indicator.recurrence_mode = "EITHER"
    changed = True
if changed:
    indicator.save(update_fields=["is_recurring", "recurrence_frequency", "recurrence_mode"])

ClientProfile.objects.get_or_create(
    organization_name="E2E Client Profile",
    defaults={
        "address": "E2E Address",
        "license_number": "E2E-LIC-001",
        "registration_number": "E2E-REG-001",
        "contact_person": "E2E Contact",
        "department_names": ["E2E QA", "Compliance"],
    },
)
print("seeded:e2e_users")
`;

  execFileSync(pythonBinary, ["manage.py", "shell", "-c", seedScript], {
    cwd: backendDir,
    env: {
      ...process.env,
      DJANGO_ALLOWED_HOSTS: [process.env.DJANGO_ALLOWED_HOSTS || "", host, "localhost", "127.0.0.1"]
        .filter(Boolean)
        .join(","),
    },
    stdio: "pipe",
  });
}

module.exports = async () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || DEFAULT_BASE_URL;
  runPythonSeedScript(baseUrl);
};
