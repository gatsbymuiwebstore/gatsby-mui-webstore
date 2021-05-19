# gatsby-google-sheets-drive-ecommerce

Gatsby-based Material-UI webstore, easy as 1-2-3:

1. Google Sheets/Docs as CMS
2. Google Drive as CDN
3. Netlify as CDN and cloud backend

* Practically zero running cost thanks to Google's and Netlify's generous free tier.
* One-click deploy to Netlify and fully customizable via environment variables (see below).
* Statically-generated products grid using data pulled from Google Sheets and Drive.
* Statically-generated storefront and blog pages using html exported by Google Docs.
* Recaptcha spam protection for order submissions.
* Backend is a Netlify lambda function that verifies orders and sends emails using Gmail.
* (Singapore) PayNow support.
* (Singapore) SGQR support.

# Environment Variables

| Variable Name                      | Description                                                                | Valid Values                   | Example                                  |
| ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------- |
| CAPTCHA_SECRET                     | Server-side recaptcha secret                                               | String                         | Wq7AXx8o4MlrP8NdiTgaPA84qbBDj_Z2dOe49qgk |
| EMAIL                              | The email address to use for from: header                                  | String                         | user@example.com                         |
| GATSBY_CAPTCHA_SITE_KEY            | Client-side recaptcha site key                                             | String                         | 0ScI2OaLQVOMQA0uvXNGh8kKoF7MVtS_2B62TCrk |
| GATSBY_SITE_COLOR_PRI_DARK         | Material design color palette, primary dark                                | 6 digit hexadecimal color code | #26418f                                  |
| GATSBY_SITE_COLOR_PRI_LIGHT        | Material design color palette, primary light                               | 6 digit hexadecimal color code | #8e99f3                                  |
| GATSBY_SITE_COLOR_PRI_MAIN         | Material design color palette, primary main                                | 6 digit hexadecimal color code | #5c6bc0                                  |
| GATSBY_SITE_COLOR_SEC_DARK         | Material design color palette, secondary dark                              | 6 digit hexadecimal color code | #c25e00                                  |
| GATSBY_SITE_COLOR_SEC_LIGHT        | Material design color palette, secondary light                             | 6 digit hexadecimal color code | #ffbd45                                  |
| GATSBY_SITE_COLOR_SEC_MAIN         | Material design color palette, secondary main                              | 6 digit hexadecimal color code | #fb8c00                                  |
| GATSBY_TZ_OFFSET                   | Timezone offset from UTC you are currently in                              | Number                         | -2.5                                     |
| GMAIL_PASS                         | Password for the gmail account to use for sending order emails             | String                         | myPassword123                            |
| GMAIL_USER                         | Gmail username for the gmail account to use for sending order emails       | String                         | user@gmail.com                           |
| GOOGLE_CLIENT_EMAIL                | Google cloud service account client email                                  | String                         | gatsby@mycompany.iam.gserviceaccount.com |
| GOOGLE_CLIENT_ID                   | Google cloud service account client ID                                     | String                         | 378462775875882189452                    |
| GOOGLE_DRIVE_ID                    | Google Drive folder ID containing the site assets                          | String                         | 0BwwA4oUTeiV1TGRPeTVjaWRDY1E             |
| GOOGLE_PRIVATE_KEY                 | Google cloud service account private key                                   | String                         | -----BEGIN PRIVATE KEY-----\nMIIEvQIB... |
| GOOGLE_PRIVATE_KEY_ID              | Google cloud service account private key ID                                | String                         | 3577461870923005507811543735910458182522 |
| GOOGLE_PROJECT_ID                  | Google cloud project ID                                                    | String                         | mygoogleproject                          |
| GOOGLE_SPREADSHEET_ID              | Google Sheets ID containing the site database                              | String                         | 1s-GPiuRZdVcEJgjhnUKUncGTw6MQ1abAoNU7... |
| SITE_AUTHOR                        | SEO site author                                                            | String                         | John Doe                                 |
| SITE_DESCRIPTION                   | SEO site description                                                       | String                         | Any products, delivered.                 |
| SITE_TITLE                         | SEO site title                                                             | String                         | My Company                               |
| SITE_TITLE_SHORT                   | Shorter version of site title for mobile app icon, <=12 characters         | String                         | MyCo                                     |