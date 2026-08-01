import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>WimpyID</h1>
      <nav>
        <Link href="/signup">Signup</Link> | <Link href="/login">Login</Link> | <Link href="/account">Account</Link>
      </nav>
    </div>
  );
}
