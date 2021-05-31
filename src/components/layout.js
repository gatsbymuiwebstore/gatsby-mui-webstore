/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React, {useContext} from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import { storeContext } from "./store"
import Header from "./header"
import Cart from "./cart"
import Footer from "./footer"
import { makeStyles, Box, Button, Snackbar, Typography } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  page: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingBottom: theme.spacing(7),
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(15),
      paddingRight: theme.spacing(15),
      paddingBottom: theme.spacing(),
    },
    paddingTop: theme.spacing(9),
    marginTop: 'env(safe-area-inset-top)',
    marginLeft: 'env(safe-area-inset-left)',
    marginRight: 'env(safe-area-inset-right)',
  },
  snackbar: {
    [theme.breakpoints.down('xs')]: {
      top: 'unset',
      bottom: theme.spacing(7),
    },
    [theme.breakpoints.up('sm')]: {
      top: theme.spacing(7),
    },
  },
  noJSText: {
    marginTop: theme.spacing(-1),
    paddingBottom: theme.spacing(2),
  },
}))

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default function Layout({ children }) {
  const classes = useStyles()
  const { state, dispatch } = useContext(storeContext)

  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      <Cart />
      <Snackbar
        className={classes.snackbar}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={state.showUndo}
        autoHideDuration={5000}
        onClose={(event, reason) => reason !== 'clickaway' && dispatch({type: 'showUndo', payload: false})}
        message={'Item deleted'}
        action={<Button color="secondary" size="small" onClick={() => dispatch({type: 'undoDelete'})}>UNDO</Button>}
      />
      <Box className={classes.page}>
        <noscript>
          <Typography
            className={classes.noJSText}
            variant="h6"
            color="error"
          >
            Please <a href="https://www.whatismybrowser.com/guides/how-to-enable-javascript/" target="_blank" rel="noopener noreferrer">enable JavaScript</a> to place an order.
          </Typography>
        </noscript>
        <main>{children}</main>
        <Footer siteTitle={data.site.siteMetadata.title} />
      </Box>
    </>
  )
}
