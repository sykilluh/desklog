"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A button that requires two clicks to fire — the first turns it into a
 * "정말요?" warning state for a few seconds, the second actually runs the
 * action. Used for destructive/irreversible actions (delete, reset) that
 * were too easy to trigger by a single misclick.
 */
export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "한 번 더 누르면 진행돼요!",
  className = "",
  confirmClassName = "",
  title,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
  confirmClassName?: string;
  title?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
    onConfirm();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={confirming ? "한 번 더 누르면 진행돼요" : title}
      className={confirming ? confirmClassName : className}
    >
      {confirming ? confirmLabel : children}
    </button>
  );
}
