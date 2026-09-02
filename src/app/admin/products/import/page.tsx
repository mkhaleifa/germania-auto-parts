"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParsedRow {
  title: string;
  description: string;
  price: number;
  condition: string;
  sku: string;
  oem_number: string;
  category_slug: string;
  stock: number;
  brand: string;
  weight: string;
}

interface RowError {
  row: number;
  field: string;
  message: string;
}

type Step = "upload" | "preview" | "result";

const REQUIRED_COLUMNS = [
  "title",
  "description",
  "price",
  "condition",
  "sku",
  "category_slug",
  "stock",
];
const OPTIONAL_COLUMNS = ["oem_number", "brand", "weight"];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });

  return { headers, rows };
}

export default function AdminProductImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      // Validate headers
      const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
      if (missing.length > 0) {
        toast.error(`Missing required columns: ${missing.join(", ")}`);
        return;
      }

      const parsed: ParsedRow[] = rows.map((values) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || "";
        });
        return {
          title: obj.title || "",
          description: obj.description || "",
          price: Number(obj.price) || 0,
          condition: (obj.condition || "").toUpperCase(),
          sku: obj.sku || "",
          oem_number: obj.oem_number || "",
          category_slug: obj.category_slug || "",
          stock: Number(obj.stock) || 0,
          brand: obj.brand || "",
          weight: obj.weight || "",
        };
      });

      setParsedRows(parsed);
      setErrors([]);
      setStep("preview");
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    } else {
      toast.error("Please upload a CSV file");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          toast.error(`${data.errors.length} validation errors found`);
        } else {
          toast.error(data.error?.message || "Import failed");
        }
        return;
      }

      setResult(data.data);
      setStep("result");
      toast.success(data.data.message);
    } catch {
      toast.error("Failed to import products");
    } finally {
      setImporting(false);
    }
  }

  function getRowErrors(rowIndex: number): RowError[] {
    return errors.filter((e) => e.row === rowIndex);
  }

  function reset() {
    setStep("upload");
    setParsedRows([]);
    setErrors([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Import Products</h1>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file with product data. Required columns:{" "}
              {REQUIRED_COLUMNS.join(", ")}. Optional: {OPTIONAL_COLUMNS.join(", ")}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-1">Drag & drop a CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="mt-6 rounded-md bg-muted p-4">
              <p className="text-sm font-medium mb-2">CSV Format Example:</p>
              <code className="text-xs block overflow-x-auto whitespace-pre font-mono">
                title,description,price,condition,sku,category_slug,stock,brand,weight{"\n"}
                Alternator,High quality alternator,8500,GRADE_A,ALT-001,engine-drivetrain,10,Denso,2.5kg
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview Import</CardTitle>
                  <CardDescription>
                    {parsedRows.length} products found.
                    {errors.length > 0 && (
                      <span className="text-destructive ml-2">
                        {errors.length} errors — fix your CSV and re-upload.
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={importing || errors.length > 0}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {importing ? "Importing..." : `Import ${parsedRows.length} Products`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">#</th>
                      {ALL_COLUMNS.map((col) => (
                        <th key={col} className="p-2 font-medium whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 50).map((row, i) => {
                      const rowErrors = getRowErrors(i);
                      const errorFields = new Set(rowErrors.map((e) => e.field));
                      return (
                        <tr
                          key={i}
                          className={`border-b last:border-0 ${
                            rowErrors.length > 0 ? "bg-destructive/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <td className="p-2 text-muted-foreground">
                            {i + 1}
                            {rowErrors.length > 0 && (
                              <AlertCircle className="h-3 w-3 text-destructive inline ml-1" />
                            )}
                          </td>
                          <td className={`p-2 ${errorFields.has("title") ? "text-destructive" : ""}`}>
                            {row.title}
                          </td>
                          <td className={`p-2 max-w-32 truncate ${errorFields.has("description") ? "text-destructive" : ""}`}>
                            {row.description}
                          </td>
                          <td className={`p-2 ${errorFields.has("price") ? "text-destructive" : ""}`}>
                            {row.price}
                          </td>
                          <td className={`p-2 ${errorFields.has("condition") ? "text-destructive" : ""}`}>
                            <Badge variant="outline" className="text-xs">
                              {row.condition}
                            </Badge>
                          </td>
                          <td className={`p-2 font-mono ${errorFields.has("sku") ? "text-destructive" : ""}`}>
                            {row.sku}
                          </td>
                          <td className={`p-2 font-mono ${errorFields.has("category_slug") ? "text-destructive" : ""}`}>
                            {row.category_slug}
                          </td>
                          <td className={`p-2 ${errorFields.has("stock") ? "text-destructive" : ""}`}>
                            {row.stock}
                          </td>
                          <td className="p-2">{row.brand}</td>
                          <td className="p-2">{row.weight}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="p-3 text-sm text-muted-foreground text-center">
                  Showing first 50 of {parsedRows.length} rows
                </p>
              )}
            </CardContent>
          </Card>

          {errors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Validation Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {errors.slice(0, 20).map((err, i) => (
                    <li key={i} className="text-destructive">
                      Row {err.row + 1}, {err.field}: {err.message}
                    </li>
                  ))}
                  {errors.length > 20 && (
                    <li className="text-muted-foreground">
                      ...and {errors.length - 20} more errors
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 3: Result */}
      {step === "result" && result && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold">Import Complete</h2>
            <div className="text-center text-muted-foreground">
              <p>{result.created} of {result.total} products imported successfully.</p>
              {result.failed > 0 && (
                <p className="text-destructive">{result.failed} products failed to import.</p>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={reset}>
                Import More
              </Button>
              <Link href="/admin/products">
                <Button>View Products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}