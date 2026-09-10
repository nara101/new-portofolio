"use client";

import { useEffect } from "react";

export function Flash({
  ok,
  err,
  onClear,
}: {
  ok?: string | null;
  err?: string | null;
  onClear?: () => void;
}) {
  useEffect(() => {
    if (!ok && !err) return;
    const t = setTimeout(() => onClear?.(), 3200);
    return () => clearTimeout(t);
  }, [ok, err, onClear]);

  if (ok) return <div className="studio-flash ok">{ok}</div>;
  if (err) return <div className="studio-flash err">{err}</div>;
  return null;
}
