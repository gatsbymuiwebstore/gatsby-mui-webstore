import React, { useReducer, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { getSrc } from "gatsby-plugin-image"
import createClone from "rfdc"
import { v4 as uuidv4 } from "uuid"

export const storeContext = React.createContext()

function reducer(state, action) {
  const calcFreeDelivery = (calced, postal) => {
    if (state.promo.freedelivery)
      return true
    if (postal.length === 6) {
      const isAltDistrict = state.deliveryAltDistricts.includes(postal.slice(0,2))
      if (state.promo.freedeliverythresholds) {
        return (calced.subtotal - calced.discount) >=
          (isAltDistrict ? state.promo.freedeliverythresholds[0] : state.promo.freedeliverythresholds[1])
      }
      return (calced.subtotal - calced.discount) >=
        (isAltDistrict ? state.deliveryAltFreeThreshold : state.deliveryFreeThreshold)
    }
  }
  const calcSubtotal = (altPrices, cart) => {
    const subtotals = cart.reduce((acc, item) =>
      ({
        nonDiscSubtotal: item.discount <= 0 ?
          acc.nonDiscSubtotal + (altPrices ? item.altPrice : item.price) * item.qty :
          acc.nonDiscSubtotal,
        discSubtotal: item.discount > 0 ?
          acc.discSubtotal + (altPrices ? item.altPrice : item.price) * item.qty :
          acc.discSubtotal,
        discount: item.discount > 0 ? acc.discount + item.discount * item.qty : acc.discount,
      })
    , {nonDiscSubtotal: 0, discSubtotal: 0, discount: 0})
    const subtotal = subtotals.nonDiscSubtotal + subtotals.discSubtotal
    subtotals.promoDiscount = state.promo.fixed ? state.promo.fixed : 0
    if (state.promo.percentage) {
      subtotals.promoDiscount += subtotal*state.promo.percentage - subtotals.discount*state.promo.percentage
    }
    return {
      subtotal: subtotal,
      discount: subtotals.nonDiscSubtotal >=
        state.discountThreshold ? subtotals.discount + subtotals.promoDiscount : subtotals.promoDiscount,
    }
  }
  const processInvalid = cart => {
    const newCart = []
    const invalid = cart.filter(item => {
      if (item.available) {
        newCart.push({...item, id: uuidv4()})
        return false
      } else return true
    })
    if (invalid.length !== 0)
      return {show: true, invalid: invalid, cart: newCart}
    else
      return {show: false, cart: newCart}
  }

  switch (action.type) {
    case 'setTabIndex':
      return {...state, tabIndex: action.payload}
    case 'saveInfo':
      return {...state, savedInfo: action.payload}
    case 'saveCart': {
      const clone = createClone()
      const savedCarts = state.savedCarts.filter(i => i.name !== action.payload).concat(
        {id: uuidv4(), name: action.payload, cart: clone(state.cart)}
      )
      return {...state, savedCarts: savedCarts}
    }
    case 'deleteCart': {
      const item = state.savedCarts.find(i => i.name === action.payload)
      const undo = {type: 'savedCart', payload: {...item, id: uuidv4()}}
      const savedCarts = state.savedCarts.filter(i => i.name !== action.payload)
      return {...state, savedCarts: savedCarts, undo: undo, showUndo: true}
    }
    case 'clearCart': {
      const clone = createClone()
      const savedCarts = state.savedCarts.concat({id: uuidv4(), name: action.payload, cart: clone(state.cart)})
      return {...state, cart: [], subtotal: 0, savedCarts: savedCarts}
    }
    case 'showCart':
      return {...state, showCart: action.payload}
    case 'showUndo':
      return {...state, showUndo: action.payload}
    case 'setInvalid':
      return {...state, invalid: action.payload}
    case 'load': {
      const altPrices = typeof action.payload.altPrices === "boolean" ? action.payload.altPrices : state.altPrices
      const processed = processInvalid(action.payload.cart)
      const calced = calcSubtotal(altPrices, processed.cart)
      return {
        ...state,
        ...calced,
        altPrices: state.altPricesDisabled ? false : altPrices,
        cart: processed.cart,
        freeDelivery: calcFreeDelivery(calced, action.payload.savedInfo.postal),
        invalid: {show: processed.show, items: processed.invalid},
        savedCarts: action.payload.savedCarts,
        savedInfo: action.payload.savedInfo,
      }
    }
    case 'loadCart': {
      const savedCart = state.savedCarts.find(i => i.name === action.payload)
      const processed = processInvalid(savedCart.cart)
      const calced = calcSubtotal(state.altPrices, processed.cart)
      return {
        ...state,
        ...calced,
        cart: processed.cart,
        freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        invalid: {show: processed.show, items: processed.invalid},
      }
    }
    case 'incrementQty': {
      const item = state.cart.find(i => i.sku === action.payload.sku)
      if (!item) {
        const cart = state.cart.concat({
          ...action.payload,
          price: parseFloat(action.payload.price),
          altPrice: parseFloat(action.payload.altPrice),
          discount: parseFloat(action.payload.discount),
          minQty: parseInt(action.payload.minQty),
          delay: action.payload.delay.toLowerCase().includes('yes'),
          available: action.payload.available.toLowerCase().includes('yes'),
          qty: parseInt(action.payload.minQty),
          id: uuidv4(),
        })
        const calced = calcSubtotal(state.altPrices, cart)
        return {
          ...state,
          ...calced,
          cart: cart,
          freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        }
      }
      else {
        if (item.qty < 999) {
          item.qtyErr = false
          item.qty++
        }
        const calced = calcSubtotal(state.altPrices, state.cart)
        return {
          ...state,
          ...calced,
          freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        }
      }
    }
    case 'decrementQty': {
      const item = state.cart.find(i => i.sku === action.payload.sku)
      if (!item)
        return {...state}
      else if (item.qty <= item.minQty) {
        const cart = state.cart.filter(i => i.sku !== action.payload.sku)
        const calced = calcSubtotal(state.altPrices, cart)
        return {
          ...state,
          ...calced,
          cart: cart,
          freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        }
      }
      else {
        item.qtyErr = false
        item.qty--
        const calced = calcSubtotal(state.altPrices, state.cart)
        return {
          ...state,
          ...calced,
          freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        }
      }
    }
    case 'changeQty': {
      const item = state.cart.find(i => i.sku === action.payload.sku)
      if (!item)
        return {...state}
      else if (!action.payload.qty || action.payload.qty < item.minQty || action.payload.qty > 999) {
        if (action.payload.qty && action.payload.qty <= 0) {
          const cart = state.cart.filter(i => i.sku !== action.payload.sku)
          const calced = calcSubtotal(state.altPrices, cart)
          return {
            ...state,
            ...calced,
            cart: cart,
            freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
            undo: {type: 'cart', payload: {...item, id: uuidv4()}},
            showUndo: true,
          }
        }
        item.qtyErr = true
        item.qtyErrVal = action.payload.qty
        return {...state}
      }
      else {
        item.qtyErr = false
        item.qty = action.payload.qty
        const calced = calcSubtotal(state.altPrices, state.cart)
        return {
          ...state,
          ...calced,
          freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
        }
      }
    }
    case 'undoDelete':
      switch (state.undo.type) {
        case 'cart':
          const cart = state.cart.filter(i => i.sku !== state.undo.payload.sku).concat(state.undo.payload)
          const calced = calcSubtotal(state.altPrices, cart)
          return {
            ...state,
            ...calced,
            cart: cart,
            freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
            showUndo: false,
          }
        case 'savedCart':
          const savedCarts = state.savedCarts.filter(i => i.name !== state.undo.payload.name).concat(state.undo.payload)
          return {...state, savedCarts: savedCarts, showUndo: false}
        default:
          throw new Error()
      }
    case 'setPostal':
      return {
        ...state,
        freeDelivery: calcFreeDelivery({subtotal: state.subtotal, discount: state.discount}, action.payload),
        savedInfo: {...state.savedInfo, postal: action.payload},
      }
    case 'setAltPrices': {
      const calced = calcSubtotal(action.payload, state.cart)
      return {
        ...state,
        ...calced,
        altPrices: action.payload,
        freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
      }
    }
    case 'setPromo': {
      const promo = {}
      if (action.payload.fixed) {
        promo.fixed = Math.max(0, parseFloat(action.payload.fixed))
      }
      if (action.payload.percentage) {
        promo.percentage = Math.min(1, Math.max(0, parseFloat(action.payload.percentage)/100))
      }
      if (action.payload.freedelivery)
        promo.freedelivery = true
      else
        if (action.payload.freedeliverythresholds)
          promo.freedeliverythresholds = action.payload.freedeliverythresholds.split(',').map(str => parseFloat(str))
      return {...state, promo: promo}
    }
    case 'clearPromo':
      return {
        ...state,
        promo: {},
      }
    case 'reCalc': {
      const calced = calcSubtotal(state.altPrices, state.cart)
      return {
        ...state,
        ...calced,
        freeDelivery: calcFreeDelivery(calced, state.savedInfo.postal),
      }
    }
    default:
      return state
  }
}

const Provider = props => {
  const query = useStaticQuery(
    graphql`
      query {
        allFile(filter: {name: {glob: "*-*-1"}}) {
          nodes {
            childImageSharp {
              gatsbyImageData(
                width: 128
                height: 128
                quality: 90
                placeholder: BLURRED
                formats: [AUTO, WEBP, AVIF]
              )
            }
            name
          }
        }
        allGoogleSpreadsheetProducts {
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
        }
        options {
          altPricesDefault
          altPricesDisabled
          deliveryAltDistricts
          deliveryAltFreeThreshold
          deliveryFreeThreshold
          discountThreshold
        }
      }
    `
  )

  const [state, dispatch] = useReducer(reducer, {
    altPrices: query.options.altPricesDefault.toLowerCase().includes('yes'),
    altPricesDisabled: query.options.altPricesDisabled.toLowerCase().includes('yes'),
    deliveryAltDistricts: query.options.deliveryAltDistricts.split(',').map(str => str.trim()),
    deliveryAltFreeThreshold: parseFloat(query.options.deliveryAltFreeThreshold),
    deliveryFreeThreshold: parseFloat(query.options.deliveryFreeThreshold),
    discountThreshold: parseFloat(query.options.discountThreshold),
    cart: [],
    freeDelivery: false,
    invalid: {show: false},
    savedCarts: [],
    savedInfo: {postal: ''},
    showCart: false,
    showUndo: false,
    subtotal: 0,
    tabIndex: false,
    promo: {},
  })

  useEffect(
    () => {
      const getMetadata = item => {
        const node = query.allGoogleSpreadsheetProducts.nodes.find(node => node.sku === item.sku)
        if (node) {
          const glob = str => str?.split('-', 2).join('-')
          const image = query.allFile.nodes.find(imageNode => glob(imageNode.name) === glob(item.sku))
          return {
            ...node,
            ...item,
            price: parseFloat(node.price),
            altPrice: parseFloat(node.altPrice),
            discount: parseFloat(node.discount),
            minQty: parseInt(node.minQty),
            delay: node.delay.toLowerCase().includes('yes'),
            available: node.available.toLowerCase().includes('yes'),
            image: getSrc(image),
          }
        } else return item
      }
      try {
        const cart = (JSON.parse(window.localStorage.getItem('cart')) || []).map(item => getMetadata(item))
        const savedCarts = (JSON.parse(window.localStorage.getItem('savedCarts')) || []).map(savedCart => {
          if (savedCart.name.trim().length === 0) throw new Error()
          const cartItems = savedCart.cart.map(item => getMetadata(item))
          return {id: uuidv4(), name: savedCart.name, cart: cartItems}
        })
        const savedInfo = JSON.parse(window.localStorage.getItem('savedInfo'))
        if (typeof savedInfo !== "object" || savedInfo === null) throw new Error()
        const altPrices = JSON.parse(window.localStorage.getItem('altPrices'))
        if (typeof altPrices !== "boolean") throw new Error()
        dispatch({
          type: 'load',
          payload: {
            altPrices: altPrices,
            cart: cart,
            savedCarts: savedCarts,
            savedInfo: savedInfo,
          }
        })
      } catch {
      window.localStorage.clear()
    }
    },[query])

  useEffect(
    () => {
      if (!state.altPricesDisabled)
        window.localStorage.setItem('altPrices', JSON.stringify(state.altPrices))
      if (state.cart) {
        const cart = JSON.stringify(state.cart.map(item => ({sku: item.sku, qty: item.qty})))
        if (window.localStorage.getItem('cart') !== cart)
          window.localStorage.setItem('cart', cart)
      }
      if (state.savedCarts) {
        const savedCarts = JSON.stringify(state.savedCarts.map(savedCart => (
          {name: savedCart.name, cart: savedCart.cart.map(item => ({sku: item.sku, qty: item.qty}))}
        )))
        if (window.localStorage.getItem('savedCarts') !== savedCarts)
          window.localStorage.setItem('savedCarts', savedCarts)
      }
      if (state.savedInfo) {
        const savedInfo = JSON.stringify(state.savedInfo)
        if (window.localStorage.getItem('savedInfo') !== savedInfo)
          window.localStorage.setItem('savedInfo', savedInfo)
      }
    },[state])

  return (
    <storeContext.Provider value={{
      state,
      dispatch
    }}>
      {props.children}
    </storeContext.Provider>
  )
}

export default function Store({ element }) {
  return (
    <Provider>
      {element}
    </Provider>
  )
}