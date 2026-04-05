"use client";

import { FormEvent, useState } from "react";

import { Modal } from "@/components/common/modal";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";

export function IndicatorActionDialog({
  open,
  title,
  description,
  reasonRequired = false,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  reasonRequired?: boolean;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const { pushToast } = useToast();
  const [reason, setReason] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onConfirm(reason);
      pushToast(`${confirmLabel} completed.`, "success");
      setReason("");
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">
            {reasonRequired ? "Reason" : "Reason or operator note"}
          </span>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required={reasonRequired}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
