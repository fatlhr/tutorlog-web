import { SpinnerGap } from "@phosphor-icons/react/dist/ssr";
import type { Ref } from "react";
import { IconButtonPrimitive } from "@/components/ui/button-primitive";
import type { SharedIconButtonProps } from "@/components/ui/control-types";
import styles from "./public-controls.module.css";

export type PublicIconButtonSize = "proof" | "demo" | "mobile";

export interface PublicIconButtonProps extends SharedIconButtonProps {
  size: PublicIconButtonSize;
  buttonRef?: Ref<HTMLButtonElement>;
}

const sizeClasses: Record<PublicIconButtonSize, string> = {
  proof: "tl-proof-dialog-close",
  demo: "tl-demo-close",
  mobile: "tl-mobile-menu-close",
};

export function PublicIconButton(props: PublicIconButtonProps) {
  const { size, buttonRef } = props;

  return (
    <IconButtonPrimitive
      {...props}
      className={`${styles.iconButton} ${sizeClasses[size]}`}
      iconClassName={styles.icon}
      loadingIndicator={<SpinnerGap size={18} weight="bold" />}
      loadingIndicatorClassName={styles.spinner}
      buttonRef={buttonRef}
    />
  );
}
