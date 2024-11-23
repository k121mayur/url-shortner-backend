import express from 'express';
import adler32 from 'adler-32';
import fs from 'fs';
import data from './data/data.json' assert { type: "json" };
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.get("/info", (req, res) => {
    res.send("This is url shortner. Send POST request to /shortner with your full url body = {\"original_url\":\"https://www.google.com\" }")
})

app.get("/", (req, res) => {
    res.json(data)
})

app.get("/:hash", (req, res) => {
    const hash = req.params.hash
    console.log(hash)
    const item = data.find(item => item.hash === hash)
    if (item) {
        res.redirect(item.original_url)
        return
    }
    res.send("This is url shortner. Send POST request to /shortner with your full url")
})

app.post("/shortner", (req, res) => {
    const {original_url} = req.body
    console.log(original_url)
    const hash = adler32.str(original_url)
    const hashHex = hash.toString(16).padStart(8, '0')
    const mapping = {
        original_url: original_url,
        hash: hashHex
    }
    data.push(mapping)
    fs.writeFileSync('./data/data.json', JSON.stringify(data))
    res.status(200)
    console.log(mapping)
    res.json(mapping)

})

app.listen(5000, () => console.log("server is running"))