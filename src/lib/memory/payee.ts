export function payeeKey(method: string, digits: string): string {
  return `payee:${method}:${digits.replace(/\D/g, "")}`;
}

export function parsePayee(key: string, method: string): string | null {
  const prefix = `payee:${method}:`;
  if (!key.startsWith(prefix)) return null;
  const value = key.slice(prefix.length);
  return value || null;
}
