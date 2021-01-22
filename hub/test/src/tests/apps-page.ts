import { browser, by, element } from "protractor";
import { env } from "../../env";

describe("apps-page", function () {
  beforeAll(() => console.log("starting a new test suite"));

  beforeEach(
    async () =>
      await new Promise<void>((done) =>
        setTimeout(() => (console.log("starting a test"), done()), 3000)
      )
  );

  afterEach(() => console.log("finished a test"));

  afterAll(() => console.log("finished a test suite"));

  it("should show login", async () => {
    await browser.get(env.URL);
    const loginComponent = element(by.css("app-login"));
    expect(await loginComponent.isPresent()).toBe(true);
  });

  it("should show login - the wrong way to do it using implicit zone.js", () => {
    browser.get(env.URL);
    const loginComponent = element(by.css("app-login"));
    expect(<boolean>(<any>loginComponent.isPresent())).toBe(true);
  });
});
