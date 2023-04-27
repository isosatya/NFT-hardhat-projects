import { ethers, network } from "hardhat"
import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { verify } from "../utils/verify"
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata"
import "dotenv/config"
import { VRFCoordinatorV2Mock } from "../typechain-types/@chainlink/contracts/src/v0.8/mocks"

let tokenUris: string[]

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "cuteness",
            value: 100,
        },
    ],
}

tokenUris = [
    "ipfs://Qma7NE9PDPeK2xZcXcHG1Ruo5Qnv5rKnJJrXSxCmjc8WF2",
    "ipfs://QmSFzakKEMVgcEH8Ce2cR2oNP1j9Fet8XYxpRo6WWxhvmR",
    "ipfs://Qmco7L7uAjez4NsXuRjHcQdZmC1Bs3Yf2dRteVfwk8XZea",
]

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get the IPFS (URI) hashes of our images

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 1. programatically with our own IPFS node https://docs.ipfs.io
    // 2. through Pinata  https://www.pinata.cloud
    // 3. nft.storage https://nft.storage

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock!: VRFCoordinatorV2Mock

    const FUND_AMOUNT = ethers.utils.parseEther("1")

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt!.events![0].args!.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId!].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId!].subscriptionId
    }

    log("just determined the vrfCoordinatorV2Address and subscriptionId variables")

    // await storeImages(imagesLocation)

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId!].gasLane,
        networkConfig[chainId!].callbackGasLimit,
        tokenUris,
        networkConfig[chainId!].mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: VERIFICATION_BLOCK_CONFIRMATIONS || 1,
    })

    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying....")
        await verify(randomIpfsNft.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []

    // store the image in IPFS
    // store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (let imageUploadResponseIndex in imageUploadResponses) {
        // create metadata
        let tokenUriMetada = { ...metadataTemplate }

        tokenUriMetada.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetada.description = `A lovely ${tokenUriMetada.name} puppy!`
        tokenUriMetada.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

        console.log(`Uploading metadata of ${tokenUriMetada.name}...`)

        // upload / store the metadata JSON to pinata
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetada)

        tokenUris.push(`ipfs://${metadataUploadResponse!.IpfsHash}`)
    }

    console.log("Token URIs uploaded ---->", tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
