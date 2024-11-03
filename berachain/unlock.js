const {ethers} = require('ethers')
const {onlybagsCurveAddr} = require("./.config.json");

async function main() {
  const [owner] = await ethers.getSigners()
  const onlybagsCurve = await ethers.getContractAt("OnlybagsCurve", onlybagsCurveAddr);

  await onlybagsCurve.connect(owner).unlock("0xce086638c8c2724c8a11d5d3a04c138cdea5e625");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

