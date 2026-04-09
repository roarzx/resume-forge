/**
 * E2E 测试：认证流程
 * 覆盖：注册（新邮箱）→ 登录（固定账号）→ 错误密码 → 未登录保护
 */
import { test, expect } from "@playwright/test";
import { TEST_USER } from "./global-setup";

// 每次运行用唯一邮箱注册，避免数据库重复
const newUserEmail = `e2e_${Date.now()}@test.com`;
const newUserPassword = "NewUser@8888"; // 满足 min 8 字符
const newUserName = "E2E新用户";

test.describe("认证流程", () => {
  test("注册新用户并自动跳转 dashboard", async ({ page }) => {
    await page.goto("/register");

    await page.locator("#name").fill(newUserName);
    await page.locator("#email").fill(newUserEmail);
    await page.locator("#password").fill(newUserPassword);
    await page.locator("#confirmPassword").fill(newUserPassword);

    await page.getByRole("button", { name: "注册" }).click();

    // 注册成功 → 自动登录 → 跳转 dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 12000 });
  });

  test("登录固定测试账号", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "登录" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/简历|Resume/i).first()).toBeVisible();
  });

  test("密码错误时登录失败，留在登录页", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill("wrong_password_xyz");
    await page.getByRole("button", { name: "登录" }).click();

    // 留在 /login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    // toast title "登录失败"（用 exact: true 避免多个元素 strict mode 报错）
    await expect(page.getByText("登录失败", { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("未登录访问 dashboard 被重定向到登录页", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
