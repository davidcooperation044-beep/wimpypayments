import { useEffect, useState } from 'react';
import { logout } from '../auth/logout';
import { getProfile } from '../profile/getProfile';
import { updateProfile } from '../profile/updateProfile';

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
    <div>
      <h1>Account</h1>
      <p>{profile?.email || 'No profile loaded'}</p>
      <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleLogout}>Logout</button>
      <p>{message}</p>
    </div>
  );
}
