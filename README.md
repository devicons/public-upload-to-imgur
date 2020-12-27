# public-upload-to-imgur
A GitHub Action that can upload "anonymous" images to Imgur using their API and give you the URL of the newly created image.
Note: "anonymous" means that the image is not tied to an account (see [this](https://apidocs.imgur.com/#intro)).

This action is used as part of the peek-icons workflow in the [devicon](https://github.com/devicons/devicon) repo to automate the
icon checking process.

If you are looking for an npm package instead of an action, consider [this repo](https://github.com/shinshin86/imgur-anonymous-uploader).


## How To Use ##

**Prerequisite**
1. Sign up for an API client id (see [this](https://apidocs.imgur.com/#intro)).
  * Note: You do not need an OATH token for this action.
2. Add the client id to the repo's secrets (see [this](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#in-this-article))


**Upload a Picture Only**
```
steps:
  - name: Upload a picture
    uses: devicons/public-upload-to-imgur@v1
    with:
      path: ./img.png  # required
      client_id: ${{secrets.IMGUR_CLIENT_ID}}  # required
      description: My picture  # optional
```

**Using the output**
```
steps:
  - name: Upload a picture
    uses: devicons/public-upload-to-imgur@v1
    with:
      path: ./img.png 
      client_id: ${{secrets.IMGUR_CLIENT_ID}} 
    - name: Comment on the PR about the result
      uses: github-actions-up-and-running/pr-comment@v1.0.1
      env:
        IMG_URL: ${{ steps.imgur_step.outputs.imgur_url }}
        MESSAGE: |
          Here is the picture that was uploaded:
          ![Image]({0}) # markdown syntax for displaying a picture
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        message: ${{format(env.MESSAGE, env.IMG_URL)}}  # add the url into the string
```

**Upload Content of a Directory**
```
- uses: devicons/public-upload-to-imgur@v1
  with:
    path: path/to/images/ # or path/to/images
    client_id: ${{secrets.IMGUR_CLIENT_ID}} 
```


**Multiple Paths**
```
- uses: devicons/public-upload-to-imgur@v1
  with:
  path: |
      path/output/bin/
      path/output/test-results
      !path/**/*.tmp
```


**Wild Cards**
```
- uses: devicons/public-upload-to-imgur@v1
  with:
  path: path/**/[abc]rtifac?/*
```

**Final Result**

Here's a working example from our repo:

![GitHub bot using the action](docs/example.PNG)

## Credits ##
The script for parsing multiple paths and glob inputs was taken from the [upload-artifacts](https://github.com/actions/upload-artifact/blob/main/src/search.ts) repo.

The [API](https://apidocs.imgur.com/#intro) is provided by Imgur.