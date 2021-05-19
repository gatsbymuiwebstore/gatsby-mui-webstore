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

function generateMailHtml(order, options) {
  const head =
    '<!DOCTYPE html>' +
    '<html>' +
      '<body style="margin:0px;max-width:680px">' +
        `<div style="background-color:${process.env.GATSBY_SITE_COLOR_PRI_MAIN}">` +
          '<h1 style="display:table;margin:0px">' +
            `<img style="display:table-cell;padding:8px;vertical-align:middle" src="${process.env.URL}/icons/icon-48x48.png" />` +
            `<span style="display:table-cell;padding:8px;vertical-align:middle;color:#f0f0f0">` +
              `${process.env.SITE_TITLE.replace(/\./g, '.&#65279;')}` +
            `</span>` +
          '</h1>' +
        '</div>' +
        '<div style="margin:8px">' +
          '<h2>Order Summary</h2>' +
          '<table style="width:100%">' +
            '<tr>' +
              '<th style="text-align:left;padding-left:8px">Product</th>' +
              '<th>Variant</th>' +
              '<th>Qty</th>' +
              '<th>Unit</th>' +
              '<th style="text-align:left;padding-left:12px">Price</th>' +
            '</tr>'
  let body = []
  order.cart.forEach(item => {
    const price = order.altPrices ? item.altPrice : item.price
    body.push(
            '<tr>' +
              `<td style="padding:8px">${item.product} - ${item.unit}</td>` +
              `<td style="text-align:center;padding:8px">${item.variant}</td>` +
              `<td style="text-align:center;padding:8px">${item.qty}</td>` +
              `<td style="text-align:center;padding:8px">$${price}</td>` +
              `<td style="text-align:left;padding:8px">$${(price * item.qty).toFixed(2)}</td>` +
            '</tr>'
    )
  })
  if (options.emailMessage) {
    if (options.emailMessageContactless)
      var message = order.contactless ? options.emailMessageContactless : options.emailMessage
    else
      var message = options.emailMessage
  }
  else {
    if (options.emailMessageContactless)
      var message = order.contactless && options.emailMessageContactless
  }
  const getPaymentStr = () => {
    switch (order.paymentMethod) {
      case 'SGQR':
      case 'PayNow':
        return `${options.paynowMobileNo} (${options.paynowName})`
      case 'Bank Transfer':
        return `${options.bankAccNo} (${options.bankAccName})`
      default:
        return "Error: Invalid payment method."
    }
  }
  const foot =
            '<tr>' +
              `<td style="vertical-align:baseline;padding:8px" colspan="3" rowspan=${order.discount ? "4" : "3"}>` +
                `${options.altPricesName}: ${order.altPrices ? 'Yes' : 'No'}` +
              `</td>` +
              '<td style="text-align:right;padding:8px">Subtotal:</td>' +
              `<td style="text-align:left;padding:8px">$${order.subtotal.toFixed(2)}</td>` +
            '</tr>' +
            ((order.discount || '') &&
              '<tr>' +
                '<td style="text-align:right;padding:8px">Discount:</td>' +
                `<td style="text-align:left;padding:8px;white-space:nowrap">- $${order.discount.toFixed(2)}</td>` +
              '</tr>'
            ) +
            '<tr>' +
              '<td style="text-align:right;padding:8px">Delivery:</td>' +
              `<td style="text-align:left;padding:8px">${order.isFreeDelivery ? 'Free' : '$'+order.deliveryFee}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="text-align:right;padding:8px">Total:</td>' +
              `<td style="text-align:left;padding:8px">$${order.total.toFixed(2)}</td>` +
            '</tr>' +
          '</table>' +
          ((order.promo || '') &&
            `<p>Promo code applied: ${order.promo.code}</p>`
          ) +
          '<h2 style="padding-top:16px">Deliver To</h2>' +
          '<table style="width:100%">' +
            '<tr>' +
              '<td style="padding:8px;padding-top:0px">Name:</td>' +
              `<td style="padding:8px;padding-top:0px">${order.name}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px">Address:</td>' +
              `<td style="padding:8px">${order.street} ${order.building} ${order.unit} Singapore ${order.postal}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px">Phone:</td>' +
              `<td style="padding:8px">${order.phone}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px">Delivery Date:</td>' +
              `<td style="padding:8px">${order.deliveryDate}, ${order.deliveryTime}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px">Contactless Delivery:</td>' +
              `<td style="padding:8px">${order.contactless ? 'Yes' : 'No'}</td>` +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px">Payment Method:</td>' +
              `<td style="padding:8px">${order.paymentMethod}</td>` +
            '</tr>' +
            (order.comments &&
              '<tr>' +
                '<td style="padding:8px">Comments:</td>' +
                `<td style="padding:8px">${order.comments}</td>` +
              '</tr>'
            ) +
          '</table>' +
          ((typeof message === "string" || '') && `<p style="padding-top:16px;white-space:pre-line">${message}</p>`) +
          `<p style="padding-top:16px">If you haven't made payment already:</p>` +
          `<p>Send $${order.total.toFixed(2)} to ${getPaymentStr()}</p>` +
          `<p>Do add your order no. ${order.orderId} under comments for faster processing.</p>` +
          `<p style="padding-top:16px">` +
            `For urgent enquiries, contact us at <a href=tel:${options.mobileNo} rel="nofollow">${options.mobileNo}</a>.` +
          `</p>` +
        '</div>' +
      '</body>' +
    '</html>'

  return head + body.join('') + foot
}

function verifyDeliveryDate(currentDate, order, options) {
  const minDate = new Date(currentDate)
  minDate.setUTCDate(minDate.getUTCDate()+parseInt(options.deliveryMinDate))
  const deliveryDate = new Date(new Date(order.deliveryDate).getTime()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000)
  const peakDays = options.deliveryPeakDays.split(',').map(str => parseInt(str))
  const noDeliveryDates = options.deliveryUnavailDates.split(',').map(str => [parseInt(str.split('/')[0]), parseInt(str.split('/')[1])])
  const noDeliveryDays = options.deliveryUnavailDays.split(',').map(str => parseInt(str))
  const shouldIncrementDate = date => {
    if (noDeliveryDays.includes(date.getUTCDay()))
      return true
    return noDeliveryDates.some(item => item[0] === date.getUTCDate() && item[1] === date.getUTCMonth()+1)
  }
  const incrementDate = date => date.setUTCDate(date.getUTCDate()+1)
  minDate.getUTCHours() >= parseInt(options.deliveryCutoffHr) && incrementDate(minDate)
  if (order.cart.some(item => item.delay))
    for (let i = 0; i < parseInt(options.deliveryDelay); i++)
      incrementDate(minDate)
  for (let i = 0; i < parseInt(options.deliveryPeakDelay); i++)
    peakDays.includes(minDate.getUTCDay()) && incrementDate(minDate)
  while (shouldIncrementDate(minDate))
    incrementDate(minDate)
  while (shouldIncrementDate(deliveryDate))
    incrementDate(deliveryDate)
  return deliveryDate.getTime() > minDate.getTime() ? deliveryDate : minDate
}

function verifyDeliveryTime(deliveryTime, deliveryDate, options) {
  const deliveryTimeslots = options.deliveryTimeslots.split(',').map(str => str.trim())
  const deliveryPeakTimeslots = options.deliveryPeakTimeslots.split(',').map(str => str.trim())
  const peakDays = options.deliveryPeakDays.split(',').map(str => parseInt(str))
  if (peakDays.includes(deliveryDate.getUTCDay())) {
    if (deliveryPeakTimeslots.includes(deliveryTime))
      return deliveryTime
    else
      return deliveryPeakTimeslots[0]
  }
  else {
    if (deliveryTimeslots.includes(deliveryTime))
      return deliveryTime
    else
      return deliveryTimeslots[0]
  }
}

function verifyPromo(promos, promoCode) {
  const result = {code: promoCode}
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
  }(promoCode)
  return result
}

function processOrder(order) {
  return new Promise(async (resolve, reject) => {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/(\\r)|(\\n)/g, '\n'),
      })
    await doc.loadInfo()
    const data = await doc.sheetsByIndex[0].getRows()
    const promos = await doc.sheetsByIndex[2].getRows()
    const rawOptions = await doc.sheetsByIndex[3].getRows()
    const options = rawOptions.reduce((acc, item) => (acc[item.key] = item.value || '', acc), {})
    if (options.takingOrders.toLowerCase().includes('no'))
      reject()
    if (options.altPricesDisabled.toLowerCase().includes('yes'))
      order.altPrices = false
    delete order.rt
    const cart = []
    order.invalid = order.cart.filter(cartItem => {
      const dataItem = data.find(item => cartItem.sku === item.sku)
      if (dataItem && dataItem.available.toLowerCase().includes('yes')) {
        cart.push({
          ...cartItem,
          product: dataItem.product,
          variant: dataItem.variant,
          unit: dataItem.unit,
          price: parseFloat(dataItem.price),
          altPrice: parseFloat(dataItem['alt-price']),
          discount: parseFloat(dataItem.discount),
          qty: parseInt(cartItem.qty) < parseInt(dataItem['min-qty']) ? parseInt(dataItem['min-qty']) : parseInt(cartItem.qty),
          delay: dataItem.delay.toLowerCase().includes('yes'),
        })
        return false
      } else return true
    })
    order.cart = cart
    const subtotals = order.cart.reduce((acc, item) =>
      ({
        nonDiscSubtotal: item.discount <= 0 ?
          acc.nonDiscSubtotal + (order.altPrices ? item.altPrice : item.price) * item.qty :
          acc.nonDiscSubtotal,
        discSubtotal: item.discount > 0 ?
          acc.discSubtotal + (order.altPrices ? item.altPrice : item.price) * item.qty :
          acc.discSubtotal,
        discount: item.discount > 0 ? acc.discount + item.discount * item.qty : acc.discount,
      })
    , {nonDiscSubtotal: 0, discSubtotal: 0, discount: 0})
    order.subtotal = subtotals.nonDiscSubtotal + subtotals.discSubtotal
    order.discount = subtotals.nonDiscSubtotal >= parseFloat(options.discountThreshold) ? subtotals.discount : 0
    const calcFreeDel = (altThreshold, threshold) => {
      const isAltDistrict = options.deliveryAltDistricts.split(',').map(str => str.trim()).includes(order.postal.slice(0,2))
      order.isFreeDelivery = (order.subtotal - order.discount) >=
        parseFloat(isAltDistrict ? altThreshold : threshold)
    }
    if (order.promo) {
      order.promo = verifyPromo(promos, order.promo)
      if (order.promo.fixed)
        order.discount = order.discount + Math.max(0, order.promo.fixed)
      if (order.promo.percentage) {
        const amount = Math.min(1, Math.max(0, order.promo.percentage/100))
        order.discount = order.discount*(1-amount) + order.subtotal*amount
      }
      if (order.promo.freedelivery)
        order.isFreeDelivery = true
      else {
        if (order.promo.freedeliverythresholds) {
          const promoThresholds = order.promo.freedeliverythresholds.split(',')
          calcFreeDel(promoThresholds[0], promoThresholds[1])
        }
        else
          calcFreeDel(options.deliveryAltFreeThreshold, options.deliveryFreeThreshold)
      }
    }
    else {
      calcFreeDel(options.deliveryAltFreeThreshold, options.deliveryFreeThreshold)
    }
    order.deliveryFee = parseFloat(options.deliveryFee)
    order.total = Math.max(0, order.subtotal - order.discount) + (order.isFreeDelivery ? 0 : order.deliveryFee)
    const date = new Date(Date.now()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000)
    order.orderId = date.getUTCFullYear().toString().slice(-2) +
    (date.getUTCMonth() + 1).toString().padStart(2, '0') +
    date.getUTCDate().toString().padStart(2, '0') +
    date.getUTCHours().toString().padStart(2, '0') +
    date.getUTCMinutes().toString().padStart(2, '0') +
    date.getUTCSeconds().toString().padStart(2, '0')
    const deliveryDate = verifyDeliveryDate(date, order, options)
    order.deliveryDate = deliveryDate.toUTCString().slice(0, 16)
    order.deliveryTime = verifyDeliveryTime(order.deliveryTime, deliveryDate, options)
    await require("gmail-send")({
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
      from: process.env.EMAIL,
      to: process.env.GMAIL_USER,
      cc: order.email,
      subject: 'Order ' + order.orderId,
      html: generateMailHtml(order, options)
    })()
    resolve(order)
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
    "EMAIL",
    "GATSBY_SITE_COLOR_PRI_MAIN",
    "GATSBY_TZ_OFFSET",
    "GMAIL_PASS",
    "GMAIL_USER",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SPREADSHEET_ID",
    "SITE_TITLE",
    "URL",
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
    const order = JSON.parse(event.body)
    const types = {
      name: "string",
      street: "string",
      building: "string",
      unit: "string",
      postal: "string",
      email: "string",
      phone: "string",
      comments: "string",
      promo: "string",
      deliveryTime: "string",
      paymentMethod: "string",
      contactless: "boolean",
      altPrices: "boolean",
    }
    for (const key in types) {
      if (!(typeof order[key] === types[key]))
        throw err
    }
    if (!(!isNaN(new Date(order.deliveryDate).getTime()) && order.cart instanceof Array))
      throw err
    if (typeof order.rt !== "string")
      return {
        statusCode: 400,
        body: 'Missing captcha response token.'
      }
    const params = {
      host: 'google.com',
      path: `/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${order.rt}`,
      method: 'POST'
    }
    try {
      const verify = await httpRequest(params)
      if (verify.success === true) {
        const result = await processOrder(order)
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
      body: 'Malformed order.'
    }
  }
}