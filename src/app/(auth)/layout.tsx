import { ThemeToggle } from "@/app/_components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elevated/80 p-8 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
