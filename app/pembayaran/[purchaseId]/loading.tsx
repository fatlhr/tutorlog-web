import { LoadingState } from "@/components/app-ui/states";

export default function PaymentLoading() {
  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "grid",
        minHeight: "100svh",
        padding: "clamp(24px, 6vw, 72px)",
        placeItems: "center",
        background: "var(--tl-bg)",
      }}
    >
      <div style={{ width: "min(100%, 620px)" }}>
        <LoadingState shape="form" rowCount={5} label="Memuat status pembayaran" />
      </div>
    </div>
  );
}
