export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="box-border flex min-h-[calc(100svh-4rem-1px)] -mt-2 md:-mt-4 w-full items-center justify-center px-4 sm:px-6 lg:px-8 py-0">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
