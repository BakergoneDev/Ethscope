import { getAccounts, fetchBalance, sendTx, fetchNetwork } from "../../lib/api.js";
import { isValidAddress, isValidAmount } from "../../lib/validation.js";
import { provider } from "../../lib/ethereum.js";

// elements
const senderInput = document.getElementById("sender-input");
const recipientInput = document.getElementById("recipient-input");
const clearSender = document.getElementById("clear-sender");
const clearRecipient = document.getElementById("clear-recipient");
const clearAll = document.getElementById("clear-all");

const balanceSelect = document.getElementById("balance-account");
const balanceInput = document.getElementById("balance-input");
const clearBalance = document.getElementById("clear-balance");
const balanceBtn = document.getElementById("get-balance-btn");
const balanceResult = document.getElementById("balance-result");

const sendBtn = document.getElementById("send-btn");
const amountInput = document.getElementById("amount");

const txHistory = document.getElementById("tx-history");
const latestBlock = document.getElementById("latest-block");
const connectionEl = document.getElementById("connection-status");
const networkEl = document.getElementById("network-id");
const rpcEl = document.getElementById("rpc-url");

// data
const accounts = getAccounts();

// datalist
const datalist = document.getElementById("accounts-list");

accounts.forEach((acc, i) => {
  const option = document.createElement("option");
  option.value = `${i} - ${acc.address}`;
  datalist.appendChild(option);
});

// balance dropdown → input
balanceSelect.addEventListener("change", () => {
  balanceInput.value = accounts[balanceSelect.value].address;
});

// sender dropdown → input
senderInput.addEventListener("change", () => {
  const val = senderInput.value.split(" - ")[1];
  if (val) senderInput.value = val;
});

// recipient dropdown → input
recipientInput.addEventListener("change", () => {
  const val = recipientInput.value.split(" - ")[1];
  if (val) recipientInput.value = val;
});

// clear buttons
clearSender.addEventListener("click", () => senderInput.value = "");
clearRecipient.addEventListener("click", () => recipientInput.value = "");
clearBalance.addEventListener("click", () => balanceInput.value = "");

clearAll.addEventListener("click", () => {
  senderInput.value = "";
  recipientInput.value = "";
  balanceInput.value = "";
  amountInput.value = "";
  balanceResult.textContent = "-";
  txHistory.innerHTML = "";
});

// helper
function parseAddress(val) {
  const addr = val.includes(" - ") ? val.split(" - ")[1] : val;
  return addr.trim().toLowerCase();
}

// balance
balanceBtn.addEventListener("click", async () => {
  const address = parseAddress(balanceInput.value);

  if (!isValidAddress(address)) {
    balanceResult.textContent = "Invalid address";
    return;
  }

  try {
    const balance = await fetchBalance(address);
    balanceResult.textContent = `${balance} ETH`;
  } catch {
    balanceResult.textContent = "Error";
  }
});

// send tx
sendBtn.addEventListener("click", async () => {
  const senderAddress = parseAddress(senderInput.value);
  const recipientAddress = parseAddress(recipientInput.value);
  const amount = amountInput.value;

  // Validation
  if (!isValidAddress(senderAddress)) {
    addHistory("Invalid sender address", "fail");
    return;
  }

  if (!isValidAddress(recipientAddress)) {
    addHistory("Invalid recipient address", "fail");
    return;
  }

  if (!isValidAmount(amount)) {
    addHistory("Invalid amount", "fail");
    return;
  }

  const senderIndex = accounts.findIndex(
  a => a.address.toLowerCase() === senderAddress.toLowerCase()
);

  if (senderIndex === -1) {
    addHistory("Invalid sender", "fail");
    return;
  }

  try {
    const before = await fetchBalance(senderAddress);
    const recipientBefore = await fetchBalance(recipientAddress);

    const hash = await sendTx(senderIndex, recipientAddress, amount);

    await provider.waitForTransaction(hash);

    const after = await fetchBalance(senderAddress);
    const recipientAfter = await fetchBalance(recipientAddress);

  addHistory(
  `${amount} ETH → ${recipientAddress}`,
  "success",
  {
    sender: senderAddress,
    recipient: recipientAddress,
    senderBefore: before,
    senderAfter: after,
    recipientBefore,
    recipientAfter,
    hash
  }
);

  } catch {
    addHistory("Transaction failed", "fail");
  }
});

// history
function addHistory(text, status, data) {
  const li = document.createElement("li");

  if (status === "success") {
    li.textContent =
      `✔ ${data.sender} → ${data.recipient} | ` +
      `S: ${Number(data.senderBefore).toFixed(6)} → ${Number(data.senderAfter).toFixed(6)} | ` +
      `R: ${Number(data.recipientBefore).toFixed(6)} → ${Number(data.recipientAfter).toFixed(6)} | ` +
      `(${data.hash})`;

    logStatus("Transaction success");
  } else {
    li.textContent = `❌ ${text}`;
    logStatus(text);
  }

  txHistory.appendChild(li);
}

// Status log
function logStatus(msg) {
  const log = document.getElementById("status-log");

  const li = document.createElement("li");
  li.textContent = msg;

  log.appendChild(li);
}

// latest block
async function updateBlock() {
  const data = await fetchNetwork();
  latestBlock.textContent = data.latestBlock;
  connectionEl.textContent = "connected";
  networkEl.textContent = `Anvil (${data.chainId})`;
  rpcEl.textContent = "http://127.0.0.1:8545";
}

setInterval(updateBlock, 2000);