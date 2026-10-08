/**
 * RFC 4122 v4 UUID. Math.random is acceptable here: the id only groups chat
 * turns and is not a secret (the server authenticates via the bearer token).
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
