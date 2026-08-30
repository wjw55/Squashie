import { expect, test, type Page } from '@playwright/test';

function communityCard(page: Page, name: string) {
  return page.locator('article').filter({
    has: page.getByRole('heading', { name, exact: true }),
  });
}

async function waitForDiscovery(page: Page) {
  await expect(page.locator('#communities')).toHaveAttribute(
    'data-discovery-ready',
    'true',
  );
}

test('searches for a community and synchronizes the URL', async ({ page }) => {
  await page.goto('/');
  await waitForDiscovery(page);

  await page
    .getByRole('textbox', {
      name: 'Search communities or neighbourhoods',
    })
    .fill('Kent Ridge');

  await expect(
    page.getByRole('heading', { name: 'NUSS Squash Section' }),
  ).toBeVisible();
  await expect(page.getByText('1 of 13 communities')).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get('q'))
    .toBe('Kent Ridge');
});

test('combines the existing discovery filters', async ({ page }) => {
  await page.goto('/');
  await waitForDiscovery(page);

  await page.getByLabel('Region').selectOption('East');
  await page.getByLabel('Community type').selectOption('Private club');
  await page.getByLabel('Access').selectOption('Guests welcome');
  await page.getByLabel('Playing level').selectOption('Beginner');
  await page
    .getByRole('checkbox', { name: 'Structured training' })
    .check();

  await expect(
    page.getByRole('heading', {
      name: 'Singapore Swimming Club Squash',
    }),
  ).toBeVisible();
  await expect(page.getByText('1 of 13 communities')).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get('training'))
    .toBe('true');
});

test('restores filters and comparison state from a shared URL', async ({
  page,
}) => {
  await page.goto(
    '/?q=Club&region=Central&category=Private+club&access=Members&level=Beginner&training=true&compare=british-club-squash,tanglin-club-squash',
  );
  await waitForDiscovery(page);

  await expect(
    page.getByRole('textbox', {
      name: 'Search communities or neighbourhoods',
    }),
  ).toHaveValue('Club');
  await expect(page.getByLabel('Region')).toHaveValue('Central');
  await expect(page.getByLabel('Community type')).toHaveValue('Private club');
  await expect(page.getByLabel('Access')).toHaveValue('Members');
  await expect(page.getByLabel('Playing level')).toHaveValue('Beginner');
  await expect(
    page.getByRole('checkbox', { name: 'Structured training' }),
  ).toBeChecked();
  await expect(page.getByText('2 communities selected')).toBeVisible();
});

test('adds, removes, and limits comparison entries to three', async ({
  page,
}) => {
  await page.goto('/');
  await waitForDiscovery(page);

  const selected = [
    'SAFRA Squash Club',
    'ActiveSG Squash Interest Groups',
    'NUSS Squash Section',
  ];
  for (const name of selected) {
    await communityCard(page, name)
      .getByRole('checkbox', { name: 'Compare' })
      .check();
  }

  await expect(page.getByText('3 communities selected')).toBeVisible();
  await communityCard(page, 'The British Club Squash Section')
    .getByRole('checkbox', { name: 'Compare' })
    .click();

  await expect(page.getByText('3 communities selected')).toBeVisible();
  await expect(
    page.getByText(
      'You can compare up to three communities. Remove one to add another.',
    ),
  ).toHaveText(
    'You can compare up to three communities. Remove one to add another.',
  );
  await expect
    .poll(() => new URL(page.url()).searchParams.get('compare')?.split(','))
    .toHaveLength(3);

  await communityCard(page, 'ActiveSG Squash Interest Groups')
    .getByRole('checkbox', { name: 'Compare' })
    .uncheck();
  await expect(page.getByText('2 communities selected')).toBeVisible();
});

test('navigates from a result card to the community detail page', async ({
  page,
}) => {
  await page.goto('/');
  await waitForDiscovery(page);

  await communityCard(page, 'SAFRA Squash Club')
    .getByRole('link', { name: 'Details' })
    .click();

  await expect(page).toHaveURL(/\/communities\/safra-squash-club$/);
  await expect(
    page.getByRole('heading', { name: 'SAFRA Squash Club' }),
  ).toBeVisible();
});

test('traps dialog focus and restores it after keyboard dismissal', async ({
  page,
}) => {
  await page.goto('/');
  await waitForDiscovery(page);
  await communityCard(page, 'SAFRA Squash Club')
    .getByRole('checkbox', { name: 'Compare' })
    .check();

  const compareButton = page.getByRole('button', { name: 'Compare now' });
  await compareButton.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect
    .poll(() =>
      page.getByRole('dialog').evaluate((dialog) => {
        const active = document.activeElement;
        return active !== null && dialog.contains(active);
      }),
    )
    .toBe(true);
  await page.keyboard.press('Tab');
  await expect
    .poll(() =>
      page.getByRole('dialog').evaluate((dialog) => {
        const active = document.activeElement;
        return active !== null && dialog.contains(active);
      }),
    )
    .toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(compareButton).toBeFocused();
});

test('@mobile completes the main discovery and comparison flow', async ({
  page,
}) => {
  await page.goto('/');
  await waitForDiscovery(page);

  await page
    .getByRole('textbox', {
      name: 'Search communities or neighbourhoods',
    })
    .fill('Cookie');
  const card = communityCard(page, 'Cookie Squash Club');
  await expect(card).toBeVisible();
  await card.getByRole('checkbox', { name: 'Compare' }).check();
  await page.getByRole('button', { name: 'Compare now' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Cookie Squash' }),
  ).toBeVisible();
  await dialog.getByRole('link', { name: 'View full listing' }).click();

  await expect(page).toHaveURL(/\/communities\/cookie-squash-club$/);
  await expect(
    page.getByRole('heading', { name: 'Cookie Squash Club' }),
  ).toBeVisible();
});
