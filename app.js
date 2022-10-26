const express = require('express')
const bodyParser = require('body-parser')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express()
const port = 3000

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// @route POST /
// @desc Bridge to the API
// @params BODY {string} putUrl - The URL to PUT the file to DigitalOcean
// @params BODY {string} b64File - The base64 encoded file
// @params HEADER {string} Authorization - The Auth token so we can send it into the next call
app.post('/', async (req, res) => {
  try{
    if(!req.body.b64File || !req.body.putUrl) throw 'Missing parameters'
    const { b64File, putUrl} = req.body
    const token = req.headers.authorization

    const requestOptions = {
      method: 'PUT',
      headers: {
        "Authorization": token,
        "Content-Type": "image/png"
      },
      body: b64File,
      redirect: 'follow'
    };

    const response = await fetch(putUrl, requestOptions)

    // Errors seems to be coming as XML so trying to parse it will throw an error
    const result = await response.json()

    // If no error is thrown, the response is a JSON object and then we'll get the Etag here
    res.status(200).send({ok: true, ...result})

  }catch(err){
    console.log('Something went wrong: ', err)
    res.status(500).send({ok: false, err})
  }

})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})


