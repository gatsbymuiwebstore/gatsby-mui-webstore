const https = require("https")
const { GoogleSpreadsheet } = require("google-spreadsheet")

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
    "GATSBY_TZ_OFFSET",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SPREADSHEET_ID",
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
    if (!(typeof body.code === "string"))
      throw err
    if (typeof body.rt !== "string")
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
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
        await doc.useServiceAccountAuth({
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/(\\r)|(\\n)/g, '\n'),
        })
        await doc.loadInfo()
        const promos = await doc.sheetsByIndex[2].getRows()
        const result = {}
        void function processCode(code) {
          const promo = promos.find(item => code.toLowerCase() === item.code.toLowerCase())
          if (promo) {
            const now = Date.now()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000
            const from = new Date(promo.from + ' UTC').getTime()
            const to = new Date(promo.to + ' UTC').getTime()
            if (now > from && now < to) {
              const type = promo.type.toLowerCase()
              switch (type) {
                case 'combo':
                  const comboCodes = promo.amount.split(',').map(str => str.toLowerCase().trim())
                  comboCodes.forEach(comboCode => processCode(comboCode))
                  break
                case 'freedelivery':
                  result[type] = true
                  break
                default:
                  result[type] = promo.amount
              }
            }
          }
        }(body.code)
        return {
          statusCode: 200,
          body: JSON.stringify(result)
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