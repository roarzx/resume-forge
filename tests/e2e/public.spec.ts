/**
 * E2E 测试：公开页面
 * 覆盖：首页、模板展示页（无需登录）
 */
import { test, expect } from "@playwright/test";

test.describe("公开页面", () => {
  test("首页正常加载", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/简历|Resume|Forge/i);
    // 有明显的 CTA 按钮（页面上可能有多个）
    await expect(
      page.getByRole("link", { name: /开始|注册|免费|Start|Get started/i }).first()
    ).toBeVisible();
  });

  test("登录页正常加载", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/邮箱|Email/i)).toBeVisible();
    await expect(page.getByLabel(/密码|Password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /登录|Sign in/i })
    ).toBeVisible();
  });

  test("注册页正常加载", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/邮箱|Email/i)).toBeVisible();
    await expect(page.getByLabel(/密码|Password/i).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /注册|Register/i })
    ).toBeVisible();
  });

  test("模板展示页正常加载", async ({ page }) => {
    await page.goto("/templates");
    // 有模板预览卡片
    await expect(page.locator("body")).toBeVisible();
  });
});
