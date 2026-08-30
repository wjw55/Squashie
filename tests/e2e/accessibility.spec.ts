import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function waitForDiscovery(page: Page) {
  await expect(page.locator('#communities')).toHaveAttribute(
    'data-discovery-ready',
    'true',
  );
}

async function expectNoBlockingViolations(
  page: Page,
  testInfo: TestInfo,
  state: string,
) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );

  if (results.violations.length > 0) {
    await testInfo.attach(`axe-${state}.json`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  }
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test('public pages have no serious or critical axe violations', async ({
  page,
}, testInfo) => {
  const pages = [
    ['home', '/'],
    ['methodology', '/methodology'],
    ['community-detail', '/communities/safra-squash-club'],
  ] as const;

  for (const [name, path] of pages) {
    await page.goto(path);
    await expectNoBlockingViolations(page, testInfo, name);
  }
});

test('filtered and empty discovery states pass axe checks', async ({
  page,
}, testInfo) => {
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
  await expectNoBlockingViolations(page, testInfo, 'filtered-discovery');

  await page
    .getByRole('textbox', {
      name: 'Search communities or neighbourhoods',
    })
    .fill('');
  await page.getByLabel('Region').selectOption('North');
  await page.getByLabel('Community type').selectOption('Private club');
  await expect(
    page.getByRole('heading', { name: 'No exact match yet' }),
  ).toBeVisible();
  await expectNoBlockingViolations(page, testInfo, 'empty-discovery');
});

test('comparison dialog passes axe checks', async ({ page }, testInfo) => {
  await page.goto('/');
  await waitForDiscovery(page);
  const card = page.locator('article').filter({
    has: page.getByRole('heading', {
      name: 'SAFRA Squash Club',
      exact: true,
    }),
  });
  await card.getByRole('checkbox', { name: 'Compare' }).check();
  await page.getByRole('button', { name: 'Compare now' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await expectNoBlockingViolations(page, testInfo, 'comparison-dialog');
});
