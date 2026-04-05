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

export interface UserSummary {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface ProjectSummary {
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
  evidence_type: string;
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

export interface ProjectIndicatorDetail extends ProjectIndicator {
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
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency;
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
  page_size?: number;
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
  created_at: string;
  updated_at: string;
}

export interface FrameworkSummary {
  id: number;
  name: string;
  description: string;
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
