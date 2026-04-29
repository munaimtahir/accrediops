import { FrameworkImportCreatePayload, FrameworkImportValidatePayload } from "@/types";

export function buildFrameworkImportFormData(payload: FrameworkImportValidatePayload | FrameworkImportCreatePayload) {
  const formData = new FormData();
  formData.append("framework_id", String(payload.framework_id));
  formData.append("file", payload.file);
  return formData;
}
