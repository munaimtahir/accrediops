export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type IndicatorStatus = "NOT_STARTED" | "IN_PROGRESS" | "UNDER_REVIEW" | "MET" | "BLOCKED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RecurrenceFrequency = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurrenceMode = "DIGITAL" | "UPLOAD" | "EITHER";
export type EvidenceSourceType = "UPLOAD" | "URL" | "TEXT_NOTE" | "GENERATED" | "EXTERNAL_REF";
export type EvidenceValidityStatus = "UNKNOWN" | "VALID" | "INVALID";
export type EvidenceCompletenessStatus = "UNKNOWN" | "COMPLETE" | "INCOMPLETE";
export type EvidenceApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RecurringInstanceStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "MISSED";
export type AIOutputType = "GUIDANCE" | "DRAFT" | "ASSESSMENT";
export type UserRole = "ADMIN" | "LEAD" | "OWNER" | "REVIEWER" | "APPROVER";
export type EvidenceReusePolicy = "NONE" | "MANUAL_REVIEW" | "AUTO_ALLOWED";
export type PhysicalLocationType = "BINDER" | "CABINET" | "ROOM" | "OTHER" | "";
export type EvidenceType =
  | "DOCUMENT_POLICY"
  | "RECORD_REGISTER"
  | "PHYSICAL_FACILITY"
  | "LICENSE_CERTIFICATE"
  | "STAFF_TRAINING"
  | "PROCESS_WORKFLOW"
  | "AUDIT_QUALITY"
  | "MIXED_EVIDENCE"
  | "MANUAL_REVIEW";
export type AIAssistanceLevel = "FULL_AI" | "PARTIAL_AI" | "NO_AI" | "";
export type EvidenceFrequency = "ONE_TIME" | "RECURRING" | "EVENT_BASED" | "";
export type PrimaryActionRequired =
  | "GENERATE_DOCUMENT"
  | "COLLECT_RECORD"
  | "UPLOAD_PHOTO"
  | "ARRANGE_PHYSICAL_COMPLIANCE"
  | "OBTAIN_CERTIFICATE"
  | "TRAIN_STAFF"
  | "MAINTAIN_LOG"
  | "REVIEW_EXISTING_EVIDENCE"
  | "MANUAL_DECISION"
  | "";
export type ClassificationReviewStatus =
  | "UNCLASSIFIED"
  | "AI_SUGGESTED"
  | "HUMAN_REVIEWED"
  | "MANUALLY_CHANGED"
  | "NEEDS_REVIEW";
export type ClassificationConfidence = "HIGH" | "MEDIUM" | "LOW" | "";

export interface UserSummary {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface ProjectSummary {
  id: number;
  name: string;
  client_name: string;
}

export interface Project extends ProjectSummary {
  total_indicators: number;
  met_indicators: number;
  pending_indicators: number;
  recurring_due_today: number;
  overdue_recurring_items: number;
}

export interface Project extends ProjectSummary {
  id: number;
  name: string;
  client_name: string;
  accrediting_body_name: string;
  framework: number;
  client_profile: number | null;
  status: ProjectStatus;
  start_date: string;
  target_date: string;
  notes: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface IndicatorMaster {
  id: number;
  framework: number;
  area: number;
  standard: number;
  code: string;
  text: string;
  required_evidence_description: string;
  evidence_type: EvidenceType;
  ai_assistance_level: AIAssistanceLevel;
  evidence_frequency: EvidenceFrequency;
  primary_action_required: PrimaryActionRequired;
  classification_confidence: ClassificationConfidence;
  classification_reason: string;
  classification_review_status: ClassificationReviewStatus;
  classified_by_ai_at: string | null;
  classification_reviewed_by: number | null;
  classification_reviewed_at: string | null;
  classification_version: number;
  document_type: string;
  fulfillment_guidance: string;
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency;
  recurrence_mode: RecurrenceMode;
  minimum_required_evidence_count: number;
  reusable_template_allowed: boolean;
  evidence_reuse_policy: EvidenceReusePolicy;
  is_active: boolean;
  sort_order: number;
}

export interface EvidenceItem {
  id: number;
  project_indicator: number;
  title: string;
  description: string;
  source_type: EvidenceSourceType;
  file_or_url: string;
  text_content: string;
  version_no: number;
  is_current: boolean;
  evidence_date: string | null;
  uploaded_by: number | null;
  uploaded_at: string;
  notes: string;
  validity_status: EvidenceValidityStatus;
  completeness_status: EvidenceCompletenessStatus;
  approval_status: EvidenceApprovalStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string;
  physical_location_type: PhysicalLocationType;
  location_details: string;
  file_label: string;
  is_physical_copy_available: boolean;
}

export interface RecurringRequirement {
  id: number;
  frequency: RecurrenceFrequency;
  mode: RecurrenceMode;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  instructions: string;
  expected_title_template: string;
}

export interface RecurringInstance {
  id: number;
  project_indicator_id: number;
  project_id: number;
  project_name: string;
  indicator_id: number;
  indicator_code: string;
  indicator_text: string;
  due_date: string;
  period_label: string;
  status: RecurringInstanceStatus;
  linked_evidence_item: number | null;
  linked_evidence_title: string;
  submitted_at: string | null;
  approved_at: string | null;
  notes: string;
  capabilities?: {
    can_submit: boolean;
    can_approve: boolean;
  };
}

export interface AIOutput {
  id: number;
  project_indicator: number;
  output_type: AIOutputType;
  prompt_context_snapshot: Record<string, unknown>;
  content: string;
  model_name: string;
  created_by: number | null;
  created_at: string;
  accepted: boolean;
  accepted_at: string | null;
  accepted_by: number | null;
}

export interface AuditEvent {
  id: number;
  actor: UserSummary | null;
  event_type: string;
  object_type: string;
  object_id: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  reason: string;
  timestamp: string;
}

export interface CommentItem {
  id: number;
  type: "WORKING" | "REVIEW" | "APPROVAL";
  text: string;
  created_by: UserSummary | null;
  created_at: string;
}

export interface StatusHistoryItem {
  id: number;
  from_status: IndicatorStatus;
  to_status: IndicatorStatus;
  action: string;
  reason: string;
  actor: UserSummary | null;
  timestamp: string;
}

export interface ProjectIndicator {
  id: number;
  project: number;
  indicator: IndicatorMaster;
  current_status: IndicatorStatus;
  is_finalized: boolean;
  is_met: boolean;
  owner: UserSummary | null;
  reviewer: UserSummary | null;
  approver: UserSummary | null;
  priority: Priority;
  due_date: string | null;
  notes: string;
  last_updated_by: number | null;
  last_updated_at: string;
}

export interface IndicatorReadinessFlags {
  approved_evidence_count: number;
  total_current_evidence_count: number;
  rejected_current_evidence_count: number;
  minimum_required_evidence_count: number;
  has_minimum_required_evidence: boolean;
  all_current_evidence_approved: boolean;
  no_rejected_current_evidence: boolean;
  overdue_recurring_instances_count: number;
  overdue_recurring_count: number;
  recurring_requirements_clear: boolean;
  is_ready_for_review: boolean;
  is_blocked: boolean;
  missing_evidence_count: number;
  rejected_evidence_count: number;
  ready_for_met: boolean;
  risk: {
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    rejected_evidence_count: number;
    overdue_recurring_count: number;
    incomplete_evidence_count: number;
    no_evidence_near_due: boolean;
    in_review_long_time: boolean;
  };
}

export interface ProjectIndicatorCapabilities {
  can_assign: boolean;
  can_update_working_state: boolean;
  can_start: boolean;
  can_send_for_review: boolean;
  can_mark_met: boolean;
  can_reopen: boolean;
  can_add_evidence: boolean;
  can_edit_evidence: boolean;
  can_review_evidence: boolean;
  can_submit_recurring: boolean;
  can_approve_recurring: boolean;
  can_generate_ai: boolean;
  can_accept_ai: boolean;
}

export interface ProjectIndicatorDetail extends ProjectIndicator {
  capabilities: ProjectIndicatorCapabilities;
  evidence_items: EvidenceItem[];
  recurring_requirement: RecurringRequirement | null;
  recurring_instances: RecurringInstance[];
  comments: CommentItem[];
  status_history: StatusHistoryItem[];
  ai_outputs: AIOutput[];
  audit_summary: AuditEvent[];
  readiness_flags: IndicatorReadinessFlags;
}

export interface DashboardRow {
  project_indicator_id: number;
  project_id: number;
  project_name: string;
  area_id: number;
  area_name: string;
  standard_id: number;
  standard_name: string;
  indicator_id: number;
  indicator_code: string;
  indicator_text: string;
  current_status: IndicatorStatus;
  is_met: boolean;
  priority: Priority;
  owner: UserSummary | null;
  due_date: string | null;
  notes: string;
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency;
  evidence_type: EvidenceType;
  ai_assistance_level: AIAssistanceLevel;
  evidence_frequency: EvidenceFrequency;
  primary_action_required: PrimaryActionRequired;
  classification_confidence: ClassificationConfidence;
  classification_review_status: ClassificationReviewStatus;
  approved_evidence_count: number;
  total_evidence_count: number;
  pending_recurring_instances_count: number;
  overdue_recurring_instances_count: number;
  risk?: {
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    rejected_evidence_count: number;
    overdue_recurring_count: number;
    incomplete_evidence_count: number;
    no_evidence_near_due: boolean;
    in_review_long_time: boolean;
  };
  last_updated_at: string;
}

export interface IndicatorClassification extends IndicatorMaster {
  area_id: number;
  area_code: string;
  area_name: string;
  standard_id: number;
  standard_code: string;
  standard_name: string;
  classification_reviewed_by_username: string;
}

export interface ClassificationSummary {
  total: number;
  unclassified: number;
  ai_suggested: number;
  needs_review: number;
  human_reviewed: number;
  full_ai: number;
  recurring: number;
  physical_no_ai: number;
}

export interface FrameworkClassificationPayload {
  framework: FrameworkSummary;
  summary: ClassificationSummary;
  results: IndicatorClassification[];
}

export interface ClassificationRunResult {
  total_requested: number;
  classified_count: number;
  skipped_count: number;
  failed_count: number;
  needs_review_count: number;
  errors: Array<Record<string, unknown>>;
}

export interface StandardProgress {
  area_id: number;
  area_code: string;
  area_name: string;
  standard_id: number;
  standard_code: string;
  standard_name: string;
  total_indicators: number;
  met_indicators: number;
  blocked_count: number;
  blocked_indicators: number;
  in_review_count: number;
  not_started_count: number;
  overdue_count: number;
  readiness_score: number;
  progress_percent: number;
}

export interface AreaProgress {
  area_id: number;
  area_code: string;
  area_name: string;
  total_standards: number;
  completed_standards: number;
  high_risk_standards_count: number;
  readiness_score: number;
  progress_percent: number;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details: unknown;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorPayload;
}

export interface AuthSession {
  authenticated: boolean;
  user: UserSummary | null;
}

export interface WorklistFilters {
  project_id?: number;
  area_id?: number;
  standard_id?: number;
  status?: IndicatorStatus;
  priority?: Priority;
  owner_id?: number;
  recurring?: boolean;
  due_today?: boolean;
  overdue?: boolean;
  search?: string;
  page?: number;
  page_size?: number | "all";
}

export interface RecurringQueueFilters {
  project_id?: number;
  frequency?: RecurrenceFrequency;
  owner_id?: number;
  due_today?: boolean;
  overdue?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
}

export interface AssignIndicatorPayload {
  owner_id?: number | null;
  reviewer_id?: number | null;
  approver_id?: number | null;
  priority?: Priority;
  due_date?: string | null;
  notes?: string;
}

export interface EvidencePayload {
  project_indicator_id: number;
  title: string;
  description?: string;
  source_type: EvidenceSourceType;
  file_or_url?: string;
  text_content?: string;
  evidence_date?: string | null;
  notes?: string;
  physical_location_type?: PhysicalLocationType;
  location_details?: string;
  file_label?: string;
  is_physical_copy_available?: boolean;
}

export interface EvidenceReviewPayload {
  validity_status: EvidenceValidityStatus;
  completeness_status: EvidenceCompletenessStatus;
  approval_status: EvidenceApprovalStatus;
  review_notes?: string;
}

export interface WorkingStatePayload {
  notes: string;
  due_date?: string | null;
  priority?: Priority;
}

export interface WorkflowReasonPayload {
  reason?: string;
}

export interface ReopenPayload {
  reason: string;
}

export interface SubmitRecurringPayload {
  evidence_item_id?: number | null;
  text_content?: string;
  notes?: string;
}

export interface ApproveRecurringPayload {
  approval_status: "APPROVED" | "REJECTED";
  notes?: string;
}

export interface GenerateAIPayload {
  project_indicator_id: number;
  output_type: AIOutputType;
  user_instruction?: string;
}

export interface ExportResponse {
  format: string;
  project_id: number;
  status: string;
  message: string;
  warnings?: string[];
  sections?: PrintPackSection[];
  bundle?: { sections: PrintPackSection[] };
  items?: {
    area: string;
    standard: string;
    indicator_code: string;
    evidence_title: string;
    binder_or_location: string;
    location_details: string;
    file_label: string;
  }[];
}

export interface CloneProjectPayload {
  name: string;
  client_name: string;
}

export interface CreateProjectPayload {
  name: string;
  client_name: string;
  accrediting_body_name: string;
  framework: number;
  start_date: string;
  target_date: string;
  notes?: string;
  status?: ProjectStatus;
  client_profile?: number | null;
}

export interface UpdateProjectPayload {
  name?: string;
  client_name?: string;
  accrediting_body_name?: string;
  framework?: number;
  start_date?: string;
  target_date?: string;
  notes?: string;
  status?: ProjectStatus;
  client_profile?: number | null;
}

export interface InitializeProjectPayload {
  create_initial_instances?: boolean;
}

export interface InitializeProjectResponse {
  created_project_indicators: number;
  recurring_requirements_processed: number;
}

export interface ClientProfile {
  id: number;
  organization_name: string;
  address: string;
  license_number: string;
  registration_number: string;
  contact_person: string;
  department_names: string[];
  linked_users: UserSummary[];
  linked_user_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface FrameworkSummary {
  id: number;
  name: string;
  description: string;
}

export interface FrameworkTemplatePayload {
  version: string;
  columns: string[];
  required_columns: string[];
  sample_rows: Record<string, unknown>[];
  template_csv: string;
}

export interface FrameworkExportPayload {
  framework: FrameworkSummary;
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  export_csv: string;
}

export interface FrameworkImportValidatePayload {
  framework_id: number;
  file: File;
}

export interface FrameworkImportValidateResult {
  framework_id: number;
  file_name: string;
  rows_processed: number;
  normalized_rows: number;
  missing_headers: string[];
  missing_required_values: number;
  duplicate_warnings: Record<string, unknown>[];
  errors: Record<string, unknown>[];
  log_id: number;
}

export interface FrameworkImportCreatePayload {
  framework_id: number;
  file: File;
}

export interface FrameworkImportCreateResult {
  framework_id: number;
  file_name: string;
  framework_name: string;
  areas_count: number;
  standards_count: number;
  indicators_count: number;
  rows_processed: number;
  errors: Record<string, unknown>[];
}

export interface BulkClassificationReviewPayload {
  mode?: "selected" | "ai_suggested" | "filtered";
  indicator_ids?: number[];
  action: "approve" | "set_needs_review";
  updates?: object;
  filters?: Record<string, unknown>;
}

export interface DocumentDraft {
  id: number;
  framework: number;
  indicator: number;
  project: number | null;
  project_indicator: number | null;
  title: string;
  document_type: string;
  draft_content: string;
  prompt_snapshot: Record<string, unknown>;
  source: string;
  provider: string;
  model: string;
  ai_usage_log: number | null;
  version: number;
  parent_draft: number | null;
  review_status: "DRAFT" | "HUMAN_REVIEW_REQUIRED" | "HUMAN_REVIEWED" | "PROMOTED_TO_EVIDENCE" | "ARCHIVED";
  is_advisory: boolean;
  generated_by: number | null;
  generated_at: string;
  last_edited_by: number | null;
  last_edited_at: string | null;
  promoted_by: number | null;
  promoted_at: string | null;
  promoted_evidence: number | null;
  framework_name: string;
  indicator_code: string;
  project_name: string | null;
  project_indicator_id: number | null; // This is a number in the serializer, but was object before
  generated_by_username: string;
  last_edited_by_username: string | null;
}

export interface VariablesPreviewPayload {
  text: string;
}

export interface VariablesPreviewResponse {
  text: string;
  replaced_text: string;
}

export interface PrintPackSection {
  name: string;
  standards: {
    name: string;
    indicators: {
      project_indicator_id: number;
      indicator_code: string;
      indicator_text: string;
      status: IndicatorStatus;
      notes: string;
      reusable_template_allowed: boolean;
      evidence_reuse_policy: EvidenceReusePolicy;
      evidence_list: {
        id: number;
        title: string;
        approval_status: EvidenceApprovalStatus;
        source_type: EvidenceSourceType;
        order: number;
        notes: string;
        physical_location_type: PhysicalLocationType;
        location_details: string;
        file_label: string;
        is_physical_copy_available: boolean;
      }[];
    }[];
  }[];
}
