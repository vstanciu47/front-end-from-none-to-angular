import { env } from "../../env";
import { browser, by, element, protractor } from "protractor";

export async function authorize() {
  const appsPageUrl = `${env.URL}#/apps`;
  const loginPageUrl = `${env.URL}#/login`;

  const userInput = element(by.css("app-login input[type='text']"));
  const submitButton = element(by.css("app-login input[type='button']"));

  const isLoginPage = () =>
    browser.getCurrentUrl().then((url) => url === loginPageUrl);

  await browser.get(appsPageUrl);

  if (await isLoginPage()) {
    await userInput.clear();
    await userInput.sendKeys("admin");
    await submitButton.click();
  }
}
