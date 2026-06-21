"use client";

import { useEffect } from "react";
import { SALAMRUBY_ENVIRONMENT_ID_LS, SALAMRUBY_WORKSPACE_ID_LS } from "@/lib/localStorage";

interface WorkspaceStorageHandlerProps {
  workspaceId: string;
}

const WorkspaceStorageHandler = ({ workspaceId }: WorkspaceStorageHandlerProps) => {
  useEffect(() => {
    localStorage.setItem(SALAMRUBY_WORKSPACE_ID_LS, workspaceId);
    // Keep legacy environment ID in sync for backward compatibility with old SDK clients
    localStorage.setItem(SALAMRUBY_ENVIRONMENT_ID_LS, workspaceId);
  }, [workspaceId]);

  return null;
};

export default WorkspaceStorageHandler;
