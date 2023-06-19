import { readdir, readFile } from "node:fs/promises"
import matter from "gray-matter"

const getPermalinksForFiles = async(filePaths) => {
    const permalinks = []

    for (const filePath of filePaths) {
        permalinks.push(matter(await readFile(filePath, 'utf-8')).data.permalink)
    }

    return permalinks
}

const getFilePaths = async(dirPath = './content', arrayOfFiles) => {
    const filePaths = arrayOfFiles || []

    try {
        const items = await readdir(dirPath, { withFileTypes: true })
        await Promise.all(items.map(async (item) => {
            return item.isDirectory() ? await getFilePaths(`${dirPath}/${item.name}`, filePaths) : filePaths.push(`${dirPath}/${item.name}`)
        }))
    } catch (err) { console.error(err) }
    
	return filePaths
}

export const getAllPermalinks = async() => await getPermalinksForFiles(await getFilePaths())
