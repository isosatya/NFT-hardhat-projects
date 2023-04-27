import pinataSDK from "@pinata/sdk"
import path from "path"
import fs from "fs"
import "dotenv/config"
import { Json } from "@chainsafe/ssz/lib/interface"

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)

export const storeImages = async function (imagesFilePath: string) {
    // this method resolves the short path to the long path
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)

    let responses = []

    console.log("uploading to IPFS... !!")

    console.log("fullImagesPath", fullImagesPath)
    console.log("files", files)

    for (let fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }

        try {
            await pinata
                .pinFileToIPFS(readableStreamForFile, options)
                .then((result) => {
                    responses.push(result)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    return { responses, files }
}

export const storeTokenUriMetadata = async function (metadata: Json) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
