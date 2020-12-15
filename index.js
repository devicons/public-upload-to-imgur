const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

try {
  const img_path = path.resolve(core.getInput('img_path'))
  const description = core.getInput("description")
  const clientId = core.getInput("client_id")
  // const img_path = path.join("C:/Users/Admin_Think541/Downloads/Images/AK-47-B-superJumbo.jpg")
  // const description = "Test"
  console.log("Sending request...")
  makeRequest(img_path, description, clientId)
} catch (error) {
  core.setFailed(error.message);
}

function makeRequest(img_path, description, clientId) {
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
    .then(data => {
      if (!data.success) {
        throw new Error("Request failed. Status code: " + data.status)
      }
      console.log("Request successful. Image URL is at: " + data.data.link)
    }).catch(err => {
      console.error(err.message)
      console.error(err.response)
    })
}