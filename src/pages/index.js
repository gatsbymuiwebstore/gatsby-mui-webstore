import React, { useContext, useEffect } from "react"
import { storeContext } from "../components/store"
import Seo from "../components/seo"
import html from "raw-loader!../../assets/main.html"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    maxWidth: theme.spacing(85),
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
    },
  },
}))

const IndexPage = () => {
  const classes = useStyles()
  const { dispatch } = useContext(storeContext)

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <Seo title="" />
      <div className={classes.root} dangerouslySetInnerHTML={{__html: html}} />
    </>
  )
}

export default IndexPage
