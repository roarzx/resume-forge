/**
 * E2E 全局 setup
 * 在所有测试运行前，通过 API 创建一个固定的测试账号
 * 这样认证测试可以稳定地用该账号测试登录
 */
import { chromium, type FullConfig } from "@playwright/test";

const TEST_USER = {
  email: "e2e_fixed@resume-forge.test",
  password: "E2eTest@8888",
  name: "E2E固定测试账号",
};

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 尝试注册固定测试账号（如果已存在会返回 400，忽略即可）
    const resp = await page.request.post(`${baseURL}/api/auth/register`, {
      data: TEST_USER,
    });
    const body = await resp.json();

    if (resp.ok()) {
      console.log("✅ E2E 测试账号已创建:", TEST_USER.email);
    } else if (body.error === "该邮箱已注册") {
      console.log("ℹ️  E2E 测试账号已存在，跳过创建");
    } else {
      console.warn("⚠️  测试账号创建返回:", body);
    }
  } catch (e) {
    console.warn("⚠️  global setup 请求失败（dev server 可能未启动）:", e);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
export { TEST_USER };
