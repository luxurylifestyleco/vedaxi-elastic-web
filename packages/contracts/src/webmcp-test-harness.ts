import type { ModelContextRegisterToolOptions, WebMcpTool } from "./webmcp";

export type RegistrationAttempt = {
  tool: WebMcpTool;
  options: ModelContextRegisterToolOptions;
};

export class FakeModelContext {
  readonly attempted: RegistrationAttempt[] = [];
  readonly registered: RegistrationAttempt[] = [];

  constructor(private readonly rejectToolName?: string) {}

  async registerTool(tool: WebMcpTool, options: ModelContextRegisterToolOptions): Promise<void> {
    this.attempted.push({ tool, options });

    if (tool.name === this.rejectToolName) {
      throw new Error(`Rejected ${tool.name}`);
    }

    this.registered.push({ tool, options });
    options.signal?.addEventListener("abort", () => {
      const index = this.registered.findIndex((entry) => entry.tool.name === tool.name);
      if (index >= 0) this.registered.splice(index, 1);
    });
  }

  async executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    const entry = this.registered.find((registered) => registered.tool.name === name);
    if (!entry) throw new Error(`Tool ${name} is not registered`);

    const value = await entry.tool.execute(input);
    return JSON.stringify(value);
  }
}
