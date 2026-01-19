export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          IronPlate AI
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Hyper-personalized workout and meal plans powered by AI.
          Offline-first fitness app for gym-goers.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button className="touch-target rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Get Started
          </button>
          <button className="touch-target rounded-lg border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
            Learn More
          </button>
        </div>
        <div className="pt-8 text-sm text-muted-foreground">
          <p>✓ Offline-first PWA</p>
          <p>✓ AI-powered personalization</p>
          <p>✓ Mobile-optimized interface</p>
        </div>
      </div>
    </main>
  );
}
