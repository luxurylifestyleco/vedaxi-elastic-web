export {};

declare global {
  interface ModelContextTool {
    name: string;
    description: string;
    title?: string;
    inputSchema?: Record<string, unknown>;
    annotations?: {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
    };
    execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
  }

  interface ModelContextRegisterToolOptions {
    exposedTo?: string[];
    signal?: AbortSignal;
  }

  interface ModelContext {
    registerTool(
      tool: ModelContextTool,
      options?: ModelContextRegisterToolOptions
    ): Promise<void>;
  }

  interface Document {
    modelContext?: ModelContext;
  }
}
