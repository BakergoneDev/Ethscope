// ethers
const { ethers } = window;

// address
export function isValidAddress(address) {
  return ethers.isAddress(address);
}

// amount
export function isValidAmount(amount) {
  return Number(amount) > 0;
}