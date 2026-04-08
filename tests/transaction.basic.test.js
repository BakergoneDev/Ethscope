import { test } from "node:test";
import assert from "node:assert";
import { isValidAddress, isValidAmount } from "../client/lib/validation.js";

test("transaction valid input", () => {
  const sender = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const recipient = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

  assert.equal(isValidAddress(sender), true);
  assert.equal(isValidAddress(recipient), true);
  assert.equal(isValidAmount("1"), true);
});

test("transaction invalid input", () => {
  assert.equal(isValidAddress("bad"), false);
  assert.equal(isValidAmount("0"), false);
});