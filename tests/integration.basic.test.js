import { test } from "node:test";
import assert from "node:assert";
import { isValidAddress } from "../client/lib/validation.js";

test("integration: valid address flows", () => {
  const address = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  const result = isValidAddress(address);

  assert.equal(result, true);
});