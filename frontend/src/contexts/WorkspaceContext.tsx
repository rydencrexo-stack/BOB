
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabase";

export interface BOBWorkspace {
  id: string;
  name: string;
  role: string;
}

interface WorkspaceContextValue {
  workspace: BOBWorkspace | null;
  loading: boolean;
  error: string | null;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined,
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<BOBWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setWorkspace(null);
        return;
      }

      const { data, error: membershipError } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;

      if (!data) {
        setWorkspace(null);
        setError("No BOB workspace is assigned to this account.");
        return;
      }

      const organization = data.organizations as unknown as
        | { id: string; name: string }
        | null;

      if (!organization) {
        setWorkspace(null);
        setError("Workspace information could not be loaded.");
        return;
      }

      setWorkspace({
        id: organization.id,
        name: organization.name,
        role: data.role,
      });
    } catch (err) {
      console.error("Workspace loading error:", err);
      setWorkspace(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your BOB workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshWorkspace();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshWorkspace();
    });

    return () => subscription.unsubscribe();
  }, [refreshWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        loading,
        error,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider.",
    );
  }

  return context;
}
