const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PlayzProfile contract", function () {
  async function deployPlayzProfileFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const PlayzProfile = await ethers.getContractFactory("PlayzProfile");
    const playzProfile = await PlayzProfile.deploy("initialUri");
    await playzProfile.deployed();

    return { playzProfile, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { playzProfile, owner } = await loadFixture(
        deployPlayzProfileFixture
      );
      expect(await playzProfile.owner()).to.equal(owner.address);
    });
  });

  describe("Membership Operations", function () {
    it("Should allow owner to create membership", async function () {
      const { playzProfile, owner } = await loadFixture(
        deployPlayzProfileFixture
      );
      await playzProfile.createMembership(
        "membershipUri",
        100,
        ethers.utils.parseEther("1"),
        10
      );
      expect(await playzProfile.uri(0)).to.equal("membershipUri");
    });

    it("Should allow user to mint membership", async function () {
      const { playzProfile, user1 } = await loadFixture(
        deployPlayzProfileFixture
      );
      await playzProfile.createMembership(
        "membershipUri",
        100,
        ethers.utils.parseEther("1"),
        10
      );
      await playzProfile
        .connect(user1)
        .mintMembership({ value: ethers.utils.parseEther("1") });
      expect(await playzProfile.balanceOf(user1.address, 0)).to.equal(1);
    });
  });

  describe("Edition Operations", function () {
    it("Should allow owner to create edition", async function () {
      const { playzProfile, owner } = await loadFixture(
        deployPlayzProfileFixture
      );
      await playzProfile.createEdition(
        "editionUri",
        100,
        ethers.utils.parseEther("0.5"),
        5
      );
      expect(await playzProfile.uri(1)).to.equal("editionUri");
    });

    it("Should allow member to mint member-only edition", async function () {
      const { playzProfile, user1 } = await loadFixture(
        deployPlayzProfileFixture
      );
      await playzProfile.createMembership(
        "membershipUri",
        100,
        ethers.utils.parseEther("1"),
        10
      );
      await playzProfile.createEdition(
        "editionUri",
        100,
        ethers.utils.parseEther("0.5"),
        5
      );
      await playzProfile.setMemberEdition(1);
      await playzProfile
        .connect(user1)
        .mintMembership({ value: ethers.utils.parseEther("1") });
      await playzProfile
        .connect(user1)
        .mintEdition(1, 1, { value: ethers.utils.parseEther("0.5") });
      expect(await playzProfile.balanceOf(user1.address, 1)).to.equal(1);
    });
  });

  describe("Profile URI Operations", function () {
    it("Should allow owner to set profile URI", async function () {
      const { playzProfile, owner } = await loadFixture(
        deployPlayzProfileFixture
      );
      await playzProfile.setProfileURI("newProfileUri");
      expect(await playzProfile.profileURI()).to.equal("newProfileUri");
    });
  });

  // Add more tests as needed...
});
