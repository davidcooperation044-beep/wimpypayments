import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logout } from '../auth/logout';
import { getProfile } from '../profile/getProfile';
import { updateProfile } from '../profile/updateProfile';
import { buildTokenHandoffRedirect, isExternalRedirect } from '../lib/redirect';
import SealBadge from '../components/SealBadge';

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setFullName(data?.full_name || '');
        setPhone(data?.phone || '');

        const storedRedirect = window.sessionStorage.getItem('wimpyid-post-login-redirect');
        if (storedRedirect) {
          window.sessionStorage.removeItem('wimpyid-post-login-redirect');
          const isExternal = isExternalRedirect(storedRedirect);

          if (isExternal) {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.access_token && session?.refresh_token) {
              window.location.href = buildTokenHandoffRedirect(
                storedRedirect,
                session.access_token,
                session.refresh_token
              );
              return;
            }
          } else {
            window.location.href = storedRedirect;
            return;
          }
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load profile');
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    try {
      const updated = await updateProfile({ full_name: fullName, phone });
      setProfile(updated);
      setMessage('Profile updated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed');
    }
  }

  async function handleLogout() {
    await logout();
    setMessage('Logged out');
  }

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Account</h1>
          <p className="page-copy">Manage your identity details and verification status.</p>
        </header>

        <div className="profile-grid">
          <div>
            <p className="status-line">
              {profile?.email_confirmed_at ? (
                <>
                  Email verified <SealBadge />
                </>
              ) : (
                'Email not verified'
              )}
            </p>
            <p>{profile?.email || 'No profile loaded'}</p>
          </div>

          <label>
            Full name
            <input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <button type="button" className="button button-primary" onClick={handleSave}>
            Save Changes
          </button>

          <button type="button" className="button button-secondary" onClick={handleLogout}>
            Log Out
          </button>

          {message ? <p className={`form-message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
