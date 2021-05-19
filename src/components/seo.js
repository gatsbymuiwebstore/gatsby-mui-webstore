/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

function SEO({ description, lang, meta, image: metaImage, title: metaTitle }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            siteUrl
          }
        }
      }
    `
  )

  const title = metaTitle.length !== 0 ? metaTitle : site.siteMetadata.title
  const metaDescription = description || site.siteMetadata.description
  const image = metaImage || {src: "/icons/icon-1200x630.png", width: 1200, height: 630}

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={metaTitle.length !== 0 ? `%s | ${site.siteMetadata.title}` : site.siteMetadata.title}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        {
          name: `apple-mobile-web-app-capable`,
          content: `yes`,
        },
        {
          name: `apple-mobile-web-app-status-bar-style`,
          content: `black-translucent`,
        },
        {
          name: `viewport`,
          content: `width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover`,
        },
      ]
        .concat([
          {
            property: "og:image",
            content: `${site.siteMetadata.siteUrl}${image.src}`,
          },
          {
            property: "og:image:width",
            content: image.width,
          },
          {
            property: "og:image:height",
            content: image.height,
          },
          {
            name: "twitter:card",
            content: "summary_large_image",
          },
        ])
          .concat(meta)}
      link={[
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-1136x640.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/splash/splash-2436x1125.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-1792x828.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-828x1792.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-1334x750.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/splash/splash-1242x2688.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/splash/splash-2208x1242.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/splash/splash-1125x2436.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
          href: "/splash/splash-1242x2208.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-2732x2048.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
          href: "/splash/splash-2688x1242.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-2224x1668.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-750x1334.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-2048x2732.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-2388x1668.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-1668x2224.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-640x1136.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-1668x2388.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
          href: "/splash/splash-2048x1536.png"
        },
        {
          rel: "apple-touch-startup-image",
          media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "/splash/splash-1536x2048.png"
        }
      ]}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
}

export default SEO
