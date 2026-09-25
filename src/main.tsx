import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { waitForServer } from "./shared/services/serverStatus";

// The API sleeps when idle; start waking it before anyone presses a button.
void waitForServer();

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = createRoot(document.getElementById("root")!);

if (clerkPublishableKey) {
  root.render(<App clerkPublishableKey={clerkPublishableKey} />);
} else {
  console.error("VITE_CLERK_PUBLISHABLE_KEY is not set");
  root.render(
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl text-destructive">CONFIG ERROR</h1>
        <p className="text-muted-foreground leading-relaxed">
          VITE_CLERK_PUBLISHABLE_KEY is not set. Add it to .env (or to the
          hosting environment variables) and rebuild.
        </p>
      </div>
    </div>,
  );
}
