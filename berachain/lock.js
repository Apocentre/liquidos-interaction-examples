const {ethers} = require('ethers')
const {toBase} = require("./utils")
const {berapumpCurveAddr} = require("./.config.json");

async function main() {
  const [owner] = await ethers.getSigners()
  const token = await ethers.getContractAt("BerapumpToken", "0xce086638c8c2724c8a11d5d3a04c138cdea5e625");
  await token.approve(berapumpCurveAddr, toBase(1000000000000000))
  const berapumpCurve = await ethers.getContractAt("BerapumpCurve", berapumpCurveAddr);

  await berapumpCurve.connect(owner).lock(
    "0xce086638c8c2724c8a11d5d3a04c138cdea5e625",
    toBase(10, 10),
    60, // 1min
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

