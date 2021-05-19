import React, { useContext, useEffect } from "react"
import { storeContext } from "../components/store"
import SEO from "../components/seo"

const WholesalesPage = () => {
  const { dispatch } = useContext(storeContext)

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <SEO title="Wholesales" />
      <p>Do contact us for more details.</p>
    </>
  )
}

export default WholesalesPage