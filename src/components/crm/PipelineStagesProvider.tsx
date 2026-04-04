"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { PIPELINE_STAGES } from "@/lib/utils/constants";

export type StageConfig = {
  id: string;
  label: string;
  color: string;
};

export const STAGE_COLOR_OPTIONS: { label: string; value: string; dot: string }[] = [
  { label: "Cinza", value: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  { label: "Azul", value: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  { label: "Roxo", value: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  { label: "Amarelo", value: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  { label: "Laranja", value: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  { label: "Verde", value: "bg-green-100 text-green-700", dot: "bg-green-500" },
  { label: "Vermelho", value: "bg-red-100 text-red-700", dot: "bg-red-500" },
  { label: "Rosa", value: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
  { label: "Ciano", value: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
];

const DEFAULT_STAGES: StageConfig[] = PIPELINE_STAGES.map((s) => ({ ...s }));
const STORAGE_KEY = "pipeline_stages_v1";

function loadStages(): StageConfig[] {
  if (typeof window === "undefined") return DEFAULT_STAGES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as StageConfig[];
  } catch {
    // ignore
  }
  return DEFAULT_STAGES;
}

function persistStages(stages: StageConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
  } catch {
    // ignore
  }
}

type PipelineStagesContextType = {
  stages: StageConfig[];
  addStage: (label: string, color: string) => void;
  updateStage: (id: string, label: string, color: string) => void;
  removeStage: (id: string) => void;
  resetToDefault: () => void;
};

const PipelineStagesContext = createContext<PipelineStagesContextType | null>(null);

export function PipelineStagesProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<StageConfig[]>(() => loadStages());

  const commit = useCallback((next: StageConfig[]) => {
    setStages(next);
    persistStages(next);
  }, []);

  const addStage = useCallback(
    (label: string, color: string) => {
      const id =
        label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") +
        "_" +
        Date.now();
      commit([...stages, { id, label, color }]);
    },
    [stages, commit]
  );

  const updateStage = useCallback(
    (id: string, label: string, color: string) => {
      commit(stages.map((s) => (s.id === id ? { ...s, label, color } : s)));
    },
    [stages, commit]
  );

  const removeStage = useCallback(
    (id: string) => {
      commit(stages.filter((s) => s.id !== id));
    },
    [stages, commit]
  );

  const resetToDefault = useCallback(() => {
    commit(DEFAULT_STAGES);
  }, [commit]);

  return (
    <PipelineStagesContext.Provider
      value={{ stages, addStage, updateStage, removeStage, resetToDefault }}
    >
      {children}
    </PipelineStagesContext.Provider>
  );
}

export function usePipelineStages() {
  const ctx = useContext(PipelineStagesContext);
  if (!ctx) throw new Error("usePipelineStages must be used inside PipelineStagesProvider");
  return ctx;
}
