import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ReceiptRow {
  id: string;
  user_id: string;
  user_email?: string | null;
  type: string;
  transaction_reference: string;
  sent_at: string;
  status: string;
  error_message?: string | null;
  created_at: string;
}

export default function EmailReceiptsAdminPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.access_token) {
        setError('Please sign in to access admin data.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/email-receipts?limit=200', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load email receipts');
        setLoading(false);
        return;
      }
      setReceipts(json.receipts || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Admin: Email Receipts</h1>
          <p className="page-copy">Inspect recent email receipts sent by the system.</p>
        </header>

        {error && <p className="form-message error">{error}</p>}

        <section>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>{r.user_id}</td>
                    <td>{r.user_email || 'n/a'}</td>
                    <td>{r.type}</td>
                    <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>{r.transaction_reference}</td>
                    <td>{r.status}</td>
                    <td style={{ color: '#b03' }}>{r.error_message || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
