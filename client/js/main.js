import { getAccounts, fetchBalance, sendTx, fetchNetwork } from "../../lib/api.js";
import { isValidAddress, isValidAmount } from "../../lib/validation.js";
import { provider } from "../../lib/ethereum.js";
let lastBlock = null;

console.log("[Ethscope][app] Initialization started");

const senderInput = document.getElementById("sender-input");
const recipientInput = document.getElementById("recipient-input");
const clearSender = document.getElementById("clear-sender");
const clearRecipient = document.getElementById("clear-recipient");
const clearAll = document.getElementById("clear-all");

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

const accounts = getAccounts();

const datalist = document.getElementById("accounts-list");

accounts.forEach((acc, i) => {
  const option = document.createElement("option");
  option.value = `${i} - ${acc.address}`;
  datalist.appendChild(option);
});


senderInput.addEventListener("change", () => {
  const val = senderInput.value.split(" - ")[1];
  if (val) senderInput.value = val;
});

recipientInput.addEventListener("change", () => {
  const val = recipientInput.value.split(" - ")[1];
  if (val) recipientInput.value = val;
});

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

function parseAddress(val) {
  const addr = val.includes(" - ") ? val.split(" - ")[1] : val;
  return addr.trim().toLowerCase();
}

balanceBtn.addEventListener("click", async () => {
  console.log("[Ethscope][ui] Balance button clicked");
  const address = parseAddress(balanceInput.value);

  if (!isValidAddress(address)) {
    balanceResult.textContent = "Invalid address";
    return;
  }

  try {
    const balance = await fetchBalance(address);
    balanceResult.textContent = `${balance} ETH`;

    console.log("[Ethscope][balance]", address, balance);
  } catch {
    balanceResult.textContent = "Error";
  }
    
});

sendBtn.addEventListener("click", async () => {
  console.log("[Ethscope][ui] Send transaction clicked");
  
  const senderAddress = parseAddress(senderInput.value);
  const recipientAddress = parseAddress(recipientInput.value);
  const amount = amountInput.value;

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
  console.log("[Ethscope][tx] sent:", hash);

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

function logStatus(msg) {
  const log = document.getElementById("status-log");

  const li = document.createElement("li");
  li.textContent = msg;

  const empty = document.getElementById("history-empty");
if (empty) empty.style.display = "none";

  log.appendChild(li);

console.log("[Ethscope][status]", msg);
}

async function updateBlock() {
  const data = await fetchNetwork();
  latestBlock.textContent = data.latestBlock;

  if (data.latestBlock !== lastBlock) {
    console.log("[Ethscope][blocks] Latest block:", data.latestBlock);
    lastBlock = data.latestBlock;
  }

  connectionEl.textContent = "connected";
  networkEl.textContent = `Anvil (${data.chainId})`;
  rpcEl.textContent = "http://127.0.0.1:8545";
  
}

updateBlock();
setInterval(updateBlock, 5000);

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

if (savedTheme === "dark") {
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");

  const newTheme = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
});

console.log("[Ethscope][app] Initialization completed");