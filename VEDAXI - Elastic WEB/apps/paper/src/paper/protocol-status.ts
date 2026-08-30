export type PaperProtocolStatus = "checking" | "active" | "disabled" | "unsupported" | "error";

export function protocolStatusCopy(status: PaperProtocolStatus): string {
  switch (status) {
    case "checking":
      return "Checking native agent capabilities";
    case "active":
      return "Native paper evidence tool active";
    case "disabled":
      return "Agent tools off";
    case "unsupported":
      return "This browser does not expose native agent tools";
    case "error":
      return "Native agent tool unavailable";
  }
}
