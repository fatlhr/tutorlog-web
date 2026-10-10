"use client";

import { useEffect, useRef, useState } from "react";
import { sendMagicLink, verifyEmailOtp } from "../actions";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({ email, next }: { email: string; next: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (isVerifying) formRef.current?.requestSubmit();
  }, [isVerifying]);

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) setIsVerifying(true);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  return (
    <>
      <form ref={formRef} action={verifyEmailOtp} className="tl-auth-otp-form">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <label htmlFor="otp-code">Atau masukkan kode 6 digit dari email</label>
        <input
          id="otp-code"
          name="token"
          className="tl-auth-otp-input"
          value={code}
          onChange={(event) => handleCodeChange(event.target.value)}
          readOnly={isVerifying}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          placeholder="••••••"
        />
      </form>
      <form action={sendMagicLink}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <button
          className="tl-auth-text-button"
          type="submit"
          disabled={cooldown > 0 || isVerifying}
        >
          {cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : "Kirim tautan dan kode baru"}
        </button>
      </form>
    </>
  );
}
