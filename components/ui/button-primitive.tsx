import Link from "next/link";
import type { ReactNode, Ref } from "react";
import type {
  SharedButtonProps,
  SharedIconButtonProps,
  SharedLinkButtonProps,
  SharedNativeButtonProps,
} from "./control-types";

interface ButtonPrimitiveClasses {
  icon: string;
  loadingPlaceholder: string;
  loadingContent: string;
  loadingIndicator?: string;
}

export type ButtonPrimitiveProps = SharedButtonProps & {
  className: string;
  classes: ButtonPrimitiveClasses;
  loadingIndicator: ReactNode;
  buttonRef?: Ref<HTMLButtonElement>;
  linkRef?: Ref<HTMLAnchorElement>;
};

function controlContent(
  children: ReactNode,
  leadingIcon: ReactNode,
  trailingIcon: ReactNode,
  iconClassName: string,
) {
  return (
    <>
      {leadingIcon ? <span className={iconClassName} aria-hidden="true">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className={iconClassName} aria-hidden="true">{trailingIcon}</span> : null}
    </>
  );
}

export function ButtonPrimitive(props: ButtonPrimitiveProps) {
  const {
    children,
    leadingIcon,
    trailingIcon,
    loading = false,
    loadingLabel = "Menyiapkan...",
    className,
    classes,
    loadingIndicator,
    buttonRef,
    linkRef,
    id,
    name,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-controls": ariaControls,
    "aria-expanded": ariaExpanded,
    "data-analytics-id": analyticsId,
  } = props;
  const content = controlContent(children, leadingIcon, trailingIcon, classes.icon);
  const renderedContent = (
    <>
      <span className={classes.loadingPlaceholder} aria-hidden={loading}>
        {content}
      </span>
      <span className={classes.loadingContent} aria-hidden={!loading}>
        <span className={classes.loadingIndicator} aria-hidden="true">{loadingIndicator}</span>
        <span>{loadingLabel}</span>
      </span>
    </>
  );

  if ("href" in props && props.href) {
    const linkProps = props as SharedLinkButtonProps;
    return (
      <Link
        ref={linkRef}
        id={id}
        href={linkProps.href}
        target={linkProps.target}
        rel={linkProps.rel}
        className={className}
        onClick={loading || linkProps.onClick
          ? (event) => {
              if (loading) {
                event.preventDefault();
                return;
              }
              linkProps.onClick?.(event);
            }
          : undefined}
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

  const buttonProps = props as SharedNativeButtonProps;
  return (
    <button
      ref={buttonRef}
      id={id}
      name={name}
      type={buttonProps.type ?? "button"}
      className={className}
      onClick={loading ? undefined : buttonProps.onClick}
      disabled={buttonProps.disabled || loading}
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

export interface IconButtonPrimitiveProps extends SharedIconButtonProps {
  className: string;
  iconClassName: string;
  loadingIndicator: ReactNode;
  loadingIndicatorClassName?: string;
  buttonRef?: Ref<HTMLButtonElement>;
}

export function IconButtonPrimitive({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  pressed,
  className,
  iconClassName,
  loadingIndicator,
  loadingIndicatorClassName,
  buttonRef,
  id,
  name,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "data-analytics-id": analyticsId,
}: IconButtonPrimitiveProps) {
  return (
    <button
      ref={buttonRef}
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
        <span className={loadingIndicatorClassName} aria-hidden="true">{loadingIndicator}</span>
      ) : (
        <span className={iconClassName} aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}
