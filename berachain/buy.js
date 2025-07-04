const {ethers} = require('ethers')
const {toBase} = require("./utils")
const {berapumpCurveAddr} = require("../.config.json");

async function main() {
  const [owner] = await ethers.getSigners()
  const berapumpCurve = await ethers.getContractAt("BerapumpCurve", berapumpCurveAddr);

  await berapumpCurve.connect(owner).buy(
    "0xa13414bc1c40cc87a8e8266734ddadd00098c57c",
    await owner.getAddress(),
    toBase(1, 10),
    0,
    {value: toBase(1, 10)}
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

