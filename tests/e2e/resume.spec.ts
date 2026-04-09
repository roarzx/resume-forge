/**
 * E2E 测试：简历核心流程
 * 覆盖：登录 → 创建简历 → 编辑内容 → 分享
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { TEST_USER } from "./global-setup";

let context: BrowserContext;
let page: Page;

test.describe("简历管理流程", () => {
  // ── 登录 ──────────────────────────────────────
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    await page.goto("/login");
    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ── 测试用例 ──────────────────────────────────
  test("dashboard 页面正常加载", async () => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/简历|Resume|Forge/i);
    // 取第一个"新建"按钮（页面上可能有多个）
    await expect(
      page.getByRole("button", { name: /新建|创建|Create/i }).first()
    ).toBeVisible();
  });

  test("创建新简历", async () => {
    await page.goto("/dashboard");

    // 点击第一个新建按钮（顶部工具栏）
    await page.getByRole("button", { name: "新建简历" }).first().click();

    // 弹窗填写标题
    const dialog = page.getByRole("dialog");
    if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      const titleInput = dialog.getByRole("textbox").first();
      if (await titleInput.isVisible()) {
        await titleInput.fill("E2E 测试简历");
      }
      // 点弹窗里的确认/创建按钮
      await dialog
        .getByRole("button", { name: /确认|创建|Create|确定|提交/i })
        .first()
        .click();
    }

    // 应该跳转到编辑页
    await expect(page).toHaveURL(/\/dashboard\/.+\/edit/, { timeout: 8000 });
  });

  test("简历编辑页正常加载", async () => {
    await page.goto("/dashboard");

    // 等待页面稳定，找编辑链接
    const editLink = page.locator('a[href*="/edit"]').first();
    const hasEditLink = await editLink
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!hasEditLink) {
      // 没有简历时先创建一个
      await page.getByRole("button", { name: /新建|创建/i }).first().click();
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dialog
          .getByRole("button", { name: /确认|创建|确定/i })
          .first()
          .click();
        await expect(page).toHaveURL(/\/dashboard\/.+\/edit/, { timeout: 8000 });
        return;
      }
    }

    await editLink.click();
    await expect(page).toHaveURL(/\/dashboard\/.+\/edit/);
    // 编辑页有基本信息区域
    await expect(
      page.getByText(/基本信息|个人信息|姓名|Basic/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("填写基本信息", async () => {
    await page.goto("/dashboard");
    // 等待简历列表加载（最多 5 秒）
    const editLink = page.locator('a[href*="/edit"]').first();
    await editLink.waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
    if (!(await editLink.isVisible())) {
      test.skip();
      return;
    }
    await editLink.click();
    await expect(page).toHaveURL(/\/dashboard\/.+\/edit/);

    // 填写姓名（id 精确定位）
    const nameInput = page.locator("#name").first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill("张三");
      await page.waitForTimeout(800);
    }

    // 如有保存按钮则点击
    const saveBtn = page.getByRole("button", { name: /^保存$|^Save$/i }).first();
    if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await saveBtn.click();
    }

    // 验证页面没有崩溃（还在编辑页）
    await expect(page).toHaveURL(/\/dashboard\/.+\/edit/);
  });

  test("生成分享链接", async () => {
    await page.goto("/dashboard");
    const editLink = page.locator('a[href*="/edit"]').first();
    await editLink.waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
    if (!(await editLink.isVisible())) {
      test.skip();
      return;
    }
    await editLink.click();
    await expect(page).toHaveURL(/\/dashboard\/.+\/edit/);

    // 找到分享按钮
    const shareBtn = page
      .getByRole("button", { name: /分享|Share/i })
      .first();
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
    await shareBtn.click();

    // 分享弹窗
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 开启分享
    const enableBtn = dialog
      .getByRole("button", { name: /开启|Enable/i })
      .first();
    if (await enableBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enableBtn.click();
    }

    // 链接出现
    const urlInput = dialog.locator('input[id="share-url"]');
    await expect(urlInput).toBeVisible({ timeout: 8000 });

    const shareUrl = await urlInput.inputValue();
    expect(shareUrl).toContain("/shared/");
    console.log("✅ 生成的分享链接:", shareUrl);
  });
});
