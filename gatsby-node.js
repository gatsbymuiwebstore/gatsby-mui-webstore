const path = require(`path`)
const fs = require(`fs`)
const sharp = require(`sharp`)
const qrcode = require(`qrcode`)
const { GoogleSpreadsheet } = require("google-spreadsheet")

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest, reporter }) => {
  const { createNode } = actions
  const envs = [
    "GATSBY_CAPTCHA_SITE_KEY",
    "GATSBY_SITE_COLOR_PRI_DARK",
    "GATSBY_SITE_COLOR_PRI_LIGHT",
    "GATSBY_SITE_COLOR_PRI_MAIN",
    "GATSBY_SITE_COLOR_SEC_DARK",
    "GATSBY_SITE_COLOR_SEC_LIGHT",
    "GATSBY_SITE_COLOR_SEC_MAIN",
    "GATSBY_TZ_OFFSET",
    "GOOGLE_SPREADSHEET_ID",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
  ]
  for (const env of envs) {
    if (!(env in process.env)) {
      reporter.panicOnBuild(`Missing environment variable ${env}`)
      return
    }
  }
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/(\\r)|(\\n)/g, '\n'),
  })
  await doc.loadInfo()
  const rawOptions = await doc.sheetsByIndex[3].getRows()
  const options = rawOptions.reduce((acc, item) => (acc[item.key] = item.value || '', acc), {})
  createNode({
    ...options,
    id: createNodeId(`options`),
    parent: null,
    children: [],
    internal: {
      type: `Options`,
      contentDigest: createContentDigest(options)
    }
  })
  fs.existsSync('public/icons') || fs.mkdirSync('public/icons')
  fs.existsSync('public/splash') || fs.mkdirSync('public/splash')
  await Promise.all([
    sharp('assets/logos/logo.svg', { density: 1200 })
      .flatten({background: 'white'})
      .resize(1200, 630, {
        fit: 'contain',
        background: 'white'
      })
      .toFile('public/icons/icon-1200x630.png'),
    ...[{width: 1136, height: 640},
    {width: 2436, height: 1125},
    {width: 1792, height: 828},
    {width: 828, height: 1792},
    {width: 1334, height: 750},
    {width: 1242, height: 2688},
    {width: 2208, height: 1242},
    {width: 1125, height: 2436},
    {width: 1242, height: 2208},
    {width: 2732, height: 2048},
    {width: 2688, height: 1242},
    {width: 2224, height: 1668},
    {width: 750, height: 1334},
    {width: 2048, height: 2732},
    {width: 2388, height: 1668},
    {width: 1668, height: 2224},
    {width: 640, height: 1136},
    {width: 1668, height: 2388},
    {width: 2048, height: 1536},
    {width: 1536, height: 2048}].map(size =>
      sharp('assets/logos/logo.svg', { density: 1200 })
        .flatten({background: 'white'})
        .resize(size.width, size.height, {
          fit: 'contain',
          background: 'white'
        })
        .toFile(`public/splash/splash-${size.width}x${size.height}.png`)
    ),
    qrcode.toFile('assets/sgqr.png', options.sgQRCode, {
      color: {
        dark: '#90137b',
        light: '#0000'
      },
      scale: 8
    })
  ])
  const functions = {}
  fs.existsSync('functions') || fs.mkdirSync('functions')
  fs.readdirSync('src/functions').forEach(filename => {
    const basename = filename.split('.').slice(0, -1).join('.')
    const digest = createContentDigest(fs.readFileSync(`src/functions/${filename}`)).slice(0, 7)
    fs.copyFileSync(`src/functions/${filename}`, `functions/${basename}-${digest}.js`)
    functions[basename] = `${process.env.URL}/.netlify/functions/${basename}-${digest}`
  })
  createNode({
    ...functions,
    id: createNodeId(`functions`),
    parent: null,
    children: [],
    internal: {
      type: `Functions`,
      contentDigest: createContentDigest(functions)
    }
  })
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(
    `
      query {
        allGoogleSpreadsheetProducts {
          distinct(field: category)
          nodes {
            catId
            proId
            category
            product
          }
        }
      }
    `
  )
  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }
  const categoryTemplate = path.resolve(`src/components/category.js`)
  const productTemplate = path.resolve(`src/components/product.js`)
  result.data.allGoogleSpreadsheetProducts.distinct.forEach(category => {
    let path = category.toLowerCase().replace(/\s+/g, '-').slice(0, 200)
    let glob = result.data.allGoogleSpreadsheetProducts.nodes.find(node => node.category === category).catId + '-*'
    const categorypath = path
    const distinctproducts = new Set()
    createPage({
      path,
      component: categoryTemplate,
      context: {
        category, glob
      },
    })
    result.data.allGoogleSpreadsheetProducts.nodes.forEach(node => {
      if (node.category === category)
        distinctproducts.add(node)
    })
    distinctproducts.forEach(node => {
      glob = node.catId + '-' + node.proId + '-*'
      path = categorypath + '/' + node.product.toLowerCase().replace(/\s+/g, '-').slice(0, 200)
      createPage({
        path,
        component: productTemplate,
        context: {
          node, glob
        },
      })
    })
  })
}
