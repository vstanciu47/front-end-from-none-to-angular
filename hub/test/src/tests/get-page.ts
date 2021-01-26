import { browser, by, element } from "protractor";
import { env } from "../../env";
import { authorize } from "../helpers/authorize";

describe("get-page", function () {
  beforeAll(authorize);

  it("should load", async () => {
    await browser.get(`${env.URL}#/get`);
    const get = element(by.css("app-get"));
    expect(await get.getText()).toBe("get works!");
  });
});
