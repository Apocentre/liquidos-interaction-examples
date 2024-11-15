const {ethers} = require("hardhat");
const {bytecode: tokenBytecode} = require("./abis/BerapumpTokenBytecode.json");
const {bytecode: taxTokenBytecode} = require("./abis/BerapumpTaxTokenBytecode.json");

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
    maxSupply, tax, creator, berapumpCurveAddr, name, symbol
  } = ctorArgs;
  
  const salt = ethers.keccak256(`0x${encode(["string", "string", "string", "uint256"], [name, symbol, "berapump", 1111111])}`);
  let encodedCtorArgs;
  let initCode;

  if(tax > 0) {
    encodedCtorArgs = encode(
      ["uint", "uint", "address", "address", "string", "string"],
      [maxSupply, tax, creator, berapumpCurveAddr, name, symbol],
    );
    
    initCode = taxTokenBytecode + encodedCtorArgs;
  } else {
    encodedCtorArgs = encode(
      ["uint", "address", "address", "string", "string"],
      [maxSupply, creator, berapumpCurveAddr, name, symbol],
    );
    
    initCode = tokenBytecode + encodedCtorArgs;
  }
  
  return create2Address(factoryAddr, salt, initCode);
}

module.exports = {
  encode,
  create2Address,
  create2TokenAddress,
}
