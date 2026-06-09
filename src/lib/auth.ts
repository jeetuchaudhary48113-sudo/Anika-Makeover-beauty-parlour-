/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a SHA-256 hash of a string to store or verify the admin password securely in client.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Checks if the user is currently authenticated locally as an admin.
 */
export function isSessionAuthenticated(): boolean {
  return localStorage.getItem('anika_admin_auth_active') === 'true';
}

/**
 * Activates local admin session.
 */
export function setSessionAuthenticated(active: boolean): void {
  if (active) {
    localStorage.setItem('anika_admin_auth_active', 'true');
    localStorage.setItem('anika_admin_auth_time', String(Date.now()));
  } else {
    localStorage.removeItem('anika_admin_auth_active');
    localStorage.removeItem('anika_admin_auth_time');
  }
}
