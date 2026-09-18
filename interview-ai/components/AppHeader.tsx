import Link from "next/link";

export function AppHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">IA</span>
        Interview AI
      </Link>
      <span className="pill">MVP · práctica</span>
    </header>
  );
}
