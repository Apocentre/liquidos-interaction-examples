const {ethers} = require('ethers')
const {toBase} = require("./utils")
const {onlybagsCurveAddr, onlybagsFactoryAddr} = require("./.config.json");

const CurveTypes = {
  "v1": 0,
  "v2": 1,
}

async function main() {
  const [owner] = await ethers.getSigners()
  const onlybagsFactory = await ethers.getContractAt("OnlybagsFactory", onlybagsFactoryAddr);

  await onlybagsFactory.connect(owner).deploy({
    maxSupply: toBase(1_000_000_000),
    onlybagsCurve: onlybagsCurveAddr,
    curveType: CurveTypes.v1,
    name: "b2",
    symbol: "B2",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

