import { useId } from "react";

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled,
  className = "",
}: InputProps) {
  const generatedId = useId();
  const inputId = generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`field ${className}`}>
      {label && <label className="lbl" htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? "error" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <p id={errorId} className="helper" style={{ color: "var(--tw-error)" }} role="alert">{error}</p>}
    </div>
  );
}
