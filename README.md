# Gatsby Material-UI Webstore

## Demo

Check out the demo [here](https://gmws.netlify.app/).

## Introduction

Full stack Gatsby-based Material-UI ecommerce webstore, designed to be maintained with familiar Google tools:

1. Google Sheets/Docs/Drive as CMS
2. Netlify as CDN
3. Gmail as order management backend
4. Orders sent out as emails via serverless Netlify lambda functions

🆓 Practically zero running cost due to serverless approach for small-scale sites with Netlify's and Google's free tiers.

⚡ JAMStack - Blazing fast statically-generated products grid using data pulled from Google Sheets and Drive.

📄 Design and maintain your storefront/landing page in Google Docs and have it appear as-is in your main page.

🛡️ Reduced attack surface as a static site - there's no running backend servers or databases to breach. Recaptcha spam protection for order submissions.

🛒 Orders are sent out as emails using Gmail via a Netlify lambda function.

🇸🇬 PayNow and SGQR support.

## Quick Start

1. Copy the [gatsby-mui-google-webstore folder](https://drive.google.com/drive/folders/1KKwAVBRn5IEyGXeN0Irz_TCIL56ThcjY) to your Google Drive.
   1. Download the whole folder and reupload it to your Google Drive. Delete the converted `database.xlsx` and `main.docx`, replace them with the native Google formats with `right click > make a copy` for each file.
   2. Take note of the ID of the assets folder, you'll need this for the `GOOGLE_DRIVE_ID` Netlify env var.
   3. Take note of the ID of the database sheets, you'll need this for the `GOOGLE_SPREADSHEET_ID` Netlify env var.

2. Go to [GCP console](https://console.cloud.google.com) and create a new project.

3. Go to [APIs and services](https://console.cloud.google.com/apis/dashboard) and enable the Drive and Sheets APIs.

4. Go to [credentials > manage service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a new service account.

5. Add a key for that service account and a json file containing the service account credentials will be downloaded. Take note of the values of the following json keys to be input into the following Netlify env vars:
   1. `GOOGLE_CLIENT_EMAIL` = `client_email`
   2. `GOOGLE_CLIENT_ID` = `client_id`
   3. `GOOGLE_PRIVATE_KEY` = `private_key`
   4. `GOOGLE_PRIVATE_KEY_ID` = `private_key_id`
   5. `GOOGLE_PROJECT_ID` = `project_id`

6. Share the `database` gSheets and `main` gDocs with the newly-created service account (view-only permissions will do).

7. Create a v2 invisible [recaptcha site key](https://www.google.com/recaptcha/admin/create).
   1. Take note of the site key, you'll need this for the `GATSBY_CAPTCHA_SITE_KEY` Netlify env var.
   2. Take note of the secret key, you'll need this for the `CAPTCHA_SECRET` Netlify env var.

8. [Enable 2-Step Verification](https://myaccount.google.com/security) for your Google account if you haven't already, then create an app password, select Other (Custom name), label it something like 'Netlify', it'll be used by the `submitorder` Netlify lambda function to send out order emails using Gmail. Take note of the shown app password, you'll need this for the `GMAIL_PASS` Netlify env var.

9. Clone or fork this repository, then in Netlify, [create a new site from git](https://app.netlify.com/start).

10. Enter `gatsby build` for the build command, then input all the below [environment variables](#environment-variables) under advanced build settings.

11. Create the following labels in Gmail to help manage your order emails:
    1. Delivered (Grey)
    2. Order (Blue)
    3. Overdue (Red)
    4. Paid (Green)
    5. Payment (Cyan)
    6. Today (Yellow)

12. Create the following filters in Gmail to help manage your order emails, replace `<email>` with the email address as defined in the `EMAIL` env var:
    1. Matches: from:(`<email>`) subject:Order "Order Summary", Do this: Apply label "Order"
    2. Matches: from:(`<email>`) subject:(Payment for Order), Do this: Apply label "Payment"

13. Go to Google [Apps Script](https://script.google.com/home), and create a new project. Paste in the [below](#google-apps-scripts) `updateOrderLabels()` and `updatePaidStatus()` functions, change the `+8` next to `new Date(Date.now()` to your timezone offset as defined in `GATSBY_TZ_OFFSET` env var.

14. Click the triggers tab on the left,
    1. Add a new trigger to run `updateOrderLabels()` on midnight every day.
    2. Add a new trigger to run `updatePaidStatus()` every minute, or 5mins if it hits your quota.

15. Go to your Netlify site settings:
    1. General > Status badges - take note the deploy status badge URL.
    2. Build & Deploy > Build hooks > Add build hook - take note of the build hook URL.

16. Go to the database gSheets and click `Tools > Script editor`. Paste in the [below](#google-apps-scripts) `getStatus()` and `deploy()` functions, replace `<deploy_status_badge_id>` and `<build_hook_id>` with your site's values and save.

17. Click the triggers tab on the left, and add a new trigger to run `getStatus()` every 5mins.

18. Go to the Options sheet, select the `deploy to netlify` button, click the 3-dots dropdown menu button that appears, and click assign script. Enter `deploy` in the field.

19. Good to go! Reference the `Store Management Guide` gDocs to start populating your products and configuring your store in the database gSheets, then click the `deploy to netlify` button once done.

20. Pass the store maintainer(s) a copy of the guide for reference.

## Environment Variables

| Variable Name                      | Description                                                                | Valid Values                   | Example                                      |
| ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------- |
| CAPTCHA_SECRET                     | Server-side recaptcha secret                                               | String                         | Wq7AXx8o4MlrP8NdiTgaPA84qbBDj_Z2dOe49qgk     |
| EMAIL                              | The email address to use for from: header in order emails                  | String                         | admin@mymuiwebstore.com                      |
| GATSBY_CAPTCHA_SITE_KEY            | Client-side recaptcha site key                                             | String                         | 0ScI2OaLQVOMQA0uvXNGh8kKoF7MVtS_2B62TCrk     |
| GATSBY_SITE_COLOR_PRI_DARK         | Material design color palette, primary dark                                | 6 digit hexadecimal color code | #512da8                                      |
| GATSBY_SITE_COLOR_PRI_LIGHT        | Material design color palette, primary light                               | 6 digit hexadecimal color code | #d1c4e9                                      |
| GATSBY_SITE_COLOR_PRI_MAIN         | Material design color palette, primary main                                | 6 digit hexadecimal color code | #673ab7                                      |
| GATSBY_SITE_COLOR_SEC_DARK         | Material design color palette, secondary dark                              | 6 digit hexadecimal color code | #ffa000                                      |
| GATSBY_SITE_COLOR_SEC_LIGHT        | Material design color palette, secondary light                             | 6 digit hexadecimal color code | #ffecb3                                      |
| GATSBY_SITE_COLOR_SEC_MAIN         | Material design color palette, secondary main                              | 6 digit hexadecimal color code | #ffc107                                      |
| GATSBY_TZ_OFFSET                   | Timezone offset from UTC you are currently in                              | Number                         | 8                                            |
| GMAIL_PASS                         | App password for the gmail account to use for sending order emails         | String                         | vdpavfbdwextqdfg                             |
| GMAIL_USER                         | Gmail username for the gmail account to use for sending order emails       | String                         | mymuiwebstore@gmail.com                      |
| GOOGLE_CLIENT_EMAIL                | Service account json `client_email`                                        | String                         | gatsby@mymuiwebstore.iam.gserviceaccount.com |
| GOOGLE_CLIENT_ID                   | Service account json `client_id`                                           | String                         | 378462775875882189452                        |
| GOOGLE_DRIVE_ID                    | Google Drive assets folder ID                                              | String                         | 0BwwA4oUTeiV1TGRPeTVjaWRDY1E                 |
| GOOGLE_PRIVATE_KEY                 | Service account json `private_key`                                         | String                         | -----BEGIN PRIVATE KEY-----\nMIIEvQIB...     |
| GOOGLE_PRIVATE_KEY_ID              | Service account json `private_key_id`                                      | String                         | 3577461870923005507811543735910458182522     |
| GOOGLE_PROJECT_ID                  | Service account json `project_id`                                          | String                         | my-mui-webstore                              |
| GOOGLE_SPREADSHEET_ID              | Google Sheets ID containing the site database                              | String                         | 1s-GPiuRZdVcEJgjhnUKUncGTw6MQ1abAoNU7...     |
| SITE_AUTHOR                        | SEO site author                                                            | String                         | @mymuiwebstore                               |
| SITE_DESCRIPTION                   | SEO site description                                                       | String                         | Fast static webstore powered by Gatsby       |
| SITE_TITLE                         | SEO site title                                                             | String                         | My MUI Webstore                              |
| SITE_TITLE_SHORT                   | Shorter version of site title for mobile app icon, <=12 characters         | String                         | MMWS                                         |

## Google Apps Scripts

```javascript
// Update Gmail order labels
function updateOrderLabels() {
  const todayLabel = GmailApp.getUserLabelByName("Today");
  const overdueLabel = GmailApp.getUserLabelByName("Overdue");
  
  GmailApp.search('label:inbox label:today').forEach(thread => {
    overdueLabel.addToThread(thread);
    todayLabel.removeFromThread(thread);
    thread.markUnread();
  })
  
  const date = new Date(Date.now()+8*60*60*1000).toUTCString().substring(0, 16); // Replace +8 with your timezone offset
  GmailApp.search(`label:inbox label:order "${date}"`).forEach(thread => {
    todayLabel.addToThread(thread);
  })
    
  GmailApp.search('-label:inbox label:today').forEach(thread => {
    todayLabel.removeFromThread(thread);
  })
  
  GmailApp.search('-label:inbox label:overdue').forEach(thread => {
    overdueLabel.removeFromThread(thread);
  })
}

function updatePaidStatus() {
  const paidLabel = GmailApp.getUserLabelByName("Paid");
  
  GmailApp.search('label:inbox label:order -label:paid').forEach(thread => {
    const orderId = thread.getMessages()[0].getSubject().slice(-12);
    const paid = GmailApp.search(`-label:inbox label:payment ${orderId}`).length !== 0;
    paid && paidLabel.addToThread(thread);
  })
}
```

```javascript
// Deploy button and status badge in database gSheets Options sheet
function getStatus() {
  const start = Date.now();
  const ss = SpreadsheetApp.openById('<database_gsheets_id>');
  const sheet = ss.getSheetByName('Options');
  const cell = sheet.getRange('C1');
  cell.setFormula(`=IMAGE("https://api.netlify.com/api/v1/badges/<deploy_status_badge_id>/deploy-status?v=${Date.now().toString()}",1)`); // Replace <deploy_status_badge_id> with your own
}

function deploy() {
  UrlFetchApp.fetch('https://api.netlify.com/build_hooks/<build_hook_id>?trigger_title=Deployed+from+Google+Sheets', {'method': 'post'}); // Replace <build_hook_id> with your own
  Utilities.sleep(1000);
  getStatus();
}
```

## Attribution

Images used for sample products are sourced from Unsplash.

| Image   | Photographer                                                                         |
|---------|--------------------------------------------------------------------------------------|
| G-BUN-1 | [Gil Ndjouwou](https://unsplash.com/@gilndjouwou)                                    |
| G-BUN-2 | [Fran Jacquier](https://unsplash.com/@fran_)                                         |
| G-BUN-3 | [engin akyurt](https://unsplash.com/@enginakyurt)                                    |
| G-BRS-1 | [Tommaso Urli](https://unsplash.com/@tunnuz)                                         |
| G-BRS-2 | [Sergio Arze](https://unsplash.com/@sergich)                                         |
| G-COB-1 | [Jose luis](https://unsplash.com/@jlq73)                                             |
| G-COB-2 | [Massimo Adami](https://unsplash.com/@massimo_adami)                                 |
| G-DON-1 | [ELISA KERSCHBAUMER](https://unsplash.com/@__elisa__)                                |
| G-DON-2 | [Kenny Timmer](https://unsplash.com/@kcatimmer)                                      |
| G-DON-3 | [Ashley Byrd](https://unsplash.com/@byrdman85)                                       |
| G-FLB-1 | [Davey Gravy](https://unsplash.com/@davey_gravy)                                     |
| G-FLB-2 | [Nancy Hann](https://unsplash.com/@travelingwithpurpose)                             |
| G-PAC-1 | [Fa Barboza](https://unsplash.com/@fan11)                                            |
| G-PAC-2 | [Luke Pennystan](https://unsplash.com/@lukepennystan)                                |
| G-PAC-3 | [Mae Mu](https://unsplash.com/@picoftasty)                                           |
| G-SOD-1 | [Tommaso Urli](https://unsplash.com/@tunnuz)                                         |
| G-SOD-2 | [Debbie Widjaja](https://unsplash.com/@debbiewidjaja)                                |
| G-WHI-1 | [Laura Ockel](https://unsplash.com/@viazavier)                                       |
| G-WHI-2 | [Neetu Laddha](https://unsplash.com/@neetuladdha83)                                  |
| G-WHM-1 | [Bon Vivant](https://unsplash.com/@bonvivant)                                        |
| G-WHM-2 | [Jasmin Schreiber](https://unsplash.com/@lavievagabonde)                             |
| D-BUT-1 | [Sorin Gheorghita](https://unsplash.com/@sxtcxtc)                                    |
| D-BUT-2 | [Sorin Gheorghita](https://unsplash.com/@sxtcxtc)                                    |
| D-CHE-1 | [Alexander Maasch](https://unsplash.com/@tiefenscharf)                               |
| D-CHE-2 | [Charlie Solorzano](https://unsplash.com/@csolorzanoe)                               |
| D-CRE-1 | [Natallia Nagorniak](https://unsplash.com/@shot_recp)                                |
| D-CRE-2 | [Karolina Bobek](https://unsplash.com/@karolinabobek)                                |
| D-CUS-1 | [Dieny Portinanni](https://unsplash.com/@dienyportinanni)                            |
| D-CUS-2 | [Karina Zhukovskaya](https://unsplash.com/@cocarinne)                                |
| D-GEL-1 | [Bon Vivant](https://unsplash.com/@bonvivant)                                        |
| D-GEL-2 | [Jenna Day](https://unsplash.com/@jennaday)                                          |
| D-ICC-1 | [Michelle Tsang](https://unsplash.com/@petitesweetsnz)                               |
| D-ICC-2 | [American Heritage Chocolate](https://unsplash.com/@americanheritagechocolate)       |
| D-MIL-1 | [engin akyurt](https://unsplash.com/@enginakyurt)                                    |
| D-MIL-2 | [an_vision](https://unsplash.com/@anvision)                                          |
| D-WHE-1 | [HowToGym](https://unsplash.com/@howtogym)                                           |
| D-WHE-2 | [David Gabrielyan](https://unsplash.com/@david_gabriel)                              |
| D-YOG-1 | [Julian Hochgesang](https://unsplash.com/@julianhochgesang)                          |
| D-YOG-2 | [Wesual Click](https://unsplash.com/@wesual)                                         |
| V-ART-1 | [Margaret Jaszowska](https://unsplash.com/@margaret_jaszowska)                       |
| V-ART-2 | [Anne Allier](https://unsplash.com/@anneallier)                                      |
| V-ASP-1 | [Christine Siracusa](https://unsplash.com/@christine_siracusa)                       |
| V-ASP-2 | [Danielle MacInnes](https://unsplash.com/@dsmacinnes)                                |
| V-BOC-1 | [Jasmine Waheed](https://unsplash.com/@jasmine_waheed)                               |
| V-BOC-2 | [David Todd McCarty](https://unsplash.com/@davidtoddmccarty)                         |
| V-BRO-1 | [Tyrrell Fitness And Nutrition](https://unsplash.com/@tyrrell_fitness_and_nutrition) |
| V-BRO-2 | [Annie Spratt](https://unsplash.com/@anniespratt)                                    |
| V-CAB-1 | [Eric Prouzet](https://unsplash.com/@eprouzet)                                       |
| V-CAB-2 | [Dan-Cristian Pădureț](https://unsplash.com/@dancristianp)                           |
| V-CEL-1 | [Alexander Schimmeck](https://unsplash.com/@alschim)                                 |
| V-CEL-2 | [Randy Fath](https://unsplash.com/@randyfath)                                        |
| V-EGP-1 | [Charles Deluvio](https://unsplash.com/@charlesdeluvio)                              |
| V-EGP-2 | [Mockup Graphics](https://unsplash.com/@mockupgraphics)                              |
| V-LET-1 | [engin akyurt](https://unsplash.com/@enginakyurt)                                    |
| V-LET-2 | [Dim Hou](https://unsplash.com/@dimhou)                                              |
| V-ONI-1 | [mayu ken](https://unsplash.com/@mkmy)                                               |
| V-ONI-2 | [K8](https://unsplash.com/@k8_iv)                                                    |
| F-APL-1 | [Matheus Cenali](https://unsplash.com/@cenali)                                       |
| F-APL-2 | [an_vision](https://unsplash.com/@anvision)                                          |
| F-AVC-1 | [Hitoshi Namura](https://unsplash.com/@namu_photograph)                              |
| F-AVC-2 | [Thought Catalog](https://unsplash.com/@thoughtcatalog)                              |
| F-BAN-1 | [Anastasia Eremina](https://unsplash.com/@anastasiaeremina)                          |
| F-BAN-2 | [Louis Hansel](https://unsplash.com/@louishansel)                                    |
| F-COC-1 | [Max Lakutin](https://unsplash.com/@lktnm)                                           |
| F-COC-2 | [Tijana Drndarski](https://unsplash.com/@izgubljenausvemiru)                         |
| F-GRF-1 | [Rayia Soderberg](https://unsplash.com/@rayia)                                       |
| F-GRF-2 | [Charles Deluvio](https://unsplash.com/@charlesdeluvio)                              |
| F-MAN-1 | [Becky Mattson](https://unsplash.com/@bombaybecky2019)                               |
| F-MAN-2 | [Avinash Kumar](https://unsplash.com/@ashishjha)                                     |
| F-ORA-1 | [Adam Nieścioruk](https://unsplash.com/@adamsky1973)                                 |
| F-ORA-2 | [Theme Inn](https://unsplash.com/@themeinn)                                          |
| F-PER-1 | [Tijana Drndarski](https://unsplash.com/@izgubljenausvemiru)                         |
| F-PER-2 | [Jonathan Mast](https://unsplash.com/@jonathanmast)                                  |
| F-WAM-1 | [Roman Kraft](https://unsplash.com/@romankraft)                                      |
| F-WAM-2 | [Floh Maier](https://unsplash.com/@flohmaier)                                        |
