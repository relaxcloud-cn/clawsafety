import { Suspense } from "react";

import { ScanWorkbench } from "@/components/scan-workbench";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <section className="container scan-shell">
          <div className="panel empty-panel">
            Loading scan workbench...
          </div>
        </section>
      }
    >
      <ScanWorkbench />
    </Suspense>
  );
}
