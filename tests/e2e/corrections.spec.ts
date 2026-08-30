import { expect, test, type Page } from '@playwright/test';

const adminHeaders = {
  'x-squashie-test-admin': 'admin@example.com',
  'x-squashie-test-admin-id': 'e2e-admin',
};

async function submitCorrection(
  page: Page,
  field: string,
  proposedValue: string,
) {
  await page.goto('/communities/safra-squash-club');
  await page
    .getByRole('link', { name: 'Suggest a correction or verify' })
    .click();
  await expect(page).toHaveURL(
    /\/corrections\?community=safra-squash-club$/,
  );
  await expect(page.getByLabel('Affected community')).toHaveValue(
    'safra-squash-club',
  );
  await page.getByLabel('Information to correct').selectOption(field);
  await page.getByLabel('Proposed correction').fill(proposedValue);
  await page
    .getByLabel('Supporting source URL')
    .fill('https://example.com/current-club-information');
  await page
    .getByLabel('Supporting explanation')
    .fill('The official organizer page now lists this information.');
  await page
    .getByLabel(/Contact information/)
    .fill('submitter@example.com');
  await page
    .getByRole('button', { name: 'Submit for editorial review' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Correction received' }),
  ).toBeVisible();
  const reference = await page.getByText(/^Reference:/).textContent();
  return reference?.replace('Reference:', '').trim() ?? '';
}

test('anonymous visitors cannot view or invoke moderation', async ({
  page,
}) => {
  await page.goto('/admin/moderation');
  await expect(
    page.getByRole('heading', { name: 'Administrator sign-in' }),
  ).toBeVisible();
  await expect(
    page.getByText('Proposed information', { exact: true }),
  ).toHaveCount(0);

  const response = await page.request.post(
    '/api/admin/corrections/00000000-0000-4000-8000-000000000000',
    {
      data: { action: 'approved' },
      headers: { Origin: 'http://localhost:3000' },
    },
  );
  expect(response.status()).toBe(401);
});

test('server rejects an invalid public correction', async ({ page }) => {
  const response = await page.request.post('/api/corrections', {
    data: {
      communitySlug: 'safra-squash-club',
      field: 'slug',
      proposedValue: 'Unsafe slug change',
      sourceUrl: '',
      explanation: '',
      website: '',
    },
    headers: {
      Origin: 'http://localhost:3000',
      'x-vercel-forwarded-for': '198.51.100.80',
    },
  });
  expect(response.status()).toBe(400);
});

test('visitor submits and administrator approves a correction', async ({
  page,
}) => {
  const proposedValue = 'Confirmed court and club costs for the current season';
  const id = await submitCorrection(page, 'indicativeCost', proposedValue);
  expect(id).toMatch(/^[0-9a-f-]{36}$/);

  await page.context().setExtraHTTPHeaders(adminHeaders);
  await page.goto('/admin/moderation');
  const request = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'SAFRA Squash Club' }),
  });
  await expect(request.getByText(proposedValue)).toBeVisible();
  await expect(
    request.getByRole('link', { name: 'Open submitted source' }),
  ).toHaveAttribute('href', 'https://example.com/current-club-information');
  await request
    .getByLabel(/Moderation note/)
    .fill('Official page reviewed in the moderation test.');
  const approvalResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/corrections/${id}`) &&
      response.request().method() === 'POST',
  );
  await request
    .getByRole('button', { name: 'Approve and publish' })
    .click();
  expect((await approvalResponse).status()).toBe(200);
  await expect(
    page.getByRole('status'),
  ).toHaveText('Correction approved and the public listing was updated.');

  const duplicate = await page.request.post(
    `/api/admin/corrections/${id}`,
    {
      data: { action: 'rejected' },
      headers: { Origin: 'http://localhost:3000' },
    },
  );
  expect(duplicate.status()).toBe(409);

  await page.goto('/communities/safra-squash-club');
  await expect(page.getByText(proposedValue)).toBeVisible();
  await expect(
    page.getByText('Official page reviewed in the moderation test.'),
  ).toHaveCount(0);
});

test('administrator rejects a correction without changing public data', async ({
  page,
}) => {
  const proposedValue = 'Incorrect guest price that must not be published';
  await submitCorrection(page, 'guestFee', proposedValue);

  await page.context().setExtraHTTPHeaders(adminHeaders);
  await page.goto('/admin/moderation');
  const request = page.locator('article').filter({
    hasText: proposedValue,
  });
  await request
    .getByLabel(/Moderation note/)
    .fill('Evidence did not support this change.');
  const rejectionResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/admin/corrections/') &&
      response.request().method() === 'POST',
  );
  await request.getByRole('button', { name: 'Reject' }).click();
  expect((await rejectionResponse).status()).toBe(200);
  await expect(
    page.getByRole('status'),
  ).toHaveText('Correction rejected. The public listing was not changed.');

  await page.goto('/communities/safra-squash-club');
  await expect(page.getByText(proposedValue)).toHaveCount(0);
});
