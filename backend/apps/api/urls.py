from django.urls import path

from apps.api.views.ai_actions import AIAcceptView, AIGenerateView, ProjectIndicatorAIOutputsView
from apps.api.views.dashboard import DashboardWorklistView
from apps.api.views.evidence import (
    EvidenceCreateView,
    EvidenceReviewView,
    EvidenceUpdateView,
    ProjectIndicatorEvidenceListView,
)
from apps.api.views.exports import ProjectExcelExportView, ProjectPrintBundleExportView
from apps.api.views.project_indicators import (
    ProjectIndicatorAssignView,
    ProjectIndicatorDetailView,
    ProjectIndicatorMarkMetView,
    ProjectIndicatorReopenView,
    ProjectIndicatorSendForReviewView,
    ProjectIndicatorStartView,
    ProjectIndicatorUpdateWorkingStateView,
)
from apps.api.views.projects import (
    AreasProgressView,
    ProjectInitializeFromFrameworkView,
    ProjectListCreateView,
    ProjectRetrieveUpdateView,
    StandardsProgressView,
)
from apps.api.views.recurring import (
    RecurringInstanceApproveView,
    RecurringInstanceSubmitView,
    RecurringQueueView,
)


urlpatterns = [
    path("api/projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("api/projects/<int:pk>/", ProjectRetrieveUpdateView.as_view(), name="project-detail"),
    path(
        "api/projects/<int:project_id>/initialize-from-framework/",
        ProjectInitializeFromFrameworkView.as_view(),
        name="project-initialize-from-framework",
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
]
