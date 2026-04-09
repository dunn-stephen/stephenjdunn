import { expect, test, type Page } from "@playwright/test";

const paletteShortcut = process.platform === "darwin" ? "Meta+K" : "Control+K";

async function waitForChromeReady(page: Page) {
  await expect(page.locator("footer p").last()).not.toHaveText("-- --- --:--:--");
}

async function gotoAndWait(page: Page, path: string) {
  await page.goto(path);
  await waitForChromeReady(page);
}

async function gotoStandalone(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
}

async function expectNoOuterPortfolioShell(page: Page) {
  await expect(page.getByRole("button", { name: "Open command palette" })).toHaveCount(0);
  await expect(page.getByText("PORTFOLIO · v2.0 · 2026")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
}

async function openPalette(page: Page) {
  const paletteButton = page.locator("header").getByRole("button", {
    name: "Open command palette"
  });

  await expect(paletteButton).toBeVisible();
  await paletteButton.click();
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
}

test.describe("portfolio chrome", () => {
  test("loads the home view inside the shared frame", async ({ page }) => {
    await gotoAndWait(page, "/");

    await expect(page).toHaveTitle("Stephen J. Dunn");
    await expect(page.getByText("PORTFOLIO · v2.0 · 2026")).toBeVisible();
    await expect(page.locator("main").getByText("Senior Product Consultant", { exact: true })).toBeVisible();
    await expect(page.locator("main").getByText("Current Role", { exact: true })).toBeVisible();
    await expect(page.locator("main").getByText("Skill Ratings", { exact: true })).toBeVisible();
  });

  test("opens and closes the command palette", async ({ page }) => {
    await gotoAndWait(page, "/");

    const dialog = page.getByRole("dialog", { name: "Command palette" });

    await openPalette(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("navigates by keyboard shortcut and command palette", async ({ page }) => {
    await gotoAndWait(page, "/");

    await page.locator("main").click();
    await page.keyboard.press("3");
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.getByText("Certificates")).toBeVisible();
    await expect(page.getByRole("link", { name: /Notion Academy Workflows credential link/i })).toBeVisible();

    await page.keyboard.press(paletteShortcut);
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await page.getByLabel("Command palette search").fill("go to contact");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByText("Quick Message")).toBeVisible();
  });

  test("redirects space invaders palette searches to the dedicated subdomain", async ({ page }) => {
    await gotoAndWait(page, "/");

    await page.route("https://space.stephenjdunn.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Space Invaders</title><main>Space Invaders</main>"
      });
    });

    await page.keyboard.press(paletteShortcut);
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await page.getByLabel("Command palette search").fill("space invaders");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("https://space.stephenjdunn.com/");
    await expect(page.getByText("Space Invaders", { exact: true })).toBeVisible();
  });

  test("routes Weather palette searches to the dedicated subdomain", async ({ page }) => {
    await gotoAndWait(page, "/");

    await page.route("https://weather.stephenjdunn.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Weather</title><main>Weather Uplink</main>"
      });
    });

    await page.keyboard.press(paletteShortcut);
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await page.getByLabel("Command palette search").fill("forecast");
    await expect(page.getByRole("button", { name: /open weather uplink/i })).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("https://weather.stephenjdunn.com/");
    await expect(page.getByText("Weather Uplink", { exact: true })).toBeVisible();
  });

  test("routes Star Wars palette searches to the dedicated subdomain", async ({ page }) => {
    await gotoAndWait(page, "/");

    await page.route("https://starwars.stephenjdunn.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Star Wars</title><main>Star Wars Console</main>"
      });
    });

    await page.keyboard.press(paletteShortcut);
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await page.getByLabel("Command palette search").fill("ascii");
    await expect(page.getByRole("button", { name: /open star wars crawl/i })).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("https://starwars.stephenjdunn.com/");
    await expect(page.getByText("Star Wars Console", { exact: true })).toBeVisible();
  });

  test("opens a project detail page and returns to the directory", async ({ page }) => {
    await gotoAndWait(page, "/projects");

    await expect(page.getByText("3 Projects · Click for Detail")).toBeVisible();
    await page.getByRole("link", { name: /vocab-monster/i }).click();

    await expect(page).toHaveURL(/\/projects\/vocab-monster$/);
    await expect(page.getByRole("heading", { name: "Vocab Monster" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Projects/i })).toBeVisible();

    await page.getByRole("link", { name: /Back to Projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("opens a blog post from the archive", async ({ page }) => {
    await gotoAndWait(page, "/blog");

    await expect(page.getByText("3 Posts · Latest First")).toBeVisible();
    await page
      .getByRole("link", { name: /Debugging a Live Content Rendering Bug/i })
      .click();

    await expect(page).toHaveURL(/\/blog\/live-content-bug$/);
    await expect(page.getByText("The bug looked cosmetic at first")).toBeVisible();
    await expect(page.getByText("Previous", { exact: true })).toBeVisible();
    await expect(page.getByText("Next", { exact: true })).toBeVisible();
  });

  test("collapses the desktop navigation rail", async ({ page }) => {
    await gotoAndWait(page, "/");

    const collapseButton = page.getByRole("button", { name: "Collapse navigation" });

    await expect(collapseButton).toBeVisible();
    await collapseButton.click();

    await expect(page.getByRole("button", { name: "Expand navigation" })).toBeVisible();
    await expect(page.getByRole("complementary").getByText("STEPHENJDUNN", { exact: true })).toBeHidden();
  });

  test("renders the standalone space invaders page inside the branded frame", async ({ page }) => {
    await gotoStandalone(page, "/easter-eggs/space-invaders/index.html");
    await expectNoOuterPortfolioShell(page);

    const gameFrame = page.locator('iframe[title="Space Invaders"]');

    await expect(gameFrame).toBeVisible();
    await expect(gameFrame).toHaveAttribute("src", "/easter-eggs/space-invaders/game.html");
    await expect(page.frameLocator('iframe[title="Space Invaders"]').locator("#game")).toBeVisible();
  });

  test("renders the standalone weather page inside the branded frame", async ({ page }) => {
    await gotoStandalone(page, "/easter-eggs/weather/index.html");
    await expectNoOuterPortfolioShell(page);

    await expect(page.getByText("Weather Uplink", { exact: true })).toBeVisible();
    await expect(page.getByText("Dedicated Experience", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Search weather by city or ZIP code")).toBeVisible();
  });

  test("renders the standalone star wars page inside the branded frame", async ({ page }) => {
    await gotoStandalone(page, "/easter-eggs/star-wars/index.html");
    await expectNoOuterPortfolioShell(page);

    const starWarsFrame = page.locator('iframe[title="Star Wars"]');

    await expect(page.getByText("Star Wars Console", { exact: true })).toBeVisible();
    await expect(starWarsFrame).toBeVisible();
    await expect(starWarsFrame).toHaveAttribute("src", "/easter-eggs/star-wars-raw/index.html");
  });
});
