import Breadcrumb from "@/components/Breadcrumb";

export function PlaceholderPage({ title, testId }: { title: string; testId: string }) {
  return (
    <main data-testid={testId} className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-neutral-600">This page is coming soon.</p>
    </main>
  );
}
