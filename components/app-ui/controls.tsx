"use client";

import { CaretDown, SpinnerGap } from "@phosphor-icons/react";
import {
  Children,
  createContext,
  useContext,
  useMemo,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
} from "react";
import {
  ButtonPrimitive,
  IconButtonPrimitive,
} from "@/components/ui/button-primitive";
import type {
  SharedButtonProps,
  SharedIconButtonProps,
} from "@/components/ui/control-types";
import { getFieldDescription } from "@/components/ui/field-contract";
import styles from "./app-ui.module.css";
import type {
  ControlSize,
  FieldSize,
  NonVisualAttributes,
  SelectOption,
} from "./types";

type ButtonVariant = "primary" | "secondary" | "quiet";

export type ButtonProps = SharedButtonProps & {
  variant?: ButtonVariant;
  size?: ControlSize;
};

function buttonClasses(
  variant: ButtonVariant,
  size: ControlSize,
  block: boolean,
) {
  return [
    styles.button,
    styles[`buttonVariant${capitalize(variant)}`],
    styles[`controlSize${capitalize(size)}`],
    block ? styles.block : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "default",
    block = false,
  } = props;
  return (
    <ButtonPrimitive
      {...props}
      className={buttonClasses(variant, size, block)}
      classes={{
        icon: styles.controlIcon,
        loadingPlaceholder: styles.loadingPlaceholder,
        loadingContent: styles.loadingContent,
        loadingIndicator: styles.spinner,
      }}
      loadingIndicator={<SpinnerGap aria-hidden="true" />}
    />
  );
}

export type IconButtonProps = SharedIconButtonProps & {
  variant?: "quiet" | "outline" | "primary";
  size?: ControlSize;
};

export function IconButton({
  icon,
  label,
  variant = "quiet",
  size = "default",
  ...props
}: IconButtonProps) {
  const className = [
    styles.iconButton,
    styles[`iconButtonVariant${capitalize(variant)}`],
    styles[`controlSize${capitalize(size)}`],
  ].join(" ");

  return (
    <IconButtonPrimitive
      {...props}
      icon={icon}
      label={label}
      className={className}
      iconClassName={styles.controlIcon}
      loadingIndicator={<SpinnerGap aria-hidden="true" />}
      loadingIndicatorClassName={styles.spinner}
    />
  );
}

interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  density: FieldSize;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps {
  controlId: string;
  label: string;
  labelVisuallyHidden?: boolean;
  required?: boolean;
  helper?: string;
  error?: string;
  density?: FieldSize;
  children: ReactElement;
}

export function Field({
  controlId,
  label,
  labelVisuallyHidden = false,
  required = false,
  helper,
  error,
  density = "default",
  children,
}: FieldProps) {
  const description = getFieldDescription(controlId, helper, error);
  const value = useMemo(
    () => ({
      controlId,
      describedBy: description.describedBy,
      invalid: description.invalid,
      required,
      density,
    }),
    [controlId, description.describedBy, description.invalid, required, density],
  );

  const control = Children.only(children);
  if (
    control.type !== TextField &&
    control.type !== Select &&
    control.type !== DateField &&
    control.type !== Textarea
  ) {
    throw new Error(
      "Field must contain exactly one TextField, Select, DateField, or Textarea.",
    );
  }

  return (
    <FieldContext.Provider value={value}>
      <div className={`${styles.field} ${styles[`fieldDensity${capitalize(density)}`]}`}>
        <label
          className={`${styles.fieldLabel} ${labelVisuallyHidden ? styles.fieldLabelVisuallyHidden : ""}`}
          htmlFor={controlId}
        >
          {label}
          {required ? <span className={styles.requiredMark}> *</span> : null}
        </label>
        {children}
        {helper ? (
          <p id={description.helperId} className={styles.fieldHelper}>
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={description.errorId} className={styles.fieldError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldControl(id: string, describedBy?: string) {
  const field = useContext(FieldContext);
  if (!field) {
    throw new Error("Protected app form controls must be composed inside Field.");
  }
  if (field.controlId !== id) {
    throw new Error(`Field controlId must match the control id: ${id}.`);
  }

  return {
    size: field.density,
    required: field.required,
    invalid: field.invalid,
    describedBy: [field.describedBy, describedBy].filter(Boolean).join(" ") || undefined,
  };
}

interface BaseFieldControlProps extends NonVisualAttributes {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  size?: FieldSize;
}

export interface SelectProps extends BaseFieldControlProps {
  options: SelectOption[];
  autoComplete?: string;
}

export function Select({
  id,
  name,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  size,
  autoComplete,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "data-analytics-id": analyticsId,
}: SelectProps) {
  const field = useFieldControl(id, ariaDescribedBy);
  const resolvedSize = size ?? field.size;

  return (
    <span className={styles.selectShell}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required || field.required}
        autoComplete={autoComplete}
        className={`${styles.fieldControl} ${styles.selectControl} ${styles[`fieldControlSize${capitalize(resolvedSize)}`]}`}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={field.describedBy}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-invalid={field.invalid || undefined}
        data-analytics-id={analyticsId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown className={styles.selectIcon} size={16} weight="bold" aria-hidden="true" />
    </span>
  );
}

export interface TextFieldProps extends BaseFieldControlProps {
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  style?: InputHTMLAttributes<HTMLInputElement>["style"];
}

export function TextField({
  id,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  disabled = false,
  required = false,
  size,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "data-analytics-id": analyticsId,
}: TextFieldProps) {
  const field = useFieldControl(id, ariaDescribedBy);
  const resolvedSize = size ?? field.size;

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      disabled={disabled}
      required={required || field.required}
      style={style}
      className={`${styles.fieldControl} ${styles[`fieldControlSize${capitalize(resolvedSize)}`]}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={field.describedBy}
      aria-controls={ariaControls}
      aria-invalid={field.invalid || undefined}
      data-analytics-id={analyticsId}
    />
  );
}

export interface DateFieldProps extends Omit<BaseFieldControlProps, "value"> {
  value: string;
  min?: string;
  max?: string;
}

export function DateField({
  id,
  name,
  value,
  min,
  max,
  onChange,
  disabled = false,
  required = false,
  size,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "data-analytics-id": analyticsId,
}: DateFieldProps) {
  const field = useFieldControl(id, ariaDescribedBy);
  const resolvedSize = size ?? field.size;

  return (
    <input
      id={id}
      name={name}
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      required={required || field.required}
      className={`${styles.fieldControl} ${styles[`fieldControlSize${capitalize(resolvedSize)}`]}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={field.describedBy}
      aria-controls={ariaControls}
      aria-invalid={field.invalid || undefined}
      data-analytics-id={analyticsId}
    />
  );
}

export interface TextareaProps extends Omit<BaseFieldControlProps, "size"> {
  placeholder?: string;
}

export function Textarea({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "data-analytics-id": analyticsId,
}: TextareaProps) {
  const field = useFieldControl(id, ariaDescribedBy);

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required || field.required}
      className={styles.textarea}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={field.describedBy}
      aria-controls={ariaControls}
      aria-invalid={field.invalid || undefined}
      data-analytics-id={analyticsId}
    />
  );
}
