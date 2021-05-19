const https = require("https")
const fs = require("fs").promises

function httpRequest(params, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(params, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode))
      }
      let body = []
      res.on('data', chunk => {
        body.push(chunk)
      })
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch(e) {
          reject(e)
        }
        resolve(body)
      })
    })
    req.on('error', err => {
      reject(err)
    })
    if (postData) {
      req.write(postData)
    }
    req.end()
  })
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST')
    return {
      statusCode: 405,
      body: 'Method not allowed.'
    }
  const envs = [
    "CAPTCHA_SECRET",
    "GMAIL_PASS",
    "GMAIL_USER",
    "EMAIL",
  ]
  for (const env of envs) {
    if (!(env in process.env)) {
      return {
        statusCode: 500,
        body: 'Internal server error.'
      }
    }
  }
  try {
    const body = JSON.parse(event.body)
    const proof = body.proof.split(';base64,')
    if (!(typeof body.orderId === "string" && proof[0] === "data:image/jpeg"))
      throw err
    if (!body.rt)
      return {
        statusCode: 400,
        body: 'Missing captcha response token.'
      }
    const params = {
      host: 'google.com',
      path: `/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${body.rt}`,
      method: 'POST'
    }
    try {
      const verify = await httpRequest(params)
      if (verify.success === true) {
        await fs.writeFile(`/tmp/${body.orderId}.jpg`, proof[1], {encoding: 'base64'})
        await require("gmail-send")({
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
          from: process.env.EMAIL,
          to: process.env.GMAIL_USER, 
          subject: 'Payment for order ' + body.orderId,
          files: [`/tmp/${body.orderId}.jpg`]
        })()
        await fs.unlink(`/tmp/${body.orderId}.jpg`)
        return {
          statusCode: 200,
          body: 'Request successful.'
        }
      }
      else
        return {
          statusCode: 400,
          body: 'Captcha verification failed.'
        }
    } catch {
      return {
        statusCode: 500,
        body: 'Internal server error.'
      }
    }
  } catch {
    return {
      statusCode: 400,
      body: 'Malformed request.'
    }
  }
}