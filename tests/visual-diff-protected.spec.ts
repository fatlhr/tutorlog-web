import { test } from '@playwright/test';

const DESIGN_BASE = 'http://localhost:4000';
const SESSION_TOKEN = 'eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpVd1ptWmlaV1JqTFRFeU56Z3RORE5pTVMxaU4yUTNMVGhrT0dKaU9HRTNaV0UxT1NJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMnB5ZEhSdmVtTmhZbU53YTJ0dGVHUnhkMlJxTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lJMlptSTROV0UzTkMwM09XVTBMVFEyT0RNdFlXRm1OQzFpWWpKbE9HVXhNbUkwTnpZaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemd6TkRrNE9EY3dMQ0pwWVhRaU9qRTNPRE0wT1RVeU56QXNJbVZ0WVdsc0lqb2labUYwYVdoaGNtRm9iV0YwTWpVM1FHZHRZV2xzTG1OdmJTSXNJbkJvYjI1bElqb2lJaXdpWVhCd1gyMWxkR0ZrWVhSaElqcDdJbkJ5YjNacFpHVnlJam9pWlcxaGFXd2lMQ0p3Y205MmFXUmxjbk1pT2xzaVpXMWhhV3dpWFgwc0luVnpaWEpmYldWMFlXUmhkR0VpT25zaVpXMWhhV3dpT2lKbVlYUnBhR0Z5WVdodFlYUXlOVGRBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWMzVmlJam9pTm1aaU9EVmhOelF0TnpsbE5DMDBOamd6TFdGaFpqUXRZbUl5WlRobE1USmlORGMySW4wc0luSnZiR1VpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWVdGc0lqb2lZV0ZzTVNJc0ltRnRjaUk2VzNzaWJXVjBhRzlrSWpvaWJXRm5hV05zYVc1cklpd2lkR2x0WlhOMFlXMXdJam94Tnpnek16WXpOamt3ZlYwc0luTmxjM05wYjI1ZmFXUWlPaUk0WVRnd1lUbGlOUzFpTldZeExUUXpNemd0WVdObFl5MWpORFpsWVRWalpUUXlaakFpTENKcGMxOWhibTl1ZVcxdmRYTWlPbVpoYkhObGZRLlRaVnQ1VU1rWndGckU0X1lmcmwweGZkODdXVjdidHU1SXZ0Q3d3el9xTF9DdGhjS0dXaUtBa3FnTEM2T082WG1HNWNaYlNxaURkbnV5cnZEbzQwWUhRIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3ODM0OTg4NzAsInJlZnJlc2hfdG9rZW4iOiJndW51dzd4N3Fja28iLCJ1c2VyIjp7ImlkIjoiNmZiODVhNzQtNzllNC00NjgzLWFhZjQtYmIyZThlMTJiNDc2IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJmYXRpaGFyYWhtYXQyNTdAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wNi0wOFQwODoxNjo0NS4wNTU5MVoiLCJwaG9uZSI6IiIsImNvbmZpcm1hdGlvbl9zZW50X2F0IjoiMjAyNi0wNi0wOFQwODoxNjoxMC43MDI2NzdaIiwiY29uZmlybWVkX2F0IjoiMjAyNi0wNi0wOFQwODoxNjo0NS4wNTU5MVoiLCJyZWNvdmVyeV9zZW50X2F0IjoiMjAyNi0wNy0wNlQxODo0Nzo1NS44MzYzMDRaIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wNy0wNlQxODo0ODowOS45NzM2WiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZmF0aWhhcmFobWF0MjU3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjZmYjg1YTc0LTc5ZTQtNDY4My1hYWY0LWJiMmU4ZTEyYjQ3NiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjAxNGQyZDQwLWM2ZGMtNDEyNS04NjUxLTc4NGE3ZDkyZmI2NSIsImlkIjoiNmZiODVhNzQtNzllNC00NjgzLWFhZjQtYmIyZThlMTJiNDc2IiwidXNlcl9pZCI6IjZmYjg1YTc0LTc5ZTQtNDY4My1hYWY0LWJiMmU4ZTEyYjQ3NiIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJmYXRpaGFyYWhtYXQyNTdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNmZiODVhNzQtNzllNC00NjgzLWFhZjQtYmIyZThlMTJiNDc2In0sInByb3ZpZGVyIjoiZW1haWwiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA2LTA4VDA4OjE2OjEwLjY5NjA4NloiLCJjcmVhdGVkX2F0IjoiMjAyNi0wNi0wOFQwODoxNjoxMC42OTYxMzJaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDYtMDhUMDg6MTY6MTAuNjk2MTMyWiIsImVtYWlsIjoiZmF0aWhhcmFobWF0MjU3QGdtYWlsLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDYtMDhUMDg6MTY6MTAuNjczNTAzWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTA3LTA4VDA3OjIxOjA4LjM3OTkzOFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0';

const MOBILE_ARTBOARDS = [
  { id: 'mob-rekap', route: 'app-rekap' },
  { id: 'mob-invoice', route: 'app-invoice' },
];

test.describe('Design Artboard Screenshots — Protected Mobile', () => {
  for (const artboard of MOBILE_ARTBOARDS) {
    test(`design mobile: ${artboard.route}`, async ({ page }) => {
      await page.setViewportSize({ width: 420, height: 900 });
      await page.goto(`${DESIGN_BASE}/renderer-mobile.html`);

      await page.waitForFunction(
        (id) => {
          const el = document.querySelector(`[data-artboard-id="${id}"]`);
          return el && el.children.length > 0;
        },
        artboard.id,
        { timeout: 20000 }
      );

      const artboardEl = page.locator(`[data-artboard-id="${artboard.id}"]`);
      await artboardEl.waitFor({ state: 'visible' });

      await artboardEl.screenshot({
        path: `design-screenshots/${artboard.route}-390.png`,
      });
    });
  }
});

test.describe('Protected Routes — Live Screenshots', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'sb-jrttozcabcpkkmxdqwdj-auth-token',
        value: SESSION_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  });

  const PROTECTED_ROUTES = [
    { name: 'app-rekap', path: '/app/rekap' },
    { name: 'app-invoice', path: '/app/invoice' },
  ];

  for (const route of PROTECTED_ROUTES) {
    test(`live: ${route.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `live-screenshots/${route.name}-390.png`,
        fullPage: true,
      });
    });
  }
});
