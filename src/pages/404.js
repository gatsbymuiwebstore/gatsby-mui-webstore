import React, { useContext, useEffect } from "react"
import { storeContext } from "../components/store"
import SEO from "../components/seo"
import { Typography } from "@material-ui/core"

const NotFoundPage = () => {
  const { dispatch } = useContext(storeContext)

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <SEO title="404: Not found" />
      <Typography variant="h6" gutterBottom>404: This page doesn't exist</Typography>
      <Typography variant="body">This shouldn't happen? Let us know!</Typography>
    </>
  )
}

export default NotFoundPage