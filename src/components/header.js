import React, { useContext } from "react"
import PropTypes from "prop-types"
import { graphql, navigate, useStaticQuery, Link } from "gatsby"
import { useIsJsEnabled } from "gatsby-plugin-js-fallback"
import { storeContext } from "./store"
import logo from "../../assets/logos/logo.svg"
import {
  makeStyles,
  AppBar,
  Avatar,
  Box,
  Hidden,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Toolbar,
  Typography
} from "@material-ui/core"
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart"

const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.modal + 1,
    paddingTop: 'env(safe-area-inset-top)',
  },
  title: {
    paddingLeft: theme.spacing(2),
  },
  tabsBottom: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: theme.zIndex.appBar,
  },
  tabsBottomIndicator: {
    top: 0,
  },
  tabsBottomShadow: {
    boxShadow: '0px -2px 1px -1px rgba(0,0,0,0.2), 0px -1px 1px 0px rgba(0,0,0,0.14), 0px -1px 3px 0px rgba(0,0,0,0.12)',
  },
  tabBottom: {
    minWidth: theme.spacing(9),
  },
  tabsTop: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    maxWidth: theme.spacing(85),
    flexGrow: 1,
  },
  tabTop: {
    minWidth: theme.spacing(9),
    flexGrow: 1,
  },
}))

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default function Header(props) {
  const classes = useStyles()
  const { state, dispatch } = useContext(storeContext)
  const isJsEnabled = useIsJsEnabled()

  const handleChange = (e, newIndex) => {
    dispatch({type: 'setTabIndex', payload: newIndex})
    dispatch({type: 'showCart', payload: false})
  }

  const { distinct } = useStaticQuery(
    graphql`
      query {
        allGoogleSpreadsheetProducts {
          distinct(field: category)
        }
      }
    `
  ).allGoogleSpreadsheetProducts

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar variant="dense" style={{justifyContent:'space-between'}}>
          <Link
            to={'/'}
            style={{color:'inherit', textDecoration:'inherit'}}
            onClick={() => dispatch({type:'showCart', payload:false})}
          >
            <Box style={{display:'flex', alignItems:'center'}}>
              <Avatar src={logo} alt="Logo" />
              <Typography className={classes.title} variant="h6" color="inherit">
                {props.siteTitle}
              </Typography>
            </Box>
          </Link>
          <Hidden smDown implementation="css" className={classes.tabsTop}>
            <Tabs
              centered
              value={state.tabIndex}
              onChange={handleChange}
              aria-label="category tabs"
            >
              {distinct.map((category,index) =>
                isJsEnabled ?
                <Tab
                  key={index}
                  label={category}
                  classes={{root: classes.tabTop}}
                  onClick={() => navigate('/' + category.toLowerCase().replace(/\s+/g, '-').slice(0, 200))}
                /> :
                <Tab
                  key={index}
                  label={category}
                  classes={{root: classes.tabTop}}
                  component="a"
                  href={'/' + category.toLowerCase().replace(/\s+/g, '-').slice(0, 200)}
                />
              )}
            </Tabs>
          </Hidden>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="cart"
            onClick={() => dispatch({type: 'showCart', payload: !state.showCart})}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Hidden mdUp implementation="css">
        <Paper className={classes.tabsBottom} classes={{elevation1: classes.tabsBottomShadow}} square>
          <Tabs
            variant="fullWidth"
            value={state.tabIndex}
            onChange={handleChange}
            aria-label="category tabs"
            TabIndicatorProps={{classes:{root: classes.tabsBottomIndicator}}}
          >
            {distinct.map((category,index) =>
              isJsEnabled ?
              <Tab
                key={index}
                label={category}
                classes={{root: classes.tabBottom}}
                onClick={() => navigate('/' + category.toLowerCase().replace(/\s+/g, '-').slice(0, 200))}
              /> :
              <Tab
                key={index}
                label={category}
                classes={{root: classes.tabBottom}}
                component="a"
                href={'/' + category.toLowerCase().replace(/\s+/g, '-').slice(0, 200)}
              />
            )}
          </Tabs>
        </Paper>
      </Hidden>
    </>
  )
}
