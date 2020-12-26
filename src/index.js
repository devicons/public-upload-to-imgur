const core = require('@actions/core')
const axios = require('axios')
const fs = require('fs')
const search = require("./search")

try {
  const img_paths = await search.findFilesToUpload(core.getInput('path'))
  const description = core.getInput("description")
  const clientId = core.getInput("client_id")
  console.log("Sending request...")

  for (let img_path of img_paths) {
    uploadToImgur(img_path, description, clientId)
  }
} catch (error) {
  core.setFailed(error.message);
}

function uploadToImgur(img_path, description, clientId) {
  const axiosConfig = {
    method: "post",
    url: "https://api.imgur.com/3/image",
    headers: {
      "Authorization": `Client-ID ${clientId}`
    },
    data: {
      image: fs.readFileSync(img_path, "base64"),
      type: "base64",
      description
    }
  }

  axios(axiosConfig)
    .then(res => res.data)
    .then(res => {
      if (!res.success) {
        throw new Error(`Request failed. Status code: ${res.status}. Error: ${res.data.error}`)
      }
      console.log("Request successful. Image URL is at: " + res.data.link)
      core.setOutput("imgur_url", res.data.link)
    }).catch(err => {
      throw err
    })
}