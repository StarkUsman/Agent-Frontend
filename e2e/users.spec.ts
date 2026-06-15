import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Users module (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin')
    await page.goto('/users')
  })

  test('lists users with pagination', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByText(/Showing 1.6 of 14 users/)).toBeVisible()

    await page.getByRole('button', { name: '2' }).click()
    await expect(page.getByText(/Showing 7.12 of 14 users/)).toBeVisible()
  })

  test('filters via search', async ({ page }) => {
    await page.getByPlaceholder('Search users...').fill('sophie')

    await expect(page.getByText('Sophie Turner')).toBeVisible()
    await expect(page.getByText(/Showing 1.1 of 1 users/)).toBeVisible()
  })

  test('creates, edits, and deletes a user', async ({ page }) => {
    // ── Create ──
    await page.getByRole('button', { name: 'Create user' }).click()
    await expect(page).toHaveURL(/\/users\/new$/)

    await page.getByPlaceholder('Jane', { exact: true }).fill('Test')
    await page.getByPlaceholder('Doe', { exact: true }).fill('User')
    await page.getByPlaceholder('jane.doe', { exact: true }).fill('test.user')
    await page.getByPlaceholder('jane.doe@example.com').fill('test.user@example.com')
    await page.getByPlaceholder('Enter a password').fill('changeme')
    await page.getByPlaceholder('Acme Corporation').fill('Test Org')
    await page.getByRole('button', { name: 'Create user' }).click()

    await expect(page).toHaveURL(/\/users$/)
    await page.getByPlaceholder('Search users...').fill('test.user')
    await expect(page.getByText('Test User')).toBeVisible()

    // ── Edit ──
    await page.getByRole('row', { name: /Test User/ }).getByRole('button', { name: 'Edit user' }).click()
    await expect(page).toHaveURL(/\/users\/\d+\/edit$/)
    await expect(page.getByPlaceholder('Jane', { exact: true })).toHaveValue('Test')

    await page.getByPlaceholder('Acme Corporation').fill('Updated Org')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page).toHaveURL(/\/users$/)
    await page.getByPlaceholder('Search users...').fill('test.user')
    await expect(page.getByText('Updated Org')).toBeVisible()

    // ── Delete ──
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('row', { name: /Test User/ }).getByRole('button', { name: 'Delete user' }).click()
    await expect(page.getByText('Test User')).toHaveCount(0)
  })
})
