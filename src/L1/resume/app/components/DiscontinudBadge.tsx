
import { OctagonAlert } from "lucide-react";

export function DiscontinuedBadge() {
    return (
    <span className="badge bg-neutral text-white py-4 px-4 gap-2">
      <OctagonAlert className="size-3.5" />
      <span>既に廃止されています</span>
    </span>
  );
}