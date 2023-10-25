const hre = require("hardhat");

async function main() {
  const profile = await hre.ethers.getContractFactory("PlayzProfile");

  const deployedContract = await profile.deploy("Test");

  await deployedContract.deployed();

  console.log("profile deployed to:", deployedContract.address);

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
