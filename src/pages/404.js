import React, { useContext, useEffect } from "react"
import { storeContext } from "../components/store"
import Seo from "../components/seo"
import { Typography } from "@material-ui/core"

const NotFoundPage = () => {
  const { dispatch } = useContext(storeContext)

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <Seo title="404: Not found" />
      <Typography variant="h6" gutterBottom>404: This page doesn't exist</Typography>
      <Typography variant="body1">This shouldn't happen? Let us know!</Typography>
    </>
  )
}

export default NotFoundPage