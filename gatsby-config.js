module.exports = {
  siteMetadata: {
    title: process.env.SITE_TITLE,
    description: process.env.SITE_DESCRIPTION,
    author: process.env.SITE_AUTHOR,
    siteUrl: process.env.URL,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/assets`,
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: process.env.SITE_TITLE,
        short_name: process.env.SITE_TITLE_SHORT,
        start_url: `/`,
        background_color: process.env.GATSBY_SITE_COLOR_PRI_MAIN,
        theme_color: process.env.GATSBY_SITE_COLOR_PRI_MAIN,
        display: `standalone`,
        icon: `assets/logos/logo.svg`, // This path is relative to the root of the site.
        cache_busting_mode: `none`,
      }
    },
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/layout.js`),
      },
    },
    `gatsby-plugin-top-layout`,
    `gatsby-plugin-material-ui`,
    `gatsby-plugin-js-fallback`,
    {
      resolve: `gatsby-source-google-spreadsheet`,
      options: {
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        credentials: {
          type: `service_account`,
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/(\\r)|(\\n)/g, '\n'),
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: `https://accounts.google.com/o/oauth2/auth`,
          token_uri: `https://oauth2.googleapis.com/token`,
          auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL.replace(/@/g, '%40')}`,
        },
      }
    },
    {
      resolve: `@fs/gatsby-plugin-drive`,
      options: {
        folderId: process.env.GOOGLE_DRIVE_ID,
        key: {
          private_key: process.env.GOOGLE_PRIVATE_KEY,
          client_email: process.env.GOOGLE_CLIENT_EMAIL,

        },
        destination: `${__dirname}/assets`,
        exportGDocs: true,
        exportMimeType: 'text/html',
        exportMiddleware: async buffer => {
          const createDOMPurify = require('dompurify')
          const { JSDOM } = require('jsdom')
          const { window } = new JSDOM('')
          const DOMPurify = createDOMPurify(window)
          DOMPurify.addHook('afterSanitizeAttributes', node => {
            if (node.nodeName.localeCompare('head', undefined, {sensitivity: 'base'}) === 0 ||
            node.nodeName.localeCompare('body', undefined, {sensitivity: 'base'}) === 0) {
              node.replaceWith(...node.childNodes)
            }
            if (node.nodeName.localeCompare('a', undefined, {sensitivity: 'base'}) === 0 && node.hasAttribute('href')) {
              node.setAttribute('href', node.getAttribute('href').replace(/(?:https:\/\/www\.google\.com\/url\?q=)(.+)(?:&sa=D&ust=.+)/, (p1,p2) => decodeURI(p2)))
              node.setAttribute('target', '_blank')
              node.setAttribute('rel', 'noopener noreferrer')
            }
          })
          const data = await buffer
          return DOMPurify.sanitize(data.toString(), {WHOLE_DOCUMENT: true}).replace(/<html>|<\/html>/g, '')
        }
      }
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
