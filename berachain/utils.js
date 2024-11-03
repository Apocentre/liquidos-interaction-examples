const {ethers} = require("ethers");

const getBalance = async account => await ethers.provider.getBalance(account)


const Contract = async (contractName, factoryOptions) => await ethers.getContractFactory(contractName, factoryOptions)

const toBase = (n, dec = 18) => {
  return BigInt(n) * (BigInt(10) ** BigInt(dec))
}

const execAndGetGasUsed = async (sender, action) => {
  const senderBalanceBefore = await getBalance(sender);
  const {hash, gasPrice} = await action();
  const {gasUsed, } = await ethers.provider.getTransactionReceipt(hash);
  const senderBalanceAfter = await getBalance(sender);
  const totalGasPaid = gasUsed * gasPrice;

  return senderBalanceBefore - senderBalanceAfter - totalGasPaid;
}

const strip0x = val => val.replace("0x", "")

module.exports = {
  Contract,
  toBase,
  execAndGetGasUsed,
  strip0x,
}
