// this file contains all the authentication files there for the website

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('authToken', token)
}

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('authToken')
}

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('adminToken')
}

export const setAdminToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('adminToken', token)
}

export const removeAdminToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('adminToken')
}

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null
}

export const isAdminAuthenticated = (): boolean => {
  return getAdminToken() !== null
}
