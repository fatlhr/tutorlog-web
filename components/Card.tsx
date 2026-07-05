interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outlined";
}

export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div className={`card ${variant === "outlined" ? "card-outlined" : ""} ${className}`}>
      {children}
    </div>
  );
}
