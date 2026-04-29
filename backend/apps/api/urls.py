from django.urls import path

from apps.api.views.auth import AuthLoginView, AuthLogoutView, AuthSessionView
from apps.api.views.system import AIHealthView, AITestConnectionView, BackendHealthView
from apps.api.views.admin import (
    AdminDashboardView,
    FrameworkAdminListCreateView,
    FrameworkClassificationBulkReviewView,
    FrameworkClassificationView,
    FrameworkClassifyIndicatorsView,
    FrameworkImportCreateView,
    AdminUserUpdateView,
    AdminUserPasswordResetView,
    AdminUsersView,
    AIUsageLogListView,
    AuditLogView,
    DocumentGenerationQueueView,
    DocumentDraftGenerateView,
    DocumentDraftListCreateView,
    DocumentDraftPromoteToEvidenceView,
    DocumentDraftRetrieveUpdateView,
    ExportGenerateView,
    ExportHistoryView,
    FrameworkImportValidateView,
    IndicatorClassificationUpdateView,
    ImportLogListView,
    MasterValueListCreateView,
    MasterValueUpdateView,
    ProjectReadinessView,
    ReopenOverridesView,
)
from apps.api.views.ai_actions import AIAcceptView, AIGenerateView, ProjectIndicatorAIOutputsView
from apps.api.views.dashboard import DashboardWorklistView
from apps.api.views.evidence import (
    EvidenceCreateView,
    EvidenceReviewView,
    EvidenceUpdateView,
    ProjectIndicatorEvidenceListView,
)
from apps.api.views.exports import (
    ProjectExcelExportView,
    ProjectPhysicalRetrievalExportView,
    ProjectPrintBundleExportView,
)
from apps.api.views.frameworks import FrameworkAnalysisView, FrameworkListView
from apps.api.views.frameworks import FrameworkTemplateView, FrameworkExportView
from apps.api.views.project_indicators import (
    ProjectIndicatorAssignView,
    ProjectIndicatorDetailView,
    ProjectIndicatorMarkMetView,
    ProjectIndicatorReopenView,
    ProjectIndicatorSendForReviewView,
    ProjectIndicatorStartView,
    ProjectIndicatorUpdateWorkingStateView,
    ProjectIndicatorsForProjectListView, # Imported this view
)
from apps.api.views.projects import (
    AreasProgressView,
    ProjectCloneView,
    ProjectInitializeFromFrameworkView,
    ProjectInspectionView,
    ProjectListCreateView,
    PreInspectionCheckView,
    ProjectRetrieveUpdateView,
    StandardsProgressView,
)
from apps.api.views.recurring import (
    RecurringInstanceApproveView,
    RecurringInstanceSubmitView,
    RecurringQueueView,
)
from apps.api.views.users import (
    ClientProfileListCreateView,
    ClientProfileRetrieveUpdateView,
    ClientProfileVariablesPreviewView,
    UserListCreateView,
)


urlpatterns = [
    path("api/health/", BackendHealthView.as_view(), name="api-health"),
    path("api/admin/ai/health/", AIHealthView.as_view(), name="admin-ai-health"),
    path("api/admin/ai/test-connection/", AITestConnectionView.as_view(), name="admin-ai-test-connection"),
    path("api/auth/session/", AuthSessionView.as_view(), name="auth-session"),
    path("api/auth/login/", AuthLoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", AuthLogoutView.as_view(), name="auth-logout"),
    path("api/users/", UserListCreateView.as_view(), name="user-list"),
    path("api/admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("api/admin/masters/<str:key>/", MasterValueListCreateView.as_view(), name="admin-master-list-create"),
    path("api/admin/masters/<str:key>/<int:pk>/", MasterValueUpdateView.as_view(), name="admin-master-update"),
    path("api/admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("api/admin/users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("api/admin/users/<int:pk>/password/", AdminUserPasswordResetView.as_view(), name="admin-user-password-reset"),
    path("api/audit/", AuditLogView.as_view(), name="audit-log"),
    path("api/admin/overrides/", ReopenOverridesView.as_view(), name="admin-overrides"),
    path("api/admin/import/validate-framework/", FrameworkImportValidateView.as_view(), name="framework-import-validate"),
    path("api/admin/import/logs/", ImportLogListView.as_view(), name="import-log-list"),
    path("api/admin/ai/usage/", AIUsageLogListView.as_view(), name="admin-ai-usage"),
    path("api/admin/queues/document-generation/", DocumentGenerationQueueView.as_view(), name="admin-queue-document-generation"),
    path(
        "api/admin/queues/document-generation/<int:indicator_id>/generate-draft/",
        DocumentDraftGenerateView.as_view(),
        name="admin-document-draft-generate",
    ),
    path(
        "api/admin/document-drafts/",
        DocumentDraftListCreateView.as_view(),
        name="admin-document-drafts",
    ),
    path(
        "api/admin/document-drafts/<int:pk>/",
        DocumentDraftRetrieveUpdateView.as_view(),
        name="admin-document-draft-detail",
    ),
    path(
        "api/admin/document-drafts/<int:pk>/promote-to-evidence/",
        DocumentDraftPromoteToEvidenceView.as_view(),
        name="admin-document-draft-promote-to-evidence",
    ),
    path("api/client-profiles/", ClientProfileListCreateView.as_view(), name="client-profile-list-create"),
    path("api/client-profiles/<int:pk>/", ClientProfileRetrieveUpdateView.as_view(), name="client-profile-detail"),
    path(
        "api/client-profiles/<int:pk>/variables-preview/",
        ClientProfileVariablesPreviewView.as_view(),
        name="client-profile-variables-preview",
    ),
    path("api/projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("api/frameworks/", FrameworkListView.as_view(), name="framework-list"),
    path("api/frameworks/template/", FrameworkTemplateView.as_view(), name="framework-template"),
    path("api/frameworks/<int:framework_id>/export/", FrameworkExportView.as_view(), name="framework-export"),
    path("api/frameworks/<int:framework_id>/analysis/", FrameworkAnalysisView.as_view(), name="framework-analysis"),
    path("api/admin/frameworks/", FrameworkAdminListCreateView.as_view(), name="admin-frameworks"),
    path("api/admin/frameworks/import/", FrameworkImportCreateView.as_view(), name="admin-frameworks-import"),
    path(
        "api/admin/frameworks/<int:framework_id>/classification/",
        FrameworkClassificationView.as_view(),
        name="admin-framework-classification",
    ),
    path(
        "api/admin/frameworks/<int:framework_id>/classify-indicators/",
        FrameworkClassifyIndicatorsView.as_view(),
        name="admin-framework-classify-indicators",
    ),
    path(
        "api/admin/frameworks/<int:framework_id>/classification/bulk-review/",
        FrameworkClassificationBulkReviewView.as_view(),
        name="admin-framework-classification-bulk-review",
    ),
    path(
        "api/admin/indicators/<int:indicator_id>/classification/",
        IndicatorClassificationUpdateView.as_view(),
        name="admin-indicator-classification-update",
    ),
    path("api/projects/<int:pk>/", ProjectRetrieveUpdateView.as_view(), name="project-detail"),
    path(
        "api/projects/<int:project_id>/initialize-from-framework/",
        ProjectInitializeFromFrameworkView.as_view(),
        name="project-initialize-from-framework",
    ),
    path("api/projects/<int:project_id>/clone/", ProjectCloneView.as_view(), name="project-clone"),
    path("api/projects/<int:project_id>/project-indicators/", ProjectIndicatorsForProjectListView.as_view(), name="project-indicators-for-project"),
    path("api/projects/<int:project_id>/readiness/", ProjectReadinessView.as_view(), name="project-readiness"),
    path("api/projects/<int:project_id>/inspection-view/", ProjectInspectionView.as_view(), name="project-inspection-view"),
    path(
        "api/projects/<int:project_id>/pre-inspection-check/",
        PreInspectionCheckView.as_view(),
        name="project-pre-inspection-check",
    ),
    path(
        "api/projects/<int:project_id>/standards-progress/",
        StandardsProgressView.as_view(),
        name="standards-progress",
    ),
    path(
        "api/projects/<int:project_id>/areas-progress/",
        AreasProgressView.as_view(),
        name="areas-progress",
    ),
    path("api/dashboard/worklist/", DashboardWorklistView.as_view(), name="dashboard-worklist"),
    path(
        "api/project-indicators/<int:pk>/",
        ProjectIndicatorDetailView.as_view(),
        name="project-indicator-detail",
    ),
    path(
        "api/project-indicators/<int:pk>/assign/",
        ProjectIndicatorAssignView.as_view(),
        name="project-indicator-assign",
    ),
    path(
        "api/project-indicators/<int:pk>/update-working-state/",
        ProjectIndicatorUpdateWorkingStateView.as_view(),
        name="project-indicator-update-working-state",
    ),
    path(
        "api/project-indicators/<int:pk>/start/",
        ProjectIndicatorStartView.as_view(),
        name="project-indicator-start",
    ),
    path(
        "api/project-indicators/<int:pk>/send-for-review/",
        ProjectIndicatorSendForReviewView.as_view(),
        name="project-indicator-send-for-review",
    ),
    path(
        "api/project-indicators/<int:pk>/mark-met/",
        ProjectIndicatorMarkMetView.as_view(),
        name="project-indicator-mark-met",
    ),
    path(
        "api/project-indicators/<int:pk>/reopen/",
        ProjectIndicatorReopenView.as_view(),
        name="project-indicator-reopen",
    ),
    path(
        "api/project-indicators/<int:pk>/evidence/",
        ProjectIndicatorEvidenceListView.as_view(),
        name="project-indicator-evidence",
    ),
    path(
        "api/project-indicators/<int:pk>/ai-outputs/",
        ProjectIndicatorAIOutputsView.as_view(),
        name="project-indicator-ai-outputs",
    ),
    path("api/evidence/", EvidenceCreateView.as_view(), name="evidence-create"),
    path("api/evidence/<int:pk>/update/", EvidenceUpdateView.as_view(), name="evidence-update"),
    path("api/evidence/<int:pk>/review/", EvidenceReviewView.as_view(), name="evidence-review"),
    path("api/recurring/queue/", RecurringQueueView.as_view(), name="recurring-queue"),
    path(
        "api/recurring/instances/<int:pk>/submit/",
        RecurringInstanceSubmitView.as_view(),
        name="recurring-instance-submit",
    ),
    path(
        "api/recurring/instances/<int:pk>/approve/",
        RecurringInstanceApproveView.as_view(),
        name="recurring-instance-approve",
    ),
    path("api/ai/generate/", AIGenerateView.as_view(), name="ai-generate"),
    path("api/ai/outputs/<int:pk>/accept/", AIAcceptView.as_view(), name="ai-accept"),
    path(
        "api/exports/projects/<int:project_id>/excel/",
        ProjectExcelExportView.as_view(),
        name="project-export-excel",
    ),
    path(
        "api/exports/projects/<int:project_id>/print-bundle/",
        ProjectPrintBundleExportView.as_view(),
        name="project-export-print-bundle",
    ),
    path(
        "api/exports/projects/<int:project_id>/physical-retrieval/",
        ProjectPhysicalRetrievalExportView.as_view(),
        name="project-export-physical-retrieval",
    ),
    path(
        "api/exports/projects/<int:project_id>/history/",
        ExportHistoryView.as_view(),
        name="project-export-history",
    ),
    path(
        "api/exports/projects/<int:project_id>/generate/",
        ExportGenerateView.as_view(),
        name="project-export-generate",
    ),
]
