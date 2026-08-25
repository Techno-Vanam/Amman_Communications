/* Root layout — no extra wrappers needed, LandingPage handles its own nav/footer */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
