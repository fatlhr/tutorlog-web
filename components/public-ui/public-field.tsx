import type { InputHTMLAttributes } from "react";
import { getFieldDescription } from "@/components/ui/field-contract";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "id"
  | "className"
  | "style"
  | "required"
  | "aria-describedby"
  | "aria-invalid"
>;

export interface PublicFieldProps extends NativeInputProps {
  controlId: string;
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  externalDescribedBy?: string;
}

export function PublicField({
  controlId,
  label,
  required = false,
  helper,
  error,
  externalDescribedBy,
  ...inputProps
}: PublicFieldProps) {
  const description = getFieldDescription(
    controlId,
    helper,
    error,
    externalDescribedBy,
  );

  return (
    <>
      <label htmlFor={controlId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...inputProps}
        id={controlId}
        required={required}
        aria-describedby={description.describedBy}
        aria-invalid={description.invalid || undefined}
      />
      {helper ? (
        <p id={description.helperId} className="tl-auth-form-help">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={description.errorId} className="tl-auth-error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
