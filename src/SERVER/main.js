const cors = require("cors")
const zl = require("zip-lib")
const express = require("express")
const fs = require('fs')
const path = require('path')

const PORT = 3125
const DATABASE_DIR = path.join(__dirname, "..", "..", "DATABASE")
const ZIPS_DIR = path.join(__dirname, '..', 'ZIPS')

const app = express()
app.use(express.json())
app.use(cors())

const getFileNames = async () => {
    try {
        let files = await fs.promises.readdir(DATABASE_DIR)
        return files;
    } catch(err) {
        if (err) {
            console.log(`found error: ${err}`)
        }
    }
}

const HackAttempt1System = async (filename) => {
    let filearray = await getFileNames()
    let filteredarray = [];
    const freshnamefactory = async () => {
        for (let i=0; i<filearray.length; i++) {
            let fileparse = path.parse(filearray[i])
            let freshname = fileparse.name
            filteredarray.push(freshname)
        }
    }
    await freshnamefactory()

    if (filteredarray.includes(filename.toLowerCase())) {
        return false; // not a hack attempt
    } else {
        return true; // was a hack attempt
    }
}

const checkIfFolder = async (filename) => {
    let isDirectorybool = await (await fs.promises.lstat(path.join(DATABASE_DIR, filename))).isDirectory()
    if (isDirectorybool) {
        console.log(`is a folder/directory`)
        return true
    } else {
        console.log(`is a file and not a folder/directory`)
        return false;
    }
}

checkIfFolder(`folderthings`)

// once the website starts we show them the files we got baby
app.get("/requestBeginning", async (req, res) => {
    let shit = await getFileNames()
    res.json({
        "array": shit
    })
})
// user wants a file
app.post("/requestFile", async (req, res) => {
    let fileNameRequested = req.body.fileNameRequested
    let withoutExtensionParse = path.parse(fileNameRequested)
    let freshnamefilerequested = withoutExtensionParse.name
    let hackattemptboolean = await HackAttempt1System(freshnamefilerequested.toLowerCase())
    if (hackattemptboolean) {
        console.log(`tried to hack`)
        res.sendStatus(403)
    } else {

        if (await checkIfFolder(fileNameRequested)) {
            console.log(`didnt hack`)
            console.log(`is a folder`)
            await zl.archiveFolder(`${path.join(DATABASE_DIR, fileNameRequested)}`, (`${path.join(ZIPS_DIR, fileNameRequested)}`)).then(function () {
                console.log(`zipped done!`)
                console.log(`renaming to zip`)
                fs.promises.rename(`${path.join(ZIPS_DIR, fileNameRequested)}`, `${path.join(ZIPS_DIR, fileNameRequested)}.zip`)
            }, function(err) {
                console.log(err)
            });
            appRequestedLocationZip = `${path.join(ZIPS_DIR, fileNameRequested)}.zip`
            res.download(appRequestedLocationZip)
        } else {
            console.log(`didnt hack`)
            console.log(`is a file`)
            appRequestedLocation = path.join(DATABASE_DIR, fileNameRequested.toLowerCase())
            res.download(appRequestedLocation)
        }
    }
})


app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`running on port ${PORT}`)
    }
})