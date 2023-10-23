const hre = require("hardhat");

async function main() {
  const nft = await hre.ethers.getContractFactory("NFT");

  const deployedContract = await nft.deploy(
    "Test",
    "TST",
    "",
    "0x6877b0C0c37dEcb4B8B2c3B42f98C5bED4C0a246"
  );

  await deployedContract.deployed();

  console.log("NFT deployed to:", deployedContract.address);

  return deployedContract;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
