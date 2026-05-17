# Command Log

Timestamp: 2026-05-16 21:42 UTC

This file captures raw command outputs for baseline verification and post-change verification.


## 2026-05-16T21:43:56Z

```
$ python manage.py check
```

/bin/bash: line 1: python: command not found


## 2026-05-16T21:44:06Z

```
$ python3 manage.py check
```

python3: can't open file '/home/munaim/srv/apps/accrediops/manage.py': [Errno 2] No such file or directory


## 2026-05-16T21:44:26Z

Note: repo uses `backend/manage.py` (no root `manage.py`).

```
$ python3 backend/manage.py check
```

System check identified no issues (0 silenced).


## 2026-05-16T21:44:38Z

```
$ python3 backend/manage.py makemigrations --check --dry-run
```

No changes detected


## 2026-05-16T21:44:47Z

```
$ pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api
```

........................................................................ [ 57%]
.....................................................                    [100%]
=============================== warnings summary ===============================
../../../.local/lib/python3.12/site-packages/django/conf/__init__.py:289
  /home/munaim/.local/lib/python3.12/site-packages/django/conf/__init__.py:289: RemovedInDjango51Warning: The STATICFILES_STORAGE setting is deprecated. Use STORAGES instead.
    warnings.warn(STATICFILES_STORAGE_DEPRECATED_MSG, RemovedInDjango51Warning)

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.12.3-final-0 ________________

Name                                                                                                 Stmts   Miss  Cover   Missing
----------------------------------------------------------------------------------------------------------------------------------
backend/apps/__init__.py                                                                                 0      0   100%
backend/apps/accounts/__init__.py                                                                        0      0   100%
backend/apps/accounts/admin.py                                                                          20      0   100%
backend/apps/accounts/apps.py                                                                            5      0   100%
backend/apps/accounts/migrations/0001_initial.py                                                         9      0   100%
backend/apps/accounts/migrations/0002_clientprofile.py                                                   4      0   100%
backend/apps/accounts/migrations/0003_clientprofile_linked_users.py                                      4      0   100%
backend/apps/accounts/migrations/__init__.py                                                             0      0   100%
backend/apps/accounts/models/__init__.py                                                                 3      0   100%
backend/apps/accounts/models/department.py                                                              21      2    90%   11, 33
backend/apps/accounts/models/user.py                                                                     8      1    88%   22
backend/apps/ai_actions/__init__.py                                                                      0      0   100%
backend/apps/ai_actions/admin.py                                                                         8      0   100%
backend/apps/ai_actions/apps.py                                                                          5      0   100%
backend/apps/ai_actions/migrations/0001_initial.py                                                       7      0   100%
backend/apps/ai_actions/migrations/0002_aiusagelog.py                                                    6      0   100%
backend/apps/ai_actions/migrations/0003_documentdraft.py                                                 6      0   100%
backend/apps/ai_actions/migrations/0004_documentdraft_draft_kind_and_more.py                             4      0   100%
backend/apps/ai_actions/migrations/0005_documentdraft_project_evidence_requirement.py                    5      0   100%
backend/apps/ai_actions/migrations/__init__.py                                                           0      0   100%
backend/apps/ai_actions/models/__init__.py                                                               5      0   100%
backend/apps/ai_actions/models/ai_usage_log.py                                                          23      1    96%   47
backend/apps/ai_actions/models/document_draft.py                                                        64     20    69%   144-167, 170-172
backend/apps/ai_actions/models/evidence_requirement_suggestion.py                                        2      0   100%
backend/apps/ai_actions/models/generated_output.py                                                      18      1    94%   38
backend/apps/ai_actions/services/__init__.py                                                             6      0   100%
backend/apps/ai_actions/services/classification.py                                                     168     32    81%   80, 82, 100, 143-144, 151-152, 208, 210, 226-248, 251, 253, 283-284, 303-316, 321, 371-401
backend/apps/ai_actions/services/classification_prompts.py                                               8      0   100%
backend/apps/ai_actions/services/document_drafting.py                                                  116     27    77%   32, 35, 62-66, 86, 118-133, 163, 165, 171, 206-244, 255, 277, 287, 289, 358
backend/apps/ai_actions/services/framework_documentation.py                                            125     46    63%   45, 152-158, 160, 186, 189, 195, 201, 204-238, 255, 329-379
backend/apps/ai_actions/services/generation.py                                                          71     12    83%   24-32, 49-50, 101, 151
backend/apps/ai_actions/services/prompts.py                                                             73      5    93%   106-109, 334
backend/apps/ai_actions/services/provider.py                                                            33      4    88%   48, 50, 76, 79
backend/apps/ai_actions/services/usage.py                                                                5      0   100%
backend/apps/api/__init__.py                                                                             0      0   100%
backend/apps/api/apps.py                                                                                 5      0   100%
backend/apps/api/exception_handler.py                                                                   45      5    89%   10, 18, 50, 67-68
backend/apps/api/exceptions.py                                                                           6      0   100%
backend/apps/api/migrations/__init__.py                                                                  0      0   100%
backend/apps/api/pagination.py                                                                          16      2    88%   16-17
backend/apps/api/responses.py                                                                            4      0   100%
backend/apps/api/serializers/__init__.py                                                                 0      0   100%
backend/apps/api/serializers/admin.py                                                                  122     13    89%   107-112, 115-121
backend/apps/api/serializers/ai_actions.py                                                              15      0   100%
backend/apps/api/serializers/auth.py                                                                    18      1    94%   17
backend/apps/api/serializers/capa.py                                                                    36      0   100%
backend/apps/api/serializers/common.py                                                                  52     13    75%   23-28, 31-37
backend/apps/api/serializers/evidence.py                                                                39      0   100%
backend/apps/api/serializers/evidence_requirements.py                                                   32     32     0%   1-65
backend/apps/api/serializers/indicator.py                                                                0      0   100%
backend/apps/api/serializers/project_evidence_requirements.py                                           17      4    76%   10-13
backend/apps/api/serializers/project_indicators.py                                                     125      2    98%   256, 262
backend/apps/api/serializers/projects.py                                                                62      0   100%
backend/apps/api/serializers/recurring.py                                                               34      1    97%   63
backend/apps/api/tests/__init__.py                                                                       0      0   100%
backend/apps/api/tests/base.py                                                                          32      2    94%   109-110
backend/apps/api/tests/test_admin_readiness_inspection_exports.py                                      124      0   100%
backend/apps/api/tests/test_admin_registry.py                                                           15      0   100%
backend/apps/api/tests/test_ai_generation_gemini.py                                                    182      0   100%
backend/apps/api/tests/test_auth_api.py                                                                 30      0   100%
backend/apps/api/tests/test_benchmark_bulk_update.py                                                    32      0   100%
backend/apps/api/tests/test_clone_project.py                                                            17      0   100%
backend/apps/api/tests/test_document_drafting.py                                                        89      0   100%
backend/apps/api/tests/test_evidence_and_ai.py                                                          53      0   100%
backend/apps/api/tests/test_evidence_pack.py                                                           105      0   100%
backend/apps/api/tests/test_framework_documentation_ai.py                                               35      0   100%
backend/apps/api/tests/test_frameworks_api.py                                                           86      0   100%
backend/apps/api/tests/test_governance_hardening.py                                                    172      0   100%
backend/apps/api/tests/test_indicator_classification.py                                                151      0   100%
backend/apps/api/tests/test_mark_met_and_progress.py                                                    46      0   100%
backend/apps/api/tests/test_physical_evidence.py                                                        14      0   100%
backend/apps/api/tests/test_print_pack.py                                                               37      0   100%
backend/apps/api/tests/test_project_create_and_initialize.py                                            16      0   100%
backend/apps/api/tests/test_project_delete_and_client_profiles.py                                       25      0   100%
backend/apps/api/tests/test_project_initialization.py                                                   12      0   100%
backend/apps/api/tests/test_recurring_queue.py                                                          64      0   100%
backend/apps/api/tests/test_variable_replacement.py                                                      9      0   100%
backend/apps/api/urls.py                                                                                21      0   100%
backend/apps/api/views/__init__.py                                                                       0      0   100%
backend/apps/api/views/admin.py                                                                        421    114    73%   62, 69-71, 74-78, 85-90, 98, 101, 104-109, 116-120, 127-135, 152-154, 156-158, 219, 223, 226-227, 313-321, 324, 331-390, 412, 414, 432-452, 459-460, 593, 595, 599-600, 650, 709, 711-722, 743-744, 747
backend/apps/api/views/ai_actions.py                                                                    35     10    71%   22-23, 26-27, 45-50
backend/apps/api/views/auth.py                                                                          28      0   100%
backend/apps/api/views/capa.py                                                                          82     43    48%   26-28, 35-37, 43-47, 53-55, 58-60, 63-71, 78-89, 96-98, 101, 111-137
backend/apps/api/views/dashboard.py                                                                     55     13    76%   60, 62, 64, 66, 68, 70, 72, 74, 86, 88, 90-91, 99
backend/apps/api/views/evidence.py                                                                      44     10    77%   23-24, 27-28, 46-55
backend/apps/api/views/exports.py                                                                       52      2    96%   160-161
backend/apps/api/views/frameworks.py                                                                    39      0   100%
backend/apps/api/views/indicator.py                                                                     33     16    52%   18-20, 23-29, 35-40
backend/apps/api/views/project_evidence_requirements.py                                                 49     27    45%   17-20, 23-25, 33-35, 38-48, 51-62, 65
backend/apps/api/views/project_indicators.py                                                            93     31    67%   79-88, 95-104, 174-182, 190-210
backend/apps/api/views/projects.py                                                                     105     10    90%   32, 46-47, 50-55, 170
backend/apps/api/views/recurring.py                                                                     52      2    96%   34, 36
backend/apps/api/views/system.py                                                                        42     24    43%   17-20, 33-38, 55-86
backend/apps/api/views/users.py                                                                         97     47    52%   18-20, 23-25, 28-45, 48-49, 52-55, 64-66, 69-74, 81-86, 94, 97-98, 111-112, 115-119
backend/apps/audit/__init__.py                                                                           0      0   100%
backend/apps/audit/admin.py                                                                             10      0   100%
backend/apps/audit/apps.py                                                                               5      0   100%
backend/apps/audit/migrations/0001_initial.py                                                            7      0   100%
backend/apps/audit/migrations/__init__.py                                                                0      0   100%
backend/apps/audit/models/__init__.py                                                                    2      0   100%
backend/apps/audit/models/audit_event.py                                                                15      1    93%   25
backend/apps/audit/services.py                                                                          25      3    88%   15, 22, 28
backend/apps/evidence/__init__.py                                                                        0      0   100%
backend/apps/evidence/admin.py                                                                           8      0   100%
backend/apps/evidence/apps.py                                                                            5      0   100%
backend/apps/evidence/migrations/0001_initial.py                                                         7      0   100%
backend/apps/evidence/migrations/0002_evidenceitem_file_label_and_more.py                                4      0   100%
backend/apps/evidence/migrations/0003_evidenceitem_project_evidence_requirement.py                       5      0   100%
backend/apps/evidence/migrations/__init__.py                                                             0      0   100%
backend/apps/evidence/models/__init__.py                                                                 2      0   100%
backend/apps/evidence/models/evidence.py                                                                38      7    82%   79-92, 95
backend/apps/evidence/services.py                                                                      111     26    77%   58, 139-154, 171, 173, 185-204, 269
backend/apps/evidence/tests/__init__.py                                                                  0      0   100%
backend/apps/evidence/tests/test_services.py                                                            40      0   100%
backend/apps/exports/__init__.py                                                                         0      0   100%
backend/apps/exports/admin.py                                                                           16      0   100%
backend/apps/exports/apps.py                                                                             4      0   100%
backend/apps/exports/migrations/0001_initial.py                                                          6      0   100%
backend/apps/exports/migrations/0002_importlog_exportjob.py                                              6      0   100%
backend/apps/exports/migrations/__init__.py                                                              0      0   100%
backend/apps/exports/models.py                                                                          12      1    92%   25
backend/apps/exports/models_admin.py                                                                    24      2    92%   28, 41
backend/apps/exports/services.py                                                                       242     24    90%   280, 378, 476-488, 562-567, 574-576, 580-581
backend/apps/exports/services_admin.py                                                                  35      2    94%   11-12
backend/apps/exports/tests/__init__.py                                                                   0      0   100%
backend/apps/exports/tests/test_services.py                                                             39      0   100%
backend/apps/exports/tests/test_zip_export.py                                                          107      1    99%   148
backend/apps/frameworks/__init__.py                                                                      0      0   100%
backend/apps/frameworks/admin.py                                                                        21      0   100%
backend/apps/frameworks/apps.py                                                                          5      0   100%
backend/apps/frameworks/migrations/0001_initial.py                                                       6      0   100%
backend/apps/frameworks/migrations/__init__.py                                                           0      0   100%
backend/apps/frameworks/models/__init__.py                                                               2      0   100%
backend/apps/frameworks/models/framework.py                                                             35      5    86%   13, 34, 60-61, 64
backend/apps/frameworks/services.py                                                                    149     20    87%   100, 104, 122, 128, 139-140, 142, 151, 205-212, 216-223, 239, 288-289, 310-311, 318, 320, 325
backend/apps/frameworks/tests/__init__.py                                                                0      0   100%
backend/apps/frameworks/tests/test_services.py                                                          75     75     0%   1-173
backend/apps/indicators/__init__.py                                                                      0      0   100%
backend/apps/indicators/admin.py                                                                        24      0   100%
backend/apps/indicators/apps.py                                                                          5      0   100%
backend/apps/indicators/capa_services.py                                                               106     79    25%   34-61, 73-92, 107-139, 156-186, 195-210, 221-252, 262-286
backend/apps/indicators/migrations/0001_initial.py                                                       7      0   100%
backend/apps/indicators/migrations/0002_indicator_evidence_reuse_policy_and_more.py                      4      0   100%
backend/apps/indicators/migrations/0003_indicator_ai_assistance_level_and_more.py                       16      4    75%   23-36
backend/apps/indicators/migrations/0004_evidencerequirement_projectevidencerequirement_and_more.py       6      0   100%
backend/apps/indicators/migrations/0005_evidencerequirementsuggestion.py                                 6      0   100%
backend/apps/indicators/migrations/0006_gap_capa.py                                                      6      0   100%
backend/apps/indicators/migrations/__init__.py                                                           0      0   100%
backend/apps/indicators/models/__init__.py                                                               3      0   100%
backend/apps/indicators/models/capa.py                                                                  50      2    96%   31, 69
backend/apps/indicators/models/indicator.py                                                            174     20    89%   122, 124, 126, 128, 130, 133, 176, 236, 309, 311, 315, 400-413, 416, 439, 464
backend/apps/indicators/services.py                                                                    241     98    59%   38, 40, 103, 107, 130-145, 285-305, 392, 396, 431-452, 457-471, 485-509, 519-534, 544-562, 572-588
backend/apps/indicators/signals.py                                                                       0      0   100%
backend/apps/indicators/tests/__init__.py                                                                0      0   100%
backend/apps/indicators/tests/test_evidence_requirements.py                                             26      0   100%
backend/apps/indicators/tests/test_services.py                                                         192      0   100%
backend/apps/masters/__init__.py                                                                         0      0   100%
backend/apps/masters/admin.py                                                                            7      0   100%
backend/apps/masters/apps.py                                                                             5      0   100%
backend/apps/masters/choices.py                                                                        145      0   100%
backend/apps/masters/management/__init__.py                                                              0      0   100%
backend/apps/masters/management/commands/__init__.py                                                     0      0   100%
backend/apps/masters/management/commands/seed_master_values.py                                          16     16     0%   1-41
backend/apps/masters/management/commands/seed_policies.py                                               12     12     0%   1-33
backend/apps/masters/migrations/0001_initial.py                                                          5      0   100%
backend/apps/masters/migrations/0002_policydecision.py                                                   4      0   100%
backend/apps/masters/migrations/__init__.py                                                              0      0   100%
backend/apps/masters/models.py                                                                          25      2    92%   20, 35
backend/apps/masters/services.py                                                                         7      3    57%   12, 16-17
backend/apps/projects/__init__.py                                                                        0      0   100%
backend/apps/projects/admin.py                                                                           7      0   100%
backend/apps/projects/apps.py                                                                            5      0   100%
backend/apps/projects/benchmark_clone.py                                                                29     29     0%   1-70
backend/apps/projects/management/__init__.py                                                             0      0   100%
backend/apps/projects/management/commands/__init__.py                                                    0      0   100%
backend/apps/projects/management/commands/reset_lab_state.py                                            53     53     0%   1-105
backend/apps/projects/management/commands/seed_e2e_state.py                                            165    165     0%   1-304
backend/apps/projects/migrations/0001_initial.py                                                         7      0   100%
backend/apps/projects/migrations/0002_accreditationproject_client_profile.py                             5      0   100%
backend/apps/projects/migrations/__init__.py                                                             0      0   100%
backend/apps/projects/models/__init__.py                                                                 2      0   100%
backend/apps/projects/models/project.py                                                                 20      1    95%   45
backend/apps/projects/services.py                                                                       96     12    88%   47-59, 136-148, 253-254
backend/apps/projects/tests/__init__.py                                                                  0      0   100%
backend/apps/projects/tests/test_services.py                                                            99     99     0%   1-241
backend/apps/recurring/__init__.py                                                                       0      0   100%
backend/apps/recurring/admin.py                                                                         13      0   100%
backend/apps/recurring/apps.py                                                                           5      0   100%
backend/apps/recurring/migrations/0001_initial.py                                                        6      0   100%
backend/apps/recurring/migrations/__init__.py                                                            0      0   100%
backend/apps/recurring/models/__init__.py                                                                2      0   100%
backend/apps/recurring/models/recurring.py                                                              27      2    93%   25, 62
backend/apps/recurring/services.py                                                                     100     29    71%   26-31, 37-51, 58, 84, 125, 128, 130, 170, 185-190
backend/apps/recurring/tests/__init__.py                                                                 0      0   100%
backend/apps/recurring/tests/test_services.py                                                           41     41     0%   1-75
backend/apps/workflow/__init__.py                                                                        0      0   100%
backend/apps/workflow/apps.py                                                                            5      0   100%
backend/apps/workflow/guards.py                                                                         11      0   100%
backend/apps/workflow/migrations/__init__.py                                                             0      0   100%
backend/apps/workflow/permissions.py                                                                    73      7    90%   12-14, 82-83, 86-87
backend/apps/workflow/tests/__init__.py                                                                  0      0   100%
backend/apps/workflow/tests/test_transitions.py                                                         10     10     0%   1-14
backend/apps/workflow/transitions.py                                                                     7      1    86%   33
----------------------------------------------------------------------------------------------------------------------------------
TOTAL                                                                                                 7002   1427    80%
Coverage HTML written to dir ../OUT/backend_htmlcov
Coverage XML written to file ../OUT/backend_coverage.xml
125 passed, 1 warning in 443.84s (0:07:23)


## 2026-05-16T21:52:22Z

```
$ cd frontend && npm run lint
```


> accrediops-frontend@0.1.0 lint
> eslint app components lib tests utils


/home/munaim/srv/apps/accrediops/frontend/tests/e2e/helpers.ts
  76:16  warning  'readEnvelope' is defined but never used  @typescript-eslint/no-unused-vars

/home/munaim/srv/apps/accrediops/frontend/tests/topbar-performance.test.tsx
  16:18  warning  'id' is defined but never used  @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)



## 2026-05-16T21:52:34Z

```
$ cd frontend && npm run typecheck
```


> accrediops-frontend@0.1.0 typecheck
> tsc --noEmit



## 2026-05-16T21:52:47Z

```
$ cd frontend && npm run build
```


> accrediops-frontend@0.1.0 build
> next build

   ▲ Next.js 15.5.15

   Creating an optimized production build ...
 ✓ Compiled successfully in 18.3s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/23) ...
   Generating static pages (5/23) 
   Generating static pages (11/23) 
   Generating static pages (17/23) 
 ✓ Generating static pages (23/23)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                      Size  First Load JS
┌ ○ /                                           132 B         102 kB
├ ○ /_not-found                                 995 B         103 kB
├ ○ /admin                                    2.64 kB         108 kB
├ ○ /admin/ai/usage                           6.43 kB         130 kB
├ ○ /admin/audit                              2.46 kB         129 kB
├ ○ /admin/client-profiles                    1.95 kB         130 kB
├ ƒ /admin/document-drafts/[id]               14.2 kB         140 kB
├ ○ /admin/frameworks                         3.25 kB         130 kB
├ ƒ /admin/frameworks/classification          4.36 kB         131 kB
├ ○ /admin/import-logs                        3.09 kB         129 kB
├ ○ /admin/masters/document-types             3.01 kB         126 kB
├ ○ /admin/masters/evidence-types             3.01 kB         126 kB
├ ○ /admin/masters/priorities                 3.01 kB         126 kB
├ ○ /admin/masters/statuses                   3.01 kB         126 kB
├ ○ /admin/overrides                          5.79 kB         132 kB
├ ○ /admin/queues/document-generation          5.4 kB         132 kB
├ ○ /admin/system-health                      3.11 kB         120 kB
├ ○ /admin/users                              3.88 kB         130 kB
├ ○ /framework-documentation-ai               4.49 kB         131 kB
├ ƒ /frameworks/[id]/analysis                 3.48 kB         120 kB
├ ƒ /healthz                                    132 B         102 kB
├ ○ /login                                    3.68 kB         123 kB
├ ƒ /project-indicators/[id]                  11.9 kB         144 kB
├ ○ /projects                                 5.25 kB         134 kB
├ ƒ /projects/[projectId]                     4.62 kB         142 kB
├ ƒ /projects/[projectId]/areas-progress      4.15 kB         121 kB
├ ƒ /projects/[projectId]/client-profile      4.33 kB         132 kB
├ ƒ /projects/[projectId]/exports             3.57 kB         130 kB
├ ƒ /projects/[projectId]/inspection          1.95 kB         129 kB
├ ƒ /projects/[projectId]/pending-actions      9.1 kB         129 kB
├ ƒ /projects/[projectId]/print-pack          3.42 kB         130 kB
├ ƒ /projects/[projectId]/readiness           2.41 kB         129 kB
├ ƒ /projects/[projectId]/recurring           3.88 kB         132 kB
├ ƒ /projects/[projectId]/standards-progress   4.2 kB         121 kB
└ ƒ /projects/[projectId]/worklist            4.74 kB         142 kB
+ First Load JS shared by all                  102 kB
  ├ chunks/1255-5fe68596fe147850.js             46 kB
  ├ chunks/4bd1b696-f785427dddbba9fb.js       54.2 kB
  └ other shared chunks (total)               1.93 kB


ƒ Middleware                                  34.5 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand



## 2026-05-16T21:53:59Z

```
$ cd frontend && npm test
```


> accrediops-frontend@0.1.0 test
> vitest run


 RUN  v4.1.4 /home/munaim/srv/apps/accrediops/frontend

 ❯ tests/project-management-form.test.tsx (2 tests | 1 failed) 5653ms
     × updates project details and client profile linkage 5154ms
 ❯ tests/admin-overrides-screen.test.tsx (2 tests | 1 failed) 5932ms
     × requires confirmation before executing override 5038ms
(node:3256009) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
 ❯ tests/indicator-detail-screen.test.tsx (1 test | 1 failed) 52ms
     × disables admin-only reopen and shows governance trail sections for non-admin users 47ms
(node:3256259) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256400) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256502) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256522) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256569) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256669) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3256687) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/admin-overrides-screen.test.tsx > AdminOverridesScreen > requires confirmation before executing override
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ tests/admin-overrides-screen.test.tsx:75:3
     73|   });
     74|
     75|   it("requires confirmation before executing override", async () => {
       |   ^
     76|     const user = userEvent.setup();
     77|     reopenMutate.mockResolvedValue({});

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  tests/indicator-detail-screen.test.tsx > IndicatorDetailScreen governance controls > disables admin-only reopen and shows governance trail sections for non-admin users
Error: [vitest] No "useRecordGap" export is defined on the "@/lib/hooks/use-mutations" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:

vi.mock(import("@/lib/hooks/use-mutations"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // your mocked methods
  }
})

 ❯ IndicatorDetailScreen components/screens/indicator-detail-screen.tsx:156:21
    154|   const approveRecurring = useApproveRecurring(indicatorId, approvingR…
    155|   const acceptAI = useAcceptAI(indicatorId, acceptingAI?.id ?? 0, proj…
    156|   const recordGap = useRecordGap(indicatorId, projectId);
       |                     ^
    157|   const initializeCapa = useInitializeCapa(indicatorId, projectId);
    158|
 ❯ Object.react_stack_bottom_frame node_modules/react-dom/cjs/react-dom-client.development.js:25904:20
 ❯ renderWithHooks node_modules/react-dom/cjs/react-dom-client.development.js:7662:22
 ❯ updateFunctionComponent node_modules/react-dom/cjs/react-dom-client.development.js:10166:19
 ❯ beginWork node_modules/react-dom/cjs/react-dom-client.development.js:11778:18
 ❯ runWithFiberInDEV node_modules/react-dom/cjs/react-dom-client.development.js:874:13
 ❯ performUnitOfWork node_modules/react-dom/cjs/react-dom-client.development.js:17641:22
 ❯ workLoopSync node_modules/react-dom/cjs/react-dom-client.development.js:17469:41

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  tests/project-management-form.test.tsx > ProjectManagementForm > updates project details and client profile linkage
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ tests/project-management-form.test.tsx:69:3
     67|   });
     68|
     69|   it("updates project details and client profile linkage", async () =>…
       |   ^
     70|     mutateUpdateAsync.mockResolvedValue({ id: 1 });
     71|     const onSuccess = vi.fn();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  3 failed | 25 passed (28)
      Tests  3 failed | 51 passed (54)
   Start at  21:54:05
   Duration  40.78s (transform 6.68s, setup 6.34s, import 27.39s, tests 27.78s, environment 42.00s)



## 2026-05-16T21:56:20Z

```
$ (rerun after fixing missing test mock) cd frontend && npm test
```


> accrediops-frontend@0.1.0 test
> vitest run


 RUN  v4.1.4 /home/munaim/srv/apps/accrediops/frontend

(node:3260502) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260514) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260630) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260696) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260815) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260901) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260952) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3260994) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3261010) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)

 Test Files  28 passed (28)
      Tests  54 passed (54)
   Start at  21:56:21
   Duration  29.36s (transform 3.58s, setup 4.86s, import 19.58s, tests 16.40s, environment 32.39s)



## 2026-05-16T21:56:57Z

```
$ cd frontend && npx playwright test --workers=1
```


Running 80 tests using 1 worker

(node:3262302) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3262302) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 tests/e2e/00_runtime_and_auth.spec.ts:6:7 › 00 runtime and auth › runtime stays on 18080 and health routes are reachable (3.7s)
  ✓   2 tests/e2e/00_runtime_and_auth.spec.ts:19:7 › 00 runtime and auth › admin/lead/owner can authenticate and logout without shell crash (44.8s)
  ✓   3 tests/e2e/01_lab_framework_integrity.spec.ts:8:7 › 01 LAB framework integrity › LAB is visible in admin framework view and has exactly 119 indicators (13.3s)
  ✓   4 tests/e2e/02_project_create_and_initialize.spec.ts:9:9 › 02 project create and initialize › admin › ADMIN can create and initialize a LAB project (6.0s)
  ✓   5 tests/e2e/02_project_create_and_initialize.spec.ts:25:9 › 02 project create and initialize › lead › LEAD can create and initialize a LAB project (2.8s)
  ✓   6 tests/e2e/02_project_create_and_initialize.spec.ts:41:9 › 02 project create and initialize › owner › OWNER cannot create project (2.7s)
  ✓   7 tests/e2e/03_projects_navigation_and_overview.spec.ts:8:7 › 03 projects navigation and overview › project list and overview surfaces are navigable with clear next-step guidance (27.2s)
  ✓   8 tests/e2e/04_worklist_core.spec.ts:14:7 › 04 worklist core › worklist filters and show-all operate without 500 responses (9.4s)
  ✓   9 tests/e2e/05_indicator_detail_and_actions.spec.ts:8:7 › 05 indicator detail and actions › indicator detail renders readiness/summary/actions/evidence/recurring/governance sections (7.3s)
  ✓  10 tests/e2e/06_evidence_lifecycle.spec.ts:8:7 › 06 evidence lifecycle › add/review/version evidence and keep a single current marker (6.2s)
  ✓  11 tests/e2e/07_review_and_approval_lifecycle.spec.ts:8:7 › 07 review and approval lifecycle › start -> review -> met flow works and invalid transition is blocked (3.9s)
  ✓  12 tests/e2e/08_recurring_workflows.spec.ts:8:7 › 08 recurring workflows › submit and approve a recurring instance with state updates (6.2s)
  ✓  13 tests/e2e/09_ai_advisory_non_mutation.spec.ts:8:7 › 09 ai advisory non-mutation › AI output can be generated and accepted without mutating workflow status (6.6s)
  ✓  14 tests/e2e/10_readiness_inspection_exports.spec.ts:9:9 › 10 readiness, inspection, exports › admin › readiness and inspection screens open, unready export generation is blocked without history (22.4s)
  ✓  15 tests/e2e/10_readiness_inspection_exports.spec.ts:40:9 › 10 readiness, inspection, exports › owner › owner sees clean restricted UX on readiness and exports (5.9s)
  ✓  16 tests/e2e/11_clone_and_reuse.spec.ts:8:7 › 11 clone and reuse › clone project keeps source intact and copies initialized structure (9.6s)
  ✓  17 tests/e2e/12_admin_surfaces.spec.ts:8:7 › 12 admin surfaces › admin dashboard/users/masters/audit/import logs/overrides are reachable (35.3s)
  ✓  18 tests/e2e/13_role_visibility_and_authorization.spec.ts:9:9 › 13 role visibility and authorization › admin › admin has admin discoverability and create CTA (3.5s)
  ✓  19 tests/e2e/13_role_visibility_and_authorization.spec.ts:19:9 › 13 role visibility and authorization › lead › lead sees admin navigation and can access admin route (5.2s)
  ✓  20 tests/e2e/13_role_visibility_and_authorization.spec.ts:31:9 › 13 role visibility and authorization › owner › owner sees restricted route UX and no create capability (36.5s)
  ✓  21 tests/e2e/13_role_visibility_and_authorization.spec.ts:55:9 › 13 role visibility and authorization › lead overrides › lead can review overrides page but cannot execute admin-only reopen control (2.8s)
  ✓  22 tests/e2e/14_regression_500s_and_console_errors.spec.ts:13:7 › 14 regression 500s and console errors › high-risk routes do not emit pageerror/console.error/requestfailed/5xx (34.4s)
  ✓  23 tests/e2e/15_smoke_clean_new_app_mode.spec.ts:15:7 › 15 smoke clean new app mode › app stays LAB-only and first-project flow remains smooth (9.7s)
  ✓  24 tests/e2e/16_action_visibility_fix.spec.ts:8:7 › 16 action visibility fix › primary worklist drawer exposes full detail and AI Action Center entry points (8.6s)
  ✓  25 tests/e2e/17_recurring_and_masters_capability_fix.spec.ts:6:7 › Recurring Queue and Admin Masters Capabilities › Recurring queue row action visibility (47.4s)
  ✓  26 tests/e2e/17_recurring_and_masters_capability_fix.spec.ts:41:7 › Recurring Queue and Admin Masters Capabilities › Admin masters edit (12.9s)
  ✓  27 tests/e2e/18_simplified_navigation_and_homepage.spec.ts:9:9 › Simplified Navigation and Homepage › admin › Simplified navigation for admin (26.8s)
  ✓  28 tests/e2e/18_simplified_navigation_and_homepage.spec.ts:36:9 › Simplified Navigation and Homepage › admin › Simplified project dashboard (11.2s)
  ✓  29 tests/e2e/18_simplified_navigation_and_homepage.spec.ts:49:9 › Simplified Navigation and Homepage › admin › AI discoverability from worklist (9.7s)
  ✓  30 tests/e2e/18_simplified_navigation_and_homepage.spec.ts:75:9 › Simplified Navigation and Homepage › owner › Simplified navigation for non-admin (4.6s)
  ✓  31 tests/e2e/19_accessibility.spec.ts:17:7 › 19 accessibility and keyboard navigation › TAB through login form and ENTER submits (4.5s)
  ✓  32 tests/e2e/19_accessibility.spec.ts:34:7 › 19 accessibility and keyboard navigation › dashboard exposes skip link and keyboard-reachable main actions (10.2s)
  ✓  33 tests/e2e/19_accessibility.spec.ts:58:7 › 19 accessibility and keyboard navigation › recurring approve modal traps focus, closes with ESC, and submits with ENTER (7.6s)
  ✓  34 tests/e2e/19_accessibility.spec.ts:121:7 › 19 accessibility and keyboard navigation › disabled recurring actions are announced as disabled by role (7.4s)
  ✓  35 tests/e2e/19_accessibility.spec.ts:166:7 › 19 accessibility and keyboard navigation › admin master inputs have labels and edit modal returns focus (3.1s)
  ✓  36 tests/e2e/19_accessibility.spec.ts:186:7 › 19 accessibility and keyboard navigation › classification route has accessible filter labels and row selection (17.5s)
  ✓  37 tests/e2e/20_indicator_classification_workflow.spec.ts:7:7 › Indicator Classification Workflow › admin reviews, edits, approves, and filters saved classifications (4.4s)
  ✓  38 tests/e2e/30_phc_lab_framework_full_workflow.spec.ts:49:9 › 30 PHC LAB framework full workflow › admin-driven full lifecycle › PHC LAB lifecycle works end-to-end (core happy path) (2.0m)
  ✓  39 tests/e2e/30_phc_lab_framework_full_workflow.spec.ts:293:9 › 30 PHC LAB framework full workflow › reviewer/approver role enforcement › reviewer can review evidence but cannot add evidence (39.2s)
  ✓  40 tests/e2e/30_phc_lab_framework_full_workflow.spec.ts:317:9 › 30 PHC LAB framework full workflow › reviewer/approver role enforcement › approver can mark met when readiness allows (9.5s)
  ✓  41 tests/e2e/40_framework_documentation_ai.spec.ts:6:7 › Framework Documentation AI › admin can generate a framework draft and it remains advisory-only (41.8s)
  ✓  42 tests/e2e/admin-import-validation.spec.ts:6:7 › Admin framework validation parity › admin validate sample enforces required inputs and completes with CSV upload (13.3s)
  ✓  43 tests/e2e/admin-import-validation.spec.ts:38:7 › Admin framework validation parity › authenticated navigation stays on proxy origin (7.1s)
  ✓  44 tests/e2e/app-flows.spec.ts:5:7 › AccrediOps end-to-end flows › 1. protected routes redirect unauthenticated users to login (2.2s)
  ✓  45 tests/e2e/app-flows.spec.ts:11:7 › AccrediOps end-to-end flows › 2. login page opens with expected form (2.2s)
  ✓  46 tests/e2e/app-flows.spec.ts:18:7 › AccrediOps end-to-end flows › 3. admin user can login and reach projects page (4.7s)
  ✓  47 tests/e2e/app-flows.spec.ts:24:7 › AccrediOps end-to-end flows › 3b. expired session redirects protected navigation to login (6.0s)
  ✓  48 tests/e2e/app-flows.spec.ts:31:7 › AccrediOps end-to-end flows › 4. create project and initialize from framework flow works (7.4s)
  ✘  49 tests/e2e/app-flows.spec.ts:51:7 › AccrediOps end-to-end flows › 5. post-login operational journey route opens from project home (22.1s)
(node:3280157) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3280157) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  50 tests/e2e/app-flows.spec.ts:51:7 › AccrediOps end-to-end flows › 5. post-login operational journey route opens from project home (retry #1) (7.2s)
  ✓  51 tests/e2e/app-flows.spec.ts:62:7 › AccrediOps end-to-end flows › 6. health endpoints reachable via proxy (89ms)
  ✓  52 tests/e2e/core-journeys.spec.ts:69:7 › Core operational browser journeys › evidence review journey works end-to-end (31.0s)
  ✓  53 tests/e2e/core-journeys.spec.ts:93:7 › Core operational browser journeys › recurring approval from indicator context works (17.6s)
  ✓  54 tests/e2e/core-journeys.spec.ts:115:7 › Core operational browser journeys › create flow supports client profile linkage (20.3s)
  ✓  55 tests/e2e/core-journeys.spec.ts:151:7 › Core operational browser journeys › clone project then open cloned workspace (7.9s)
  ✓  56 tests/e2e/core-journeys.spec.ts:172:7 › Core operational browser journeys › admin route access is available after login (7.2s)
DEBUG: projectId extracted: 224
  ✓  57 tests/e2e/core-journeys.spec.ts:179:7 › Core operational browser journeys › admin override reopens met indicator and audit evidence is visible (43.8s)
  ✓  58 tests/e2e/core-journeys.spec.ts:252:7 › Core operational browser journeys › non-admin user cannot reopen met indicator (18.6s)
  ✓  59 tests/e2e/core-journeys.spec.ts:281:7 › Core operational browser journeys › export lifecycle creates history row with persisted status (20.0s)
  ✓  60 tests/e2e/core-journeys.spec.ts:305:7 › Core operational browser journeys › non-admin user cannot access export history actions (32.3s)
  ✓  61 tests/e2e/core-journeys.spec.ts:324:7 › Core operational browser journeys › combined governance path: create, evidence, recurring, export (24.4s)
  ✓  62 tests/e2e/cta-discoverability.spec.ts:5:7 › CTA discoverability › projects page create CTA is visible in header and sticky action panel (8.1s)
  ✓  63 tests/e2e/cta-discoverability.spec.ts:12:7 › CTA discoverability › owner sees disabled create CTA with role rationale (4.4s)
  ✓  64 tests/e2e/cta-discoverability.spec.ts:18:7 › CTA discoverability › print pack and export CTA entry points are visible from project home (17.5s)
  ✓  65 tests/e2e/cta-visibility.spec.ts:9:9 › CTA visibility › admin › project create and admin actions are visible (3.6s)
  ✓  66 tests/e2e/cta-visibility.spec.ts:20:9 › CTA visibility › owner › restricted CTAs remain visible with clear disabled state (3.6s)
  ✓  67 tests/e2e/export-guard.spec.ts:8:7 › export guard › backend and UI both block unready exports (5.9s)
  ✓  68 tests/e2e/negative-flows.spec.ts:8:7 › Negative flows › restricted and empty-state flows always provide operator guidance (15.1s)
  ✘  69 tests/e2e/next-action-consistency.spec.ts:8:7 › next action consistency › target screens all show action, reason, and status guidance (1.1m)
(node:3288690) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3288690) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✘  70 tests/e2e/next-action-consistency.spec.ts:8:7 › next action consistency › target screens all show action, reason, and status guidance (retry #1) (38.5s)
(node:3289898) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3289898) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✘  71 tests/e2e/operator-first-time.spec.ts:8:7 › operator first time › first-time operator journey stays explicit across create, evidence, review, and approval (38.2s)
(node:3290837) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3290837) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✘  72 tests/e2e/operator-first-time.spec.ts:8:7 › operator first time › first-time operator journey stays explicit across create, evidence, review, and approval (retry #1) (11.5s)
(node:3291160) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3291160) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  73 tests/e2e/permission-enforcement.spec.ts:9:9 › permission enforcement › owner › restricted admin and export endpoints return 403 (3.5s)
  ✓  74 tests/e2e/role-based-access.spec.ts:9:9 › Role based access › admin and lead › admin can open admin dashboard (7.2s)
  ✘  75 tests/e2e/role-based-access.spec.ts:18:9 › Role based access › owner › owner sees restricted messaging for admin and readiness (8.3s)
(node:3291807) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3291807) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  76 tests/e2e/role-based-access.spec.ts:18:9 › Role based access › owner › owner sees restricted messaging for admin and readiness (retry #1) (13.1s)
  ✓  77 tests/e2e/role-visibility.spec.ts:5:7 › Role visibility and gating › owner sees disabled create project CTA with explanation (5.5s)
  ✓  78 tests/e2e/role-visibility.spec.ts:12:7 › Role visibility and gating › lead sees admin navigation section (4.2s)
  ✓  79 tests/e2e/role-visibility.spec.ts:19:7 › Role visibility and gating › owner sees disabled readiness/export CTAs and guarded routes (14.4s)
  ✓  80 tests/e2e/ui-clarity.spec.ts:7:7 › UI clarity › projects page exposes prominent create CTA and guidance (4.7s)
  ✓  81 tests/e2e/ui-clarity.spec.ts:16:7 › UI clarity › indicator follows ordered workflow sections (4.3s)
  ✓  82 tests/e2e/workflow-completion.spec.ts:8:7 › Workflow completion surfaces › operator can traverse core workflow screens with explicit next action guidance (11.4s)
  ✓  83 tests/e2e/workflow-guidance.spec.ts:5:7 › Workflow guidance › project overview shows next-step guidance and grouped pathways (7.5s)
  ✓  84 tests/e2e/workflow-guidance.spec.ts:17:7 › Workflow guidance › worklist and recurring screens provide action guidance (19.8s)


  1) tests/e2e/next-action-consistency.spec.ts:8:7 › next action consistency › target screens all show action, reason, and status guidance 

    [31mTest timeout of 60000ms exceeded.[39m

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByTestId('next-action-banner').getByText('Action', { exact: true })
    Expected: visible
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 5000ms[22m
    [2m  - waiting for getByTestId('next-action-banner').getByText('Action', { exact: true })[22m


      22 |       await page.goto(url);
      23 |       const nextAction = page.getByTestId("next-action-banner");
    > 24 |       await expect(nextAction.getByText("Action", { exact: true })).toBeVisible();
         |                                                                     ^
      25 |       await expect(nextAction.getByText("Reason", { exact: true })).toBeVisible();
      26 |       await expect(nextAction.getByText("Status", { exact: true })).toBeVisible();
      27 |     }
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/next-action-consistency.spec.ts:24:69

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByTestId('next-action-banner').getByText('Action', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 5000ms[22m
    [2m  - waiting for getByTestId('next-action-banner').getByText('Action', { exact: true })[22m
    [2m    - waiting for" http://127.0.0.1:18080/login?next=%2Fproject-indicators%2F903" navigation to finish...[22m
    [2m    - navigated to "http://127.0.0.1:18080/login?next=%2Fproject-indicators%2F903"[22m


      22 |       await page.goto(url);
      23 |       const nextAction = page.getByTestId("next-action-banner");
    > 24 |       await expect(nextAction.getByText("Action", { exact: true })).toBeVisible();
         |                                                                     ^
      25 |       await expect(nextAction.getByText("Reason", { exact: true })).toBeVisible();
      26 |       await expect(nextAction.getByText("Status", { exact: true })).toBeVisible();
      27 |     }
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/next-action-consistency.spec.ts:24:69

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance-retry1/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/next-action-consistency-ne-fec9b--reason-and-status-guidance-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2) tests/e2e/operator-first-time.spec.ts:8:7 › operator first time › first-time operator journey stays explicit across create, evidence, review, and approval 

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByTestId('next-action-banner').getByText('Action', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 5000ms[22m
    [2m  - waiting for getByTestId('next-action-banner').getByText('Action', { exact: true })[22m
    [2m    - waiting for" http://127.0.0.1:18080/login?next=%2Fproject-indicators%2F907" navigation to finish...[22m
    [2m    - navigated to "http://127.0.0.1:18080/login?next=%2Fproject-indicators%2F907"[22m


      73 |     await loginAs(page, "reviewer");
      74 |     await page.goto(`/project-indicators/${indicatorId}`);
    > 75 |     await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();
         |                                                                                               ^
      76 |     for (const evidence of [firstEvidence, secondEvidence]) {
      77 |       await postApi(
      78 |         page,
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/operator-first-time.spec.ts:75:95

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByTestId('next-action-banner').getByText('Action', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 5000ms[22m
    [2m  - waiting for getByTestId('next-action-banner').getByText('Action', { exact: true })[22m
    [2m    - waiting for navigation to finish...[22m
    [2m    - navigated to "http://127.0.0.1:18080/login?next=%2Fprojects%2F231"[22m
    [2m    - waiting for" http://127.0.0.1:18080/login?next=%2Fprojects%2F231" navigation to finish...[22m
    [2m    - navigated to "http://127.0.0.1:18080/login?next=%2Fprojects%2F231"[22m


      28 |
      29 |     await page.goto(`/projects/${project.id}`);
    > 30 |     await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();
         |                                                                                               ^
      31 |     await expect(page.getByRole("link", { name: /Open worklist/i }).first()).toBeVisible();
      32 |
      33 |     await page.context().clearCookies();
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/operator-first-time.spec.ts:30:95

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval-retry1/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/operator-first-time-operat-b7d88-vidence-review-and-approval-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  3) tests/e2e/app-flows.spec.ts:51:7 › AccrediOps end-to-end flows › 5. post-login operational journey route opens from project home 

    Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed

    Expected pattern: [32m/\/projects\/\d+\/recurring/[39m
    Received string:  [31m"http://127.0.0.1:18080/projects/222"[39m
    Timeout: 15000ms

    Call log:
    [2m  - Expect "toHaveURL" with timeout 15000ms[22m
    [2m    18 × unexpected value "http://127.0.0.1:18080/projects/222"[22m


      56 |     await expect(recurringLink).toBeVisible({ timeout: 10000 });
      57 |     await recurringLink.click();
    > 58 |     await expect(page).toHaveURL(/\/projects\/\d+\/recurring/, { timeout: 15000 });
         |                        ^
      59 |     await expect(page.getByRole("heading", { name: "Recurring evidence queue" })).toBeVisible();
      60 |   });
      61 |
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/app-flows.spec.ts:58:24

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/app-flows-AccrediOps-end-t-ea716-ute-opens-from-project-home/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/app-flows-AccrediOps-end-t-ea716-ute-opens-from-project-home/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/app-flows-AccrediOps-end-t-ea716-ute-opens-from-project-home/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/app-flows-AccrediOps-end-t-ea716-ute-opens-from-project-home/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/app-flows-AccrediOps-end-t-ea716-ute-opens-from-project-home/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  4) tests/e2e/role-based-access.spec.ts:18:9 › Role based access › owner › owner sees restricted messaging for admin and readiness 

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByText('Admin access restricted')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 5000ms[22m
    [2m  - waiting for getByText('Admin access restricted')[22m
    [2m    - waiting for" http://127.0.0.1:18080/login?next=%2Fadmin" navigation to finish...[22m
    [2m    - navigated to "http://127.0.0.1:18080/login?next=%2Fadmin"[22m


      18 |     test("owner sees restricted messaging for admin and readiness", async ({ page }) => {
      19 |       await page.goto("/admin");
    > 20 |       await expect(page.getByText("Admin access restricted")).toBeVisible();
         |                                                               ^
      21 |       await expect(page.getByText("Only ADMIN or LEAD can access the admin area.").first()).toBeVisible();
      22 |
      23 |       const projectResponse = await page.request.get("/api/projects/?page_size=1");
        at /home/munaim/srv/apps/accrediops/frontend/tests/e2e/role-based-access.spec.ts:20:63

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../OUT/playwright/role-based-access-Role-bas-93389-ing-for-admin-and-readiness/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../OUT/playwright/role-based-access-Role-bas-93389-ing-for-admin-and-readiness/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../OUT/playwright/role-based-access-Role-bas-93389-ing-for-admin-and-readiness/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    ../OUT/playwright/role-based-access-Role-bas-93389-ing-for-admin-and-readiness/trace.zip
    Usage:

        npx playwright show-trace ../OUT/playwright/role-based-access-Role-bas-93389-ing-for-admin-and-readiness/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2 failed
    tests/e2e/next-action-consistency.spec.ts:8:7 › next action consistency › target screens all show action, reason, and status guidance 
    tests/e2e/operator-first-time.spec.ts:8:7 › operator first time › first-time operator journey stays explicit across create, evidence, review, and approval 
  2 flaky
    tests/e2e/app-flows.spec.ts:51:7 › AccrediOps end-to-end flows › 5. post-login operational journey route opens from project home 
    tests/e2e/role-based-access.spec.ts:18:9 › Role based access › owner › owner sees restricted messaging for admin and readiness 
 76 passed (22.4m)

## 2026-05-16T22:20:00Z

Verification rerun after CAPA workspace implementation:

- `python3 backend/manage.py check`: pass
- `python3 backend/manage.py makemigrations --check --dry-run`: pass
- `pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api`: pass
- `cd frontend && npm run lint`: pass with pre-existing warnings only
- `cd frontend && npm run typecheck`: pass
- `cd frontend && npm run build`: pass
- `cd frontend && npm test`: pass, `54/54`
- `cd frontend && npx playwright test --workers=1`: pass, `79 passed`, with one flaky retry that passed on rerun

## 2026-05-16T22:30:00Z

Backend post-change verification rerun:

- `pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api`: pass, `125 passed`
