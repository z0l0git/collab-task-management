"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, Field, fieldIds, type FieldProps } from "./Field";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldProps;

export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const { hintId, errorId } = fieldIds(textareaId);

  return (
    <Field
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(controlClasses(Boolean(error)), "resize-y")}
        {...props}
      />
    </Field>
  );
}
