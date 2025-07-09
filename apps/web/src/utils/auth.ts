// Auth utilities for client-side session management

export function handleAuthError(error: any, signOut: () => void) {
  if (error?.data?.code === 'UNAUTHORIZED' || error?.status === 401) {
    // Clear local session and redirect to login
    localStorage.removeItem('mini-trello-session');
    localStorage.removeItem('mini-trello-session-expiry');
    signOut();
  }
}

export function isAuthError(error: any): boolean {
  return error?.data?.code === 'UNAUTHORIZED' || error?.status === 401;
}
