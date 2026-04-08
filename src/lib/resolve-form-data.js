/**
 * Server Actions: `<form action={fn}>` chama `fn(formData)` com um argumento.
 * `useActionState` chama `fn(prevState, formData)` com dois.
 *
 * @param {unknown} prevOrFd
 * @param {unknown} maybeFd
 * @returns {FormData | null}
 */
export function resolveFormData(prevOrFd, maybeFd) {
  if (maybeFd instanceof FormData) return maybeFd;
  if (prevOrFd instanceof FormData) return prevOrFd;
  return null;
}
