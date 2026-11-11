import type { SizeChartRow } from "@/lib/datocms/parse-size-chart";

type ProductSizeGuideProps = {
  summary: string;
  lengthLabel: string;
  weightLabel: string;
  waistLabel: string;
  rows: SizeChartRow[];
};

/**
 * Native disclosure. The table is in the HTML even while the details element is closed.
 */
export function ProductSizeGuide({ summary, lengthLabel, weightLabel, waistLabel, rows }: ProductSizeGuideProps) {
  if (rows.length === 0) return null;

  return (
    <details className="group mt-8 rounded-xl border border-border">
      <summary className="touch-target-text cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="text-muted-foreground group-open:rotate-90">
            ›
          </span>
          {summary}
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-border px-4 py-3">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">
                {lengthLabel}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {weightLabel}
              </th>
              <th scope="col" className="py-2 font-medium">
                {waistLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.length}-${row.waistWidthMm}`} className="border-t border-border">
                <th scope="row" className="py-2 pr-4 font-medium text-foreground">
                  {row.length}
                </th>
                <td className="py-2 pr-4 text-foreground">{row.riderWeightKg}</td>
                <td className="py-2 text-foreground">{row.waistWidthMm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
