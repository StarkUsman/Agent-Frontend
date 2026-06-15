import { test, expect } from '@playwright/test'
import { login, ROLE_CREDENTIALS } from './helpers/auth'

test.describe('Login page', () => {
  test('shows a validation error when fields are empty', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Please fill in all fields.')).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('you@example.com').fill('nobody@example.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/')
    const passwordInput = page.getByPlaceholder('••••••••')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    await page.locator('form button[type="button"]').click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  for (const [role, { email, password, firstName }] of Object.entries(ROLE_CREDENTIALS)) {
    test(`logs in as ${role} and lands on the dashboard`, async ({ page }) => {
      await page.goto('/')
      await page.getByPlaceholder('you@example.com').fill(email)
      await page.getByPlaceholder('••••••••').fill(password)
      await page.getByRole('button', { name: 'Sign in' }).click()

      await expect(page).toHaveURL(/\/dashboard$/)
      await expect(page.getByRole('heading', { name: new RegExp(`Good \\w+, ${firstName}`) })).toBeVisible()
    })
  }
})

test.describe('Logout', () => {
  test('returns to login and revokes access to protected routes', async ({ page }) => {
    await login(page, 'admin')

    await page.getByTitle('Sign out').click()
    await expect(page).toHaveURL('/')

    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })
})
