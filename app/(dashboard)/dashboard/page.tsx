"use client";
import { DataTable } from "@/components/dashboard/data-table";

import { useAlerts } from "@/hooks/use-alerts";

export default function Page() {
  const { alerts, loading, error, updateAlertStatus } = useAlerts();

  if (loading)
    return (
      <div className="flex justify-center">
        <p>Ładowanie zgłoszeń...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center">
        <p>Błąd: {error}</p>
      </div>
    );

  if (alerts) {
    return <DataTable data={alerts} updateAlertStatus={updateAlertStatus} />;
  }
}
