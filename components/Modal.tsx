"use client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="mob-dialog-scrim" onClick={onClose}>
      <div
        className="mob-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
