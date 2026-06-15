import type { Page } from '@playwright/test'

// One demo account per role from src/data/users.ts — all use password 'changeme'.
export const ROLE_CREDENTIALS = {
  admin:   { email: 'sara.ahmed@octavebytes.com',   password: 'changeme', firstName: 'Sara' },
  manager: { email: 'james.carter@octavebytes.com', password: 'changeme', firstName: 'James' },
  agent:   { email: 'sophie.turner@brightpath.com', password: 'changeme', firstName: 'Sophie' },
  viewer:  { email: 'aria.patel@northwind.io',      password: 'changeme', firstName: 'Aria' },
} as const

export type Role = keyof typeof ROLE_CREDENTIALS

export const login = async (page: Page, role: Role) => {
  const { email, password } = ROLE_CREDENTIALS[role]

  await page.goto('/')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard')
}
