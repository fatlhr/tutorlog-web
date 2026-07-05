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
  return (
    <div className={`field ${className}`}>
      {label && <label className="lbl">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? "error" : ""}`}
      />
      {error && <p className="helper" style={{ color: "var(--tw-error)" }}>{error}</p>}
    </div>
  );
}
