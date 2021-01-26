import { browser, by, element } from "protractor";
import { env } from "../../env";
import { authorize } from "../helpers/authorize";

describe("lock-page", function () {
  beforeAll(authorize);

  it("should load", async () => {
    await browser.get(`${env.URL}#/lock`);
    const get = element(by.css("app-lock"));
    expect(await get.getText()).toBe("lock works!");
  });
});
