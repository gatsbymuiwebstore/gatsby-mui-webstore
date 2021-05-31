import React, { useContext, useEffect } from "react"
import { storeContext } from "../components/store"
import Seo from "../components/seo"

export default function WholesalesPage() {
  const { dispatch } = useContext(storeContext)

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <Seo title="Wholesales" />
      <p>Do contact us for more details.</p>
    </>
  )
}
