import { getAccounts, fetchBalance, sendTx, fetchNetwork } from "../../lib/api.js";

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
  return val.includes(" - ") ? val.split(" - ")[1] : val;
}

// balance
balanceBtn.addEventListener("click", async () => {
  const address = parseAddress(balanceInput.value);

  try {
    const balance = await fetchBalance(address);
    balanceResult.textContent = `${balance} ETH`;
  } catch {
    balanceResult.textContent = "Invalid address";
  }
});

// send tx
sendBtn.addEventListener("click", async () => {
  const senderAddress = parseAddress(senderInput.value);
  const recipientAddress = parseAddress(recipientInput.value);
  const amount = amountInput.value;

  const senderIndex = accounts.findIndex(a => a.address === senderAddress);

  if (senderIndex === -1) {
    addHistory("Invalid sender", "fail");
    return;
  }

  try {
    const before = await fetchBalance(senderAddress);

    const hash = await sendTx(senderIndex, recipientAddress, amount);

    const after = await fetchBalance(senderAddress);

    addHistory(
      `${amount} ETH → ${recipientAddress}`,
      "success",
      before,
      after,
      hash
    );

  } catch {
    addHistory("Transaction failed", "fail");
  }
});

// history
function addHistory(text, status, before, after, hash) {
  const li = document.createElement("li");

  if (status === "success") {
    li.textContent = `✔ ${text} | ${before} → ${after} (${hash})`;
  } else {
    li.textContent = `❌ ${text}`;
  }

  txHistory.appendChild(li);
}

// latest block
async function updateBlock() {
  const data = await fetchNetwork();
  latestBlock.textContent = data.latestBlock;
}

setInterval(updateBlock, 2000);