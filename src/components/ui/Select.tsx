"use client";

import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { controlClasses, Field, fieldIds, type FieldProps } from "./Field";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> &
  FieldProps & {
    options: ReadonlyArray<SelectOption<T>>;
    placeholder?: string;
  };

export function Select<T extends string = string>({
  label,
  hint,
  error,
  required,
  className,
  id,
  options,
  placeholder,
  ...props
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { hintId, errorId } = fieldIds(selectId);

  return (
    <Field
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            controlClasses(Boolean(error)),
            "h-9 appearance-none pr-9",
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-ink-subtle pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        />
      </div>
    </Field>
  );
}
