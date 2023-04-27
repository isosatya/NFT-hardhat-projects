import { network } from "hardhat"
import { VERIFICATION_BLOCK_CONFIRMATIONS, developmentChains } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("just got getNamedAccounts -----------")

    const args: string[] = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: VERIFICATION_BLOCK_CONFIRMATIONS || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying....")
        await verify(basicNft.address, args)
    }
}

module.exports.tags = ["all", "basicnft", "main"]
