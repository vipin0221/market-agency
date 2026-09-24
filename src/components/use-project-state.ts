"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectState } from "@/lib/state";

export function useProjectState(projectId: string) {
  const [state, setState] = useState<ProjectState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/state`, { cache: "no-store" });
      if (!response.ok) {
        setError("The project record could not be read.");
        return;
      }
      setState((await response.json()) as ProjectState);
      setError(null);
    } catch {
      setError("The project record could not be read.");
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
    const timer = setInterval(() => void reload(), 1000);
    return () => clearInterval(timer);
  }, [reload]);

  return { state, error, reload };
}
