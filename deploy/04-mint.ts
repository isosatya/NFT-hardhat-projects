import { ethers, network } from "hardhat"
import { VERIFICATION_BLOCK_CONFIRMATIONS, developmentChains } from "../helper-hardhat-config"
import { setTimeout } from "timers"

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    // // basic NFT
    // const basicNft = await ethers.getContract("BasicNft", deployer)
    // console.log("About to mint  basic NFT")

    // const basicNftTx = await basicNft.mintNft()
    // await basicNftTx.wait(1)
    // console.log(`Basic NFT index 0 has TokenURI: ${await basicNft.tokenURI(0)}`)

    // // Random IPFS NFT
    // console.log("About to get contract  Random IPFS NFT")

    // const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)

    // console.log("About to getMintFee   Random IPFS NFT", randomIpfsNft.address)

    // const mintFee = await randomIpfsNft.getMintFee()
    // console.log("About to getMintFee   Random IPFS NFT", mintFee.toString())

    // await new Promise(async (resolve, reject) => {
    //     setTimeout(resolve, 600000)
    //     randomIpfsNft.once("NftMinted", async function () {
    //         resolve
    //     })

    //     console.log("About to requestNft  Random IPFS NFT")

    //     const randomIpfsNftTx = await randomIpfsNft.requestNft({
    //         value: mintFee.toString(),
    //         gasLimit: 1 * 10 ** 6,
    //     })
    //     const randomIpfsNftTxReceipt = await randomIpfsNftTx.wait(1)

    //     if (developmentChains.includes(network.name)) {
    //         const requestId = randomIpfsNftTxReceipt.events[1].args.requestId.toString()
    //         const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
    //     }
    // })
    // console.log(`Random IPFS NFT index 0 TokenUri: ${await randomIpfsNft.tokenURI(0)}`)

    // Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("777")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    console.log("About to mint  Random IPFS NFT")

    const dynamicSvgNftTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftTx.wait(1)

    console.log(`Dynamic SVG NFT index 0 TokenUri: ${await dynamicSvgNft.tokenURI(0)}`)

    const lowValue = ethers.utils.parseEther("777")
    const dynamicSvgNft2 = await ethers.getContract("DynamicSvgNft", deployer)
    console.log("About to mint  Random IPFS NFT")

    const dynamicSvgNftTx2 = await dynamicSvgNft2.mintNft(lowValue.toString())
    await dynamicSvgNftTx2.wait(1)

    console.log(`Dynamic SVG NFT index 0 TokenUri: ${await dynamicSvgNft.tokenURI(1)}`)
}

module.exports.tags = ["all", "mint"]
