import { isValidAddress, isValidAmount } from "../client/lib/validation.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// tests
try {
  console.log("Running tests...");

  // valid address
  assert(
    isValidAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
    "Valid address failed"
  );

  // invalid address
  assert(!isValidAddress("abc"), "Invalid address passed");

  // valid amount
  assert(isValidAmount("1"), "Valid amount failed");

  // invalid amount
  assert(!isValidAmount("0"), "Invalid amount passed");

  console.log("✅ All tests passed");
} catch (err) {
  console.error("❌ Test failed:", err.message);
}