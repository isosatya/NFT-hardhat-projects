import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { BasicNft } from "../../typechain-types"
import { assert, expect } from "chai"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import { Address } from "hardhat-deploy/dist/types"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft unit test", () => {
          let basicNft: BasicNft, deployerAddress: Address

          beforeEach(async function () {
              deployerAddress = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "basicnft"])

              basicNft = await ethers.getContract("BasicNft", deployerAddress)
          })

          it("Allows users to mint an NFT, and updates appropriately", async () => {
              const tx = await basicNft.mintNft()
              // when we interact with the blockchain we need to use wait(1)
              // not just wait, otherwise it won´t wait for the block
              // to be mined
              await tx.wait(1)
              const tokenCounter = await basicNft.getTokenCounter()
              assert.equal(tokenCounter.toString(), "1")

              const tokenUri = await basicNft.tokenURI(0)
              // a property of the contract here is called as a function()
              assert.equal(tokenUri, await basicNft.TOKEN_URI())
          })
      })
