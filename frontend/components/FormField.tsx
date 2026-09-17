"use client";

import { InputHTMLAttributes, useId } from "react";

export interface FormFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  /** The visible label bound to the input. */
  label: string;
  /** Optional validation error message shown below the input. */
  error?: string;
  /** Optional helper text shown when there is no error. */
  hint?: string;
}

/**
 * Labelled form input primitive.
 *
 * Binds the label to the input id, marks required fields, and wires
 * `aria-invalid` / `aria-describedby` to a `role="alert"` error message.
 */
export function FormField({
  label,
  error,
  hint,
  required,
  id,
  ...props
}: FormFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-primary-500">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={error ? "border-error focus:ring-error/40" : ""}
        {...props}
      />
      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-sm text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
