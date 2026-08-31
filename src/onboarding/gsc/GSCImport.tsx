import { useState } from "react";
import { Link, routes } from "wasp/client/router";
import { ArrowLeft, Upload, FileSpreadsheet } from "lucide-react";
import { useAction } from "wasp/client/operations";
import { importGSCData } from "wasp/client/operations";

type GSCRow = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
};

export function GSCImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<GSCRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const importData = useAction(importGSCData);

  async function handleImport() {
      if (rows.length === 0 || importing) return;

      try {
        setImporting(true);
        setError(null);

        await importData({
          rows,
        });

        setImported(true);
      } catch (err) {
        console.error("GSC import failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to import GSC data."
        );
      } finally {
        setImporting(false);
      }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result);
        const lines = text.trim().split(/\r?\n/);

        if (lines.length < 2) {
          throw new Error("The file contains no data.");
        }

        const headers = lines[0]
          .split(",")
          .map((header) => header.trim().toLowerCase());

        const queryIndex = headers.indexOf("query");
        const impressionsIndex = headers.indexOf("impressions");
        const clicksIndex = headers.indexOf("clicks");
        const ctrIndex = headers.indexOf("ctr");
        const positionIndex = headers.indexOf("position");

        if (
          queryIndex === -1 ||
          impressionsIndex === -1 ||
          clicksIndex === -1 ||
          ctrIndex === -1 ||
          positionIndex === -1
        ) {
          throw new Error(
            "Invalid GSC file. Required columns: Query, Impressions, Clicks, CTR, Position."
          );
        }

        const parsedRows: GSCRow[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",");

            return {
              query: values[queryIndex]?.trim() ?? "",
              impressions:
                Number(values[impressionsIndex]) || 0,
              clicks:
                Number(values[clicksIndex]) || 0,
              ctr:
                parseFloat(
                  values[ctrIndex]?.replace("%", "")
                ) || 0,
              position:
                Number(values[positionIndex]) || 0,
            };
          });

        setRows(parsedRows);
      } catch (err) {
        setRows([]);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to parse file."
        );
      }
    };

    reader.readAsText(selectedFile);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          to={routes.DashboardRoute.to}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Import Google Search Console Data
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Upload a Search Console search performance export
            to improve your SEO insights.
          </p>
        </div>

        {/* Upload */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Upload GSC export
              </h2>

              <p className="text-xs text-muted-foreground">
                CSV files exported from Google Search Console.
              </p>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center transition hover:bg-muted/50">
            <Upload className="h-8 w-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              {file
                ? file.name
                : "Choose a CSV file"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Query, Impressions, Clicks, CTR and Position
            </p>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <p className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {rows.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Import Preview
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {rows.length} search queries found.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || imported}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing
                    ? "Importing..."
                    : imported
                      ? "Imported"
                      : "Import Data"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">
                      Query
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Impressions
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Clicks
                    </th>
                    <th className="px-5 py-3 font-medium">
                      CTR
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Position
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-3 font-medium">
                        {row.query}
                      </td>

                      <td className="px-5 py-3">
                        {row.impressions.toLocaleString()}
                      </td>

                      <td className="px-5 py-3">
                        {row.clicks.toLocaleString()}
                      </td>

                      <td className="px-5 py-3">
                        {row.ctr}%
                      </td>

                      <td className="px-5 py-3">
                        {row.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}