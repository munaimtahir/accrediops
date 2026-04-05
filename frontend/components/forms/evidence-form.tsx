"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import {
  EvidenceItem,
  EvidencePayload,
  EvidenceSourceType,
  PhysicalLocationType,
} from "@/types";

interface EvidenceFormProps {
  indicatorId: number;
  initialValue?: EvidenceItem;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (payload: EvidencePayload | Partial<EvidencePayload>) => Promise<unknown>;
  onSuccess?: () => void;
}

const sourceOptions: EvidenceSourceType[] = ["UPLOAD", "URL", "TEXT_NOTE", "GENERATED", "EXTERNAL_REF"];
const physicalLocationOptions: PhysicalLocationType[] = ["", "BINDER", "CABINET", "ROOM", "OTHER"];

export function EvidenceForm({
  indicatorId,
  initialValue,
  submitLabel,
  loading,
  onSubmit,
  onSuccess,
}: EvidenceFormProps) {
  const { pushToast } = useToast();
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [sourceType, setSourceType] = useState<EvidenceSourceType>(initialValue?.source_type ?? "UPLOAD");
  const [fileOrUrl, setFileOrUrl] = useState(initialValue?.file_or_url ?? "");
  const [textContent, setTextContent] = useState(initialValue?.text_content ?? "");
  const [evidenceDate, setEvidenceDate] = useState(initialValue?.evidence_date ?? "");
  const [notes, setNotes] = useState(initialValue?.notes ?? "");
  const [physicalLocationType, setPhysicalLocationType] = useState<PhysicalLocationType>(
    initialValue?.physical_location_type ?? "",
  );
  const [locationDetails, setLocationDetails] = useState(initialValue?.location_details ?? "");
  const [fileLabel, setFileLabel] = useState(initialValue?.file_label ?? "");
  const [isPhysicalCopyAvailable, setIsPhysicalCopyAvailable] = useState(initialValue?.is_physical_copy_available ?? false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: EvidencePayload = {
      project_indicator_id: indicatorId,
      title,
      description,
      source_type: sourceType,
      file_or_url: fileOrUrl,
      text_content: textContent,
      evidence_date: evidenceDate || null,
      notes,
      physical_location_type: physicalLocationType,
      location_details: locationDetails,
      file_label: fileLabel,
      is_physical_copy_available: isPhysicalCopyAvailable,
    };

    try {
      await onSubmit(initialValue ? { ...payload, project_indicator_id: undefined } : payload);
      pushToast(initialValue ? "Evidence updated." : "Evidence added.", "success");
      onSuccess?.();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Title</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Source type</span>
          <Select value={sourceType} onChange={(event) => setSourceType(event.target.value as EvidenceSourceType)}>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Description</span>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">File or URL</span>
          <Input
            value={fileOrUrl}
            onChange={(event) => setFileOrUrl(event.target.value)}
            placeholder="File path, URL, or external reference"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Evidence date</span>
          <Input type="date" value={evidenceDate} onChange={(event) => setEvidenceDate(event.target.value)} />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Text evidence</span>
        <Textarea
          value={textContent}
          onChange={(event) => setTextContent(event.target.value)}
          placeholder="Use for text note or generated evidence content."
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Notes</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Physical location type</span>
          <Select
            value={physicalLocationType}
            onChange={(event) => setPhysicalLocationType(event.target.value as PhysicalLocationType)}
          >
            {physicalLocationOptions.map((option) => (
              <option key={option || "NONE"} value={option}>
                {option || "Not specified"}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">File label</span>
          <Input value={fileLabel} onChange={(event) => setFileLabel(event.target.value)} />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Location details</span>
        <Textarea
          value={locationDetails}
          onChange={(event) => setLocationDetails(event.target.value)}
          placeholder="Cabinet number, room details, binder section, etc."
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isPhysicalCopyAvailable}
          onChange={(event) => setIsPhysicalCopyAvailable(event.target.checked)}
        />
        Physical copy available
      </label>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
