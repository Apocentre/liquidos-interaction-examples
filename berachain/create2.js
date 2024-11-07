const {ethers} = require("hardhat");
const {bytecode: tokenBytecode} = require("./abis/BerapumpToken.json");

const encode = (types, values) => {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encodedParams = abiCoder.encode(types, values);
  return encodedParams.slice(2);
};

const create2Address = (factoryAddr, saltHex, initCode) => {
  const create2Addr = ethers.getCreate2Address(factoryAddr, saltHex, ethers.keccak256(initCode));
  return create2Addr;
}

const create2TokenAddress = (factoryAddr, ctorArgs) => {
  const {
    maxSupply, berapumpCurveAddr, name, symbol
  } = ctorArgs;
  
  const salt = ethers.keccak256(`0x${encode(["string", "string", "string", "uint256"], [name, symbol, "berapump", 80084])}`);
  const encodedCtorArgs = encode(
    ["uint", "address", "string", "string"],
    [maxSupply, berapumpCurveAddr, name, symbol],
  );
  const initCode = tokenBytecode + encodedCtorArgs;
  
  return create2Address(factoryAddr, salt, initCode);
}

module.exports = {
  encode,
  create2Address,
  create2TokenAddress,
}
