import { test, expect } from "@playwright/test";
import { TEST_USER } from "./global-setup";

test.describe("职位推荐流程", () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto("/login");
    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("职位推荐卡片显示在 dashboard", async ({ page }) => {
    // 简历列表下方应该有职位推荐区域
    await page.waitForLoadState("networkidle");
    // 职位推荐卡片（CardTitle 包含"为你推荐"）
    const recCard = page.locator("text=为你推荐").first();
    await expect(recCard).toBeVisible({ timeout: 5000 });
  });

  test("独立职位页面正常加载", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page).toHaveURL(/\/jobs/, { timeout: 5000 });

    // 页面标题
    await expect(page.getByRole("heading", { name: "职位推荐" })).toBeVisible({ timeout: 5000 });

    // 搜索框
    await expect(page.getByPlaceholder("搜索职位或公司...")).toBeVisible();

    // 技能标签过滤
    await expect(page.getByRole("button", { name: "全部" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go" })).toBeVisible();
  });
});
