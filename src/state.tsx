import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { clearSession, loadSession, saveSession } from "./lib/store";
import type { PreparedPhoto } from "./lib/image";

export type Status = "idle" | "generating" | "done" | "error";
export interface Lead { name: string; phone: string; email: string }

interface Ctx {
  ready: boolean;
  photo: PreparedPhoto | null;
  request: string;
  after: string | null;
  status: Status;
  error: string | null;
  setPhoto: (p: PreparedPhoto | null) => void;
  setRequest: (r: string) => void;
  generate: () => Promise<void>;
  submitLead: (l: Lead) => void;
  reset: () => void;
}

const C = createContext<Ctx>(null!);
export const useApp = () => useContext(C);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [request, setRequest] = useState("");
  const [after, setAfter] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef(false);

  useEffect(() => {
    loadSession().then((s) => {
      if (s) {
        setPhoto({ dataUrl: s.photo, base64: s.photo.split(",")[1], mimeType: "image/jpeg" });
        setRequest(s.request);
        if (s.after) { setAfter(s.after); setStatus("done"); }
      }
      setReady(true);
    });
  }, []);

  const generate = useCallback(async () => {
    if (!photo || !request.trim() || inflight.current) return;
    inflight.current = true;
    setError(null);
    setAfter(null);
    setStatus("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo.base64, mimeType: photo.mimeType, request }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      const url = `data:${data.mimeType};base64,${data.image}`;
      setAfter(url);
      setStatus("done");
      saveSession({ photo: photo.dataUrl, request, after: url });
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    } finally {
      inflight.current = false;
    }
  }, [photo, request]);

  // Lead goes to GHL via our /api/lead proxy; never blocks the rendering.
  const submitLead = useCallback((l: Lead) => {
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...l, request, pageUrl: window.location.origin }),
      keepalive: true,
    }).catch(() => undefined);
  }, [request]);

  const reset = useCallback(() => {
    setPhoto(null); setRequest(""); setAfter(null); setError(null); setStatus("idle");
    clearSession();
  }, []);

  return (
    <C.Provider value={{ ready, photo, request, after, status, error, setPhoto, setRequest, generate, submitLead, reset }}>
      {children}
    </C.Provider>
  );
}
