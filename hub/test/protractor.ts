import { execSync } from "child_process";
import { executablePath } from "puppeteer";
import { Config } from "protractor";
import { env } from "./env";

process.env.CHROME_BIN = executablePath();

execSync("node node_modules/protractor/bin/webdriver-manager update", {
  stdio: "inherit",
});

console.log(env);

export const config: Config = {
  framework: "jasmine",
  specs: ["./src/tests/**/*.ts"],
  allScriptsTimeout: 30 * 1000,
  capabilities: {
    browserName: "chrome",
    "goog:chromeOptions": {
      binary: process.env.CHROME_BIN,
      args: /* https://peter.sh/experiments/chromium-command-line-switches/ */ [
        "--disable-gpu",
        "--no-sandbox",
        "--ignore-certificate-errors",
        "--disable-dev-shm-usage",
        "--enable-features=NetworkService",
      ].concat(env.HEADLESS ? ["--headless"] : []),
    },
  },
};
