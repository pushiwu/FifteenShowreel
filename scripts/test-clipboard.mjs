import test from "node:test";
import assert from "node:assert/strict";
import { copyText } from "../src/utils/clipboard.js";

test("copyText uses navigator.clipboard when available", async () => {
  let copied = "";
  const result = await copyText("17674570906", {
    clipboard: { writeText: async (value) => { copied = value; } },
  });

  assert.equal(copied, "17674570906");
  assert.equal(result, true);
});

test("copyText falls back to a provided legacy copier", async () => {
  let copied = "";
  const result = await copyText("17674570906", {
    clipboard: null,
    legacyCopy: (value) => { copied = value; return true; },
  });

  assert.equal(copied, "17674570906");
  assert.equal(result, true);
});

test("copyText reports failure when no copy mechanism succeeds", async () => {
  const result = await copyText("17674570906", {
    clipboard: null,
    legacyCopy: () => false,
  });

  assert.equal(result, false);
});
