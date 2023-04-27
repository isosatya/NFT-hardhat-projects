import { ethers, network } from "hardhat"
import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { verify } from "../utils/verify"
import fs from "fs"
import { DynamicSvgNft } from "../typechain-types"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdAggregatorAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdAggregatorAddress = ethUsdAggregator.address
    } else {
        ethUsdAggregatorAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
    }

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

    const args = [ethUsdAggregatorAddress, lowSVG, highSVG]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        // waitConfirmations: network.config.blockConfirmations || 1,
        waitConfirmations: networkConfig[chainId!]["blockConfirmations"] || 1,
    })

    let dynamicSvgNft2: DynamicSvgNft
    dynamicSvgNft2 = await ethers.getContract("DynamicSvgNft")
    const getLowSvg = await dynamicSvgNft2.getLowSvg()
    const getHighSvg = await dynamicSvgNft2.getLowSvg()

    console.log("getLowSvg", getLowSvg)
    console.log("getHighSvg", getHighSvg)

    // console.log("dynamicSvgNft ----->", dynamicSvgNft)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying....")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicsvg", "main"]
