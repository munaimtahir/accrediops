# Root Cause Analysis - Final ZIP Export 500 Error

## 1. KeyError in `build_final_zip_export`
The `build_final_zip_export` function in `backend/apps/exports/services.py` attempts to access `evidence["file_or_url"]`:

```python
# backend/apps/exports/services.py:516
if evidence["source_type"] == "UPLOAD" and evidence["file_or_url"]:
```

However, the `evidence` dictionary is built in `build_print_bundle` and is missing the `file_or_url` key:

```python
# backend/apps/exports/services.py:108
        evidence_list = []
        for idx, evidence in enumerate(evidence_qs, start=1):
            override = overrides.get(evidence.id)
            evidence_list.append(
                {
                    "id": evidence.id,
                    "title": evidence.title,
                    "approval_status": evidence.approval_status,
                    "source_type": evidence.source_type,
                    "order": override.order if override else idx,
                    "notes": override.notes if override else "",
                    "physical_location_type": evidence.physical_location_type,
                    "location_details": evidence.location_details,
                    "file_label": evidence.file_label,
                    "is_physical_copy_available": evidence.is_physical_copy_available,
                    "reviewed_by": evidence.reviewed_by.get_full_name() if evidence.reviewed_by else None,
                    "reviewed_at": evidence.reviewed_at.isoformat() if evidence.reviewed_at else None,
                }
            )
```

## 2. NameError/ImportError in `ProjectFinalZipExportView`
When an exception occurs in `build_final_zip_export`, the `ProjectFinalZipExportView` in `backend/apps/api/views/exports.py` tries to handle it:

```python
# backend/apps/api/views/exports.py:153
        except PermissionDenied as e:
            return Response({"success": False, "error": {"code": "EXPORT_BLOCKED", "message": str(e)}}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"success": False, "error": {"code": "SERVER_ERROR", "message": str(e)}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

However, `Response`, `status`, and `PermissionDenied` are not imported in `backend/apps/api/views/exports.py`, leading to a secondary crash.

## 3. Potential Template issues
While templates exist, any missing or incorrectly named variable in the template context could also trigger a 500 error if not handled gracefully.

## Summary
The primary cause is a `KeyError` due to inconsistent data structures between `build_print_bundle` and `build_final_zip_export`, exacerbated by broken error handling in the API view.
