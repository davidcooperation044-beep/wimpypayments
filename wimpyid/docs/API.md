# Wimpy ID API

## Auth helpers

### signup
Creates a Supabase Auth user and sends an email verification request.

```ts
import { signup } from '../src/auth/signup';

await signup({ email: 'user@example.com', password: 'secret123', fullName: 'Ada Lovelace' });
```

### login
Signs in an existing user with email and password.

```ts
import { login } from '../src/auth/login';

await login({ email: 'user@example.com', password: 'secret123' });
```

### logout
Signs out the current user session.

```ts
import { logout } from '../src/auth/logout';

await logout();
```

### verifyEmail
Verifies an email confirmation or recovery token with Supabase Auth.

```ts
import { verifyEmail } from '../src/auth/verifyEmail';

await verifyEmail('otp-token', 'signup');
```

### resetPassword
Sends a password reset email to the user.

```ts
import { resetPassword } from '../src/auth/resetPassword';

await resetPassword('user@example.com');
```

## Profile helpers

### getProfile
Returns the profile row for the authenticated user.

```ts
import { getProfile } from '../src/profile/getProfile';

const profile = await getProfile();
```

### updateProfile
Updates the authenticated user's profile row.

```ts
import { updateProfile } from '../src/profile/updateProfile';

await updateProfile({ full_name: 'Ada', phone: '+2348000000000' });
```
