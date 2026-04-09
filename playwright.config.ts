import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 测试文件目录
  testDir: "./tests/e2e",

  // 全局 setup：测试前自动创建测试账号
  globalSetup: "./tests/e2e/global-setup.ts",

  // 每个测试最长运行时间
  timeout: 30_000,

  // 测试失败时自动重试 1 次（CI 环境建议设 2）
  retries: process.env.CI ? 2 : 0,

  // 并发 worker 数（本地 1 个，避免数据冲突）
  workers: 1,

  // 测试报告：本地 html 报告 + 终端 list
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  use: {
    // 测试目标：本地 dev server
    baseURL: "http://localhost:3000",

    // 失败时自动截图
    screenshot: "only-on-failure",

    // 失败时保存页面追踪（方便排查）
    trace: "retain-on-failure",

    // 浏览器语言
    locale: "zh-CN",
  },

  projects: [
    // 桌面端 Chrome
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // 移动端（可选，先注释掉，稳定后再开启）
    // {
    //   name: "mobile",
    //   use: { ...devices["iPhone 13"] },
    // },
  ],

  // 测试前自动启动 Next.js dev server（如果没有在跑）
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true, // 本地已有 dev server 时直接复用
    timeout: 30_000,
  },
});
