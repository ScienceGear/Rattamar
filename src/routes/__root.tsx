import { Outlet, Link, createRootRoute } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Back to Rattamar
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 py-2.5 text-center text-xs text-muted-foreground backdrop-blur">
        Made by <a href="https://sciencegear.tech" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">ScienceGear 2026</a>
      </footer>
    </div>
  );
}
