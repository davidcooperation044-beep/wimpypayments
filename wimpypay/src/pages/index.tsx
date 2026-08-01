import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>WimpyPay</h1>
      <nav>
        <Link href="/dashboard">Dashboard</Link> | <Link href="/plans">Plans</Link>
      </nav>
    </div>
  );
}
