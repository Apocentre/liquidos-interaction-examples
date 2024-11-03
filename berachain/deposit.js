const {ethers} = require('ethers')
const {toBase} = require("./utils")
const {onlybagsCurveAddr} = require("./.config.json");

async function main() {
  const [owner] = await ethers.getSigners()
  const token = await ethers.getContractAt("OnlybagsToken", "0xa13414bc1c40cc87a8e8266734ddadd00098c57c");
  await token.approve(onlybagsCurveAddr, toBase(1000000000000000))
  const onlybagsCurve = await ethers.getContractAt("OnlybagsCurve", onlybagsCurveAddr);

  await onlybagsCurve.connect(owner).deposit(
    "0xa13414bc1c40cc87a8e8266734ddadd00098c57c",
    toBase(10, 10),
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

