export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || '';
}

export function isExternalRedirect(target: string | null | undefined) {
  if (!target) return false;
  const appUrl = getAppUrl();
  return !target.startsWith('/') && !target.startsWith(appUrl);
}

export function buildTokenHandoffRedirect(target: string, accessToken: string, refreshToken: string) {
  const separator = target.includes('#') ? '&' : '#';
  return `${target}${separator}access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
}
