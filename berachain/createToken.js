const {ethers} = require('ethers')
const {toBase} = require("./utils")
const {berapumpCurveAddr, berapumpFactoryAddr} = require("./.config.json");

const CurveTypes = {
  "v1": 0,
  "v2": 1,
}

async function main() {
  const [owner] = await ethers.getSigners()
  const berapumpFactory = await ethers.getContractAt("BerapumpFactory", berapumpFactoryAddr);

  await berapumpFactory.connect(owner).deploy({
    maxSupply: toBase(1_000_000_000),
    tax: 0,
    berapumpCurve: berapumpCurveAddr,
    curveType: CurveTypes.v1,
    name: "b2",
    symbol: "B2",
  }, {value: toBase(1, 15)}); // if set value then the creator will make the first purchase for that amount
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

