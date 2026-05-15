/**
 * Login page has its OWN root layout segment so the admin chrome (header
 * with logout, etc.) doesn't render here. The user isn't authed yet.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
