import { test } from "node:test";
import assert from "node:assert";
import { isValidAddress, isValidAmount } from "../client/lib/validation.js";

test("valid address", () => {
  assert.equal(
    isValidAddress("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    true
  );
});

test("invalid address", () => {
  assert.equal(isValidAddress("abc"), false);
});

test("valid amount", () => {
  assert.equal(isValidAmount("1"), true);
});

test("invalid amount zero", () => {
  assert.equal(isValidAmount("0"), false);
});

test("invalid amount negative", () => {
  assert.equal(isValidAmount("-1"), false);
});

test("address wrong length", () => {
  assert.equal(isValidAddress("0x123"), false);
});

test("amount with spaces", () => {
  assert.equal(isValidAmount(" 5 "), true);
});

test("amount text fails", () => {
  assert.equal(isValidAmount("abc"), false);
});