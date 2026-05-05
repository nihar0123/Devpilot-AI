"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type WorkspaceProject = {
  id: string;
  name: string;
  repoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ProjectContextValue = {
  projects: WorkspaceProject[];
  selectedProject: WorkspaceProject | null;
  selectedProjectId: string;
  loading: boolean;
  setSelectedProjectId: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
  createProject: (input: { name: string; repoUrl?: string }) => Promise<WorkspaceProject | null>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);
const STORAGE_KEY = "devpilot:selected-project-id";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState("");
  const [loading, setLoading] = useState(false);

  const setSelectedProjectId = (projectId: string) => {
    setSelectedProjectIdState(projectId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, projectId);
    }
  };

  const refreshProjects = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as WorkspaceProject[];
      setProjects(data);

      const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : "";
      const nextSelected = data.find((project) => project.id === (stored || selectedProjectId))?.id ?? data[0]?.id ?? "";
      if (nextSelected) setSelectedProjectId(nextSelected);
    } catch (error) {
      console.error(error);
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, status]);

  const createProject = useCallback(async (input: { name: string; repoUrl?: string }) => {
    const name = input.name.trim();
    if (name.length < 2) {
      toast.error("Project name is required");
      return null;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, repoUrl: input.repoUrl?.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const project = (await res.json()) as WorkspaceProject;
      setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)]);
      setSelectedProjectId(project.id);
      toast.success("Project connected");
      return project;
    } catch (error) {
      console.error(error);
      toast.error("Could not create project");
      return null;
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const timeout = window.setTimeout(() => {
      void refreshProjects();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshProjects, status]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const value = useMemo<ProjectContextValue>(
    () => ({ projects, selectedProject, selectedProjectId, loading, setSelectedProjectId, refreshProjects, createProject }),
    [projects, selectedProject, selectedProjectId, loading, refreshProjects, createProject],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used inside ProjectProvider");
  }
  return context;
}
