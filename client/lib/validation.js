export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount) {
  const num = Number(amount);
  return num > 0 && !isNaN(num);
}