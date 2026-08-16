import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Corners } from "@/components/vintage";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="paper-card relative w-full px-6 py-14 sm:px-12">
        <Corners />
        <p className="archival-label">Error · Folio Not Found</p>
        <h1 className="mt-4 font-display text-6xl font-bold tracking-tight">404</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The page you are looking for is not in this index. It may have been
          misfiled — return to the reading room.
        </p>
        <Button asChild className="btn-editorial mt-8 rounded-[3px]">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
