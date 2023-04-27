import { ethers } from "hardhat"

export interface networkConfigItem {
    name?: string
    subscriptionId?: string
    gasLane?: string
    keepersUpdateInterval?: string
    raffleEntranceFee?: string
    callbackGasLimit?: string
    vrfCoordinatorV2?: string
    mintFee?: string
    ethUsdPriceFeed?: string
    blockConfirmations?: string
    gas?: string
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    11155111: {
        name: "sepolia",
        subscriptionId: "1141",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01").toString(),
        callbackGasLimit: "3e7",
        vrfCoordinatorV2: "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
        mintFee: "10000000000000000", // 0.01 ETH
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        blockConfirmations: "6",
        gas: "600000000", // Manual Gas
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01").toString(), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },
}

export const developmentChains = ["hardhat", "localhost"]

export const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
}
