export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="post">
      <button type="submit" className={className ?? "text-sm font-semibold"}>
        Sign out
      </button>
    </form>
  );
}
