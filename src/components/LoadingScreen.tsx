import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">
          Loading data from neatqueue
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait while we fetch the latest match data...
        </p>
      </div>
    </div>
  );
};
