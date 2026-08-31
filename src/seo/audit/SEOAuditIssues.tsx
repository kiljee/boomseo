import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  XCircle
} from "lucide-react";


type Props = {
  issues: any[];
};

export function SEOAuditIssues({ issues }: Props) {
  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium">
          No issues found
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Your latest audit did not report any SEO issues.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">
          SEO Issues
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {issues.length} issues discovered during the latest audit.
        </p>
      </div>

      <div className="divide-y divide-border">
        {issues.map((issue) => (
          <IssueItem
            key={issue.id}
            issue={issue}
          />
        ))}
      </div>
    </div>
  );
}
function IssueItem({ issue }: { issue: any }) {
  const [open, setOpen] = useState(false);

  const details =
    issue.details && typeof issue.details === "object"
      ? issue.details
      : null;

  const severity =
    issue.severity?.toLowerCase() ?? "warning";

  const severityClass =
    severity === "error" || severity === "critical"
      ? "bg-destructive/10 text-destructive"
      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";

  return (
    <div className="p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 text-left"
      >

        
        <div
          className={`mt-0.5 shrink-0 rounded-lg p-2 ${severityClass}`}
        >
          {issue.type?.toLowerCase() === "warning" && (
            <AlertTriangle className="h-4 w-4" />
        )}

          {issue.type?.toLowerCase() === "error" && (
            <XCircle className="h-4 w-4"/>
        )}

        </div>
        

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {issue.details?.issue ?? "SEO Issue"}
            </span>

            <span className="text-xs text-muted-foreground">
              {issue.details?.type}
            </span>
          </div>

          {issue.details?.details && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {issue.details.details}
            </p>
          )}


        </div>

        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="ml-11 mt-4 rounded-xl border border-border bg-muted/30 p-4">
          {issue.url && (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open affected page
              <ExternalLink className="h-3 w-3" />
            </a>
          )}



          {details ? (
            <div className="space-y-2">
              {Object.entries(details)
                .filter(
                  ([key, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    key !== "url"
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatKey(key)}
                    </span>

                    <span className="break-words text-xs text-foreground">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No additional details available.
            </p>
          )}

          
          {issue.url && (

            <span className="text-xs font-medium text-muted-foreground">
              {issue.url}
            </span>

          )}
        </div>
      )}


      
    </div>
  );
}

function formatIssueType(type: string | null | undefined) {
  if (!type) return "SEO Issue";

  return type
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getIssueTitle(issue: any) {
  return (
    issue.details?.type ||
    issue.details?.issue ||
    issue.details?.category ||
    formatIssueType(issue.type)
  );
}

function formatKey(key: string) {
  console.log("key is "+key);
  return key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}