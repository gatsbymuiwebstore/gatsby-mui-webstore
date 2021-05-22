import React from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useIsJsEnabled } from "gatsby-plugin-js-fallback"
import Seo from "./seo"
import { makeStyles, Box, IconButton, Typography } from "@material-ui/core"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"

const useStyles = makeStyles(theme => ({
  backButton: {
    marginTop: theme.spacing(-2),
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(-2),
  },
  title: {
    marginTop: theme.spacing(-1),
  },
  image: {
    marginBottom: theme.spacing(),
  },
}))

export default function Product({ data, pageContext }) {
  const classes = useStyles()
  const { nodes } = data.allFile
  const isJsEnabled = useIsJsEnabled()

  const backButton = <IconButton
                      className={classes.backButton}
                      color="inherit"
                      aria-label="back"
                      onClick={() => window.history.back()}
                    >
                      <ArrowBackIcon />
                    </IconButton>

  return (
    <>
      <Seo title={pageContext.node.category + ', ' + pageContext.node.product} image={nodes[0]?.childImageSharp.seo} />
      <Box display="flex">
      {isJsEnabled ?
        backButton :
        <Link
          to={'/' + pageContext.node.category.toLowerCase().replace(/\s+/g, '-').slice(0, 200)}
          style={{color:'inherit'}}
        >
          {backButton}
        </Link>
      }
        <Typography className={classes.title} variant="h6" color="inherit" noWrap>
          {pageContext.node.product}
        </Typography>
      </Box>
      {nodes.map((item, index) => <GatsbyImage
        image={getImage(item.childImageSharp.image)}
        alt={item.name}
        key={index}
        className={classes.image} />)}
    </>
  )
}

export const query = graphql`
query ($glob: String!) {
  allFile(filter: {name: {glob: $glob}}, sort: {fields: name}) {
    nodes {
      childImageSharp {
        image: gatsbyImageData(
          layout: FULL_WIDTH
        )
        seo: gatsbyImageData(
          layout: FIXED
          width: 1200
          height: 630
          backgroundColor: "white"
          transformOptions: {fit: CONTAIN}
        )
      }
      name
    }
  }
}
`