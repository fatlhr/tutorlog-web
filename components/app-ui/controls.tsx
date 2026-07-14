"use client";

import Link from "next/link";
import { CaretDown, SpinnerGap } from "@phosphor-icons/react";
import {
  Children,
  createContext,
  useContext,
  useMemo,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./app-ui.module.css";
import type {
  ControlSize,
  FieldSize,
  NonVisualAttributes,
  SelectOption,
} from "./types";

type ButtonVariant = "primary" | "secondary" | "quiet";

interface ButtonSharedProps extends NonVisualAttributes {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ControlSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

interface NativeButtonProps extends ButtonSharedProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

interface LinkButtonProps extends ButtonSharedProps {
  href: string;
  type?: never;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: never;
  target?: "_blank";
  rel?: string;
}

export type ButtonProps = NativeButtonProps | LinkButtonProps;

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

function controlContent(
  children: ReactNode,
  leadingIcon: ReactNode,
  trailingIcon: ReactNode,
) {
  return (
    <>
      {leadingIcon ? <span className={styles.controlIcon}>{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className={styles.controlIcon}>{trailingIcon}</span> : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "default",
    leadingIcon,
    trailingIcon,
    block = false,
    loading = false,
    loadingLabel = "Menyiapkan...",
    id,
    name,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-controls": ariaControls,
    "aria-expanded": ariaExpanded,
    "data-analytics-id": analyticsId,
  } = props;
  const className = buttonClasses(variant, size, block);
  const content = controlContent(
    children,
    leadingIcon,
    trailingIcon,
  );
  const renderedContent = (
    <>
      <span className={styles.loadingPlaceholder} aria-hidden={loading}>
        {content}
      </span>
      <span className={styles.loadingContent} aria-hidden={!loading}>
        <SpinnerGap className={styles.spinner} aria-hidden="true" />
        <span>{loadingLabel}</span>
      </span>
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        id={id}
        href={props.href}
        name={name}
        target={props.target}
        rel={props.rel}
        className={className}
        onClick={(event) => {
          if (loading) {
            event.preventDefault();
            return;
          }
          props.onClick?.(event);
        }}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        data-analytics-id={analyticsId}
      >
        {renderedContent}
      </Link>
    );
  }

  return (
    <button
      id={id}
      name={name}
      type={props.type ?? "button"}
      className={className}
      onClick={loading ? undefined : props.onClick}
      disabled={props.disabled || loading}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-busy={loading || undefined}
      data-analytics-id={analyticsId}
    >
      {renderedContent}
    </button>
  );
}

export interface IconButtonProps extends NonVisualAttributes {
  icon: ReactNode;
  label: string;
  variant?: "quiet" | "outline" | "primary";
  size?: ControlSize;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
}

export function IconButton({
  icon,
  label,
  variant = "quiet",
  size = "default",
  onClick,
  disabled = false,
  loading = false,
  pressed,
  id,
  name,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "data-analytics-id": analyticsId,
}: IconButtonProps) {
  const className = [
    styles.iconButton,
    styles[`iconButtonVariant${capitalize(variant)}`],
    styles[`controlSize${capitalize(size)}`],
  ].join(" ");

  return (
    <button
      id={id}
      name={name}
      type="button"
      className={className}
      onClick={loading ? undefined : onClick}
      disabled={disabled || loading}
      aria-label={label}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      data-analytics-id={analyticsId}
    >
      {loading ? (
        <SpinnerGap className={styles.spinner} aria-hidden="true" />
      ) : (
        <span className={styles.controlIcon} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
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
  const helperId = helper ? `${controlId}-helper` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const value = useMemo(
    () => ({
      controlId,
      describedBy,
      invalid: Boolean(error),
      required,
      density,
    }),
    [controlId, describedBy, error, required, density],
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
          <p id={helperId} className={styles.fieldHelper}>
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={styles.fieldError} role="alert">
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
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
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
      className={`${styles.fieldControl} ${styles[`fieldControlSize${capitalize(resolvedSize)}`]}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={field.describedBy}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
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
  "aria-expanded": ariaExpanded,
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
      aria-expanded={ariaExpanded}
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
  "aria-expanded": ariaExpanded,
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
      aria-expanded={ariaExpanded}
      aria-invalid={field.invalid || undefined}
      data-analytics-id={analyticsId}
    />
  );
}
