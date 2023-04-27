import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { RandomIpfsNft } from "../../typechain-types"
import { assert, expect } from "chai"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import { Address } from "hardhat-deploy/dist/types"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { VRFCoordinatorV2Mock } from "../../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft unit test", () => {
          let randomIpfsNft: RandomIpfsNft,
              deployerAddress: Address,
              vrfCoordinatorV2Mock!: VRFCoordinatorV2Mock

          beforeEach(async function () {
              deployerAddress = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "randomipfs"])

              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployerAddress)
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployerAddress
              )
          })

          describe("constructor", () => {
              it("sets starting values correctly", async () => {
                  const dogTokenUriFirst = await randomIpfsNft.getDogTokenUris(0)
                  const isInitialized = await randomIpfsNft.getInitialized()

                  console.log("isInitialized", isInitialized)
                  console.log("dogTokenUriFirst", dogTokenUriFirst)

                  assert(dogTokenUriFirst.includes("ipfs://")!!)
                  assert.equal(isInitialized, true)
              })
          })

          describe("requestNft()", () => {
              it("it reverts if mint fee is not fully paid", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("emits and event and kicks off a random word request", async () => {
                  const mintFee = (await randomIpfsNft.getMintFee()).toString()
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("fulfillRandomWords", () => {
              it("mints an nft after a random number is returned", async function () {
                  await new Promise<void>(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async function () {
                          console.log("NFT was just minted!!!")

                          try {
                              const tokenUri = (await randomIpfsNft.getDogTokenUris(0)).toString()
                              const tokenCount = (await randomIpfsNft.getTokenCounter()).toString()

                              assert(tokenUri.includes("ipfs://"))
                              assert.equal(tokenCount, "1")

                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })

                      try {
                          const mintFee = (await randomIpfsNft.getMintFee()).toString()
                          const trx = await randomIpfsNft.requestNft({ value: mintFee })
                          const trxReceipt = await trx.wait(1)

                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              trxReceipt.events![1].args!.requestId,
                              randomIpfsNft.address
                          )
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })

          describe("getBreedFromModdedRng", () => {
              it("should return a pug if moddedRng < 10", async () => {
                  const dogEnumIndex = await randomIpfsNft.getBreedFromModdedRng(7)
                  assert.equal(0, dogEnumIndex)
              })
              it("should return a shiba inu if moddedRng between 10 and 39", async () => {
                  const dogEnumIndex = await randomIpfsNft.getBreedFromModdedRng(27)
                  assert.equal(1, dogEnumIndex)
              })
              it("should return a st bernard if moddedRng between 40 and 99", async () => {
                  const dogEnumIndex = await randomIpfsNft.getBreedFromModdedRng(77)
                  assert.equal(2, dogEnumIndex)
              })
              it("should revert if moddedRng > 99", async () => {
                  await expect(randomIpfsNft.getBreedFromModdedRng(107)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
      })
