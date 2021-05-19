import React from "react"
import { graphql } from "gatsby"
import SEO from "./seo"
import Card from "./card"
import { Grid } from "@material-ui/core"

export default ({ data, pageContext }) => {
  const { nodes, distinct } = data.allGoogleSpreadsheetProducts

  return (
    <>
      <SEO title={pageContext.category} />
      <Grid container spacing={3}>
        {distinct.map((product,index) => {
          const db = nodes.filter(node => node.product === product)
          const glob = db[0].sku.split('-', 2).join('-') + '-'
          const images = data.allFile.nodes.filter(node => node.childImageSharp.gatsbyImageData.originalName.startsWith(glob))
          return (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Card data={db} images={images} />
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}

export const query = graphql`
query ($category: String!, $glob: String!) {
  allGoogleSpreadsheetProducts(filter: {category: {eq: $category}}) {
    nodes {
      sku
      category
      product
      variant
      unit
      price
      altPrice
      discount
      minQty
      delay
      available
    }
    distinct(field: product)
  }
  allFile(
    filter: {childImageSharp: {fluid: {originalName: {glob: $glob}}}}
    sort: {fields: childImageSharp___fluid___originalName, order: ASC}
  ) {
    nodes {
      childImageSharp {
        gatsbyImageData(
          quality: 90
          backgroundColor: "white"
          placeholder: BLURRED
          transformOptions: {fit: CONTAIN}
        )
        resize(width: 128, height: 128, quality: 90) {
          src
        }
      }
    }
  }
}
`