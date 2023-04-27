import { HardhatRuntimeEnvironment } from "hardhat/types"
import { network, ethers } from "hardhat"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

// this utils only shows up with older version of
// ethers -->    "ethers": "^5.7.2",
const BASE_FEE = ethers.utils.parseEther("0.25") // Fee for every request
const GAS_PRICE_LINK = 1e9

// parseEther == parseUnits("X amount", "ether")
const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // or network.name ??
    const chainId = network.config.chainId
    // args = the arguments that the constructor needs

    if (developmentChains.includes(network.name)) {
        console.log("Local network detected! Deploying mocks...")
        // deploy a mock VRFCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("---------------------")
    }
}

module.exports.tags = ["all", "mocks", "main"]
