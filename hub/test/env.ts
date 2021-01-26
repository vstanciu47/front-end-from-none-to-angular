export const env = Object.freeze({
  URL: e(process.env.URL) || "http://localhost:4200/",
  HEADLESS: (e(process.env.HEADLESS) || "true") === "true",
});

function e(val: string | undefined) {
  return typeof val !== "undefined" ? String(val).trim() : "";
}
