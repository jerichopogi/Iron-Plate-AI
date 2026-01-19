'use client';

export default function Offline() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl">📡</div>
        <h1 className="text-3xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground">
          No worries! Your workout data is saved locally and will sync when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="touch-target rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
