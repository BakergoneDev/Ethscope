import { accounts, provider, getWallet } from "./ethereum.js";

const { ethers } = window;

export async function fetchBalance(address) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}


export async function sendTx(index, to, amount) {
  const wallet = getWallet(accounts[index].privateKey);

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amount)
  });

  await tx.wait();

  return tx.hash;
}


export async function fetchNetwork() {
  const network = await provider.getNetwork();
  const block = await provider.getBlockNumber();

  return {
    chainId: network.chainId.toString(),
    latestBlock: block,
    rpcUrl: "http://127.0.0.1:8545"
  };
}


export function getAccounts() {
  return accounts;
}