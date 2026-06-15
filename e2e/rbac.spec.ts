import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

const PROTECTED_PATHS = [
  '/dashboard',
  '/agents',
  '/agents/new',
  '/calls',
  '/reports',
  '/users',
  '/users/new',
  '/agents/1/flow',
]

test.describe('Route guards', () => {
  test('unauthenticated users are redirected to login', async ({ page }) => {
    for (const path of PROTECTED_PATHS) {
      await page.goto(path)
      await expect(page).toHaveURL('/')
    }
  })
})

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => login(page, 'admin'))

  test('has full access to agents and users', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Create agent' })).toBeVisible()

    await page.goto('/agents/new')
    await expect(page).toHaveURL('/agents/new')

    await page.goto('/users')
    await expect(page.getByRole('button', { name: 'Create user' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit user' }).first()).toBeVisible()

    await page.goto('/agents/1/flow')
    await expect(page.getByText('View only')).toHaveCount(0)
  })
})

test.describe('Manager', () => {
  test.beforeEach(async ({ page }) => login(page, 'manager'))

  test('can manage agents but not users', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Create agent' })).toBeVisible()

    await page.goto('/agents/new')
    await expect(page).toHaveURL('/agents/new')

    await page.goto('/agents/1/flow')
    await expect(page.getByText('View only')).toHaveCount(0)

    await page.goto('/users')
    await expect(page.getByRole('button', { name: 'Create user' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Edit user' })).toHaveCount(0)

    await page.goto('/users/new')
    await expect(page).toHaveURL('/users')
  })
})

test.describe('Agent', () => {
  test.beforeEach(async ({ page }) => login(page, 'agent'))

  test('cannot create agents, edit flows, or manage users', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Create agent' })).toHaveCount(0)

    await page.goto('/agents/new')
    await expect(page).toHaveURL('/agents')

    await page.goto('/agents/1/flow')
    await expect(page.getByText('View only').first()).toBeVisible()

    await page.goto('/users')
    await expect(page.getByRole('button', { name: 'Create user' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Edit user' })).toHaveCount(0)
  })
})

test.describe('Viewer', () => {
  test.beforeEach(async ({ page }) => login(page, 'viewer'))

  test('matches Agent-level restrictions', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Create agent' })).toHaveCount(0)

    await page.goto('/agents/new')
    await expect(page).toHaveURL('/agents')

    await page.goto('/agents/1/flow')
    await expect(page.getByText('View only').first()).toBeVisible()

    await page.goto('/users/new')
    await expect(page).toHaveURL('/users')
  })
})
