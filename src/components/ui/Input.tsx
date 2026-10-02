"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, Field, fieldIds, type FieldProps } from "./Field";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  FieldProps;

export const Input = ({
  label,
  hint,
  error,
  required,
  className,
  id,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { hintId, errorId } = fieldIds(inputId);

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(controlClasses(Boolean(error)), "h-9")}
        {...props}
      />
    </Field>
  );
};
