import React, { useContext, useState } from "react"
import { Link } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import { storeContext } from "./store"
import logo from "../../assets/logos/logo.svg"
import SwipeableViews from "react-swipeable-views"
import {
  makeStyles,
  Badge,
  Box,
  Card,
  CardActions,
  CardActionArea,
  CardContent,
  Fab,
  IconButton,
  MenuItem,
  TextField,
  Typography
} from "@material-ui/core"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import CancelIcon from "@material-ui/icons/Cancel"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"

const useStyles = makeStyles(theme => ({
  cardContent: {
    paddingTop: theme.spacing(),
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: theme.spacing(2),
  },
  cardActions: {
    minHeight: theme.spacing(6),
  },
  input: {
    paddingLeft: theme.spacing(),
  },
  price: {
    marginLeft: 'auto',
    paddingRight: theme.spacing(),
  },
  fab: {
    float: 'right',
    marginTop: theme.spacing(-11),
    marginRight: theme.spacing(),
  },
  badge: {
    right: -5,
    top: -5,
  },
}))

export default ({ data, images }) => {
  const classes = useStyles()
  const {state, dispatch} = useContext(storeContext)
  const [payload, setPayload] = useState(data[0])
  const itemInCart = state.cart.find(i => i.sku === payload.sku)
  const available = payload.available.toLowerCase().includes('yes')

  const unitPrice = available ?
    <Typography className={classes.price} color="primary" style={{fontWeight:'bold'}} noWrap>
      ${state.altPrices ? payload.altPrice : payload.price} / {payload.unit}
    </Typography> :
    <Typography className={classes.price} color="error" style={{fontWeight:'bold'}} noWrap>
      Sold Out
    </Typography>

  const title =
    <CardActionArea>
      <CardContent className={classes.cardContent}>
        <Typography style={{fontWeight:'bold'}} noWrap>
          {payload.product}
        </Typography>
      </CardContent>
    </CardActionArea>

  return (
    <Card>
      {images[0] ?
        <>
          <SwipeableViews enableMouseEvents>
            {images.map((item, index) => <GatsbyImage image={item.childImageSharp.gatsbyImageData} key={index} />)}
          </SwipeableViews>
          <Link
            to={'/' + data[0].category.toLowerCase().replace(/\s+/g, '-').slice(0, 200) + '/' + data[0].product.toLowerCase().replace(/\s+/g, '-').slice(0, 200)}
            style={{color:'inherit', textDecoration:'none'}}
          >
            {title}
          </Link>
        </> :
        <>
          <img style={{display:'block', margin:'auto'}} src={logo} alt="Logo" width="67%" height="100%" />
          {title}
        </>
      }
      {available &&
        <Box className={classes.fab}>
          {itemInCart &&
            <IconButton
              edge="start"
              aria-label="remove from cart"
              onClick={() => dispatch({type: 'decrementQty', payload: {sku: payload.sku}})}
            >
              {itemInCart.qty <= parseInt(payload.minQty) ? <CancelIcon /> : <RemoveCircleIcon />}
            </IconButton>}
          <Fab
            aria-label="add to cart"
            size="medium"
            color="primary"
            onClick={() => dispatch({type: 'incrementQty', payload: {...payload, image:images[0]?.childImageSharp.resize.src}})}
          >
            <Badge
              classes={{badge: classes.badge}}
              color="secondary"
              max={999}
              badgeContent={itemInCart?.qty}
            >
              <AddShoppingCartIcon />
            </Badge>
          </Fab>
        </Box>}
      <CardActions disableSpacing className={classes.cardActions}>
        {data[0].variant ?
          <Box display="flex" flexGrow="1" justifyContent="space-between" alignItems="center" maxWidth="100%">
            <TextField
              InputProps={{classes:{input: classes.input}}}
              style={{flexGrow:1, maxWidth:'45%'}}
              id={`${data[0].product}-variant-select`}
              select
              size="small"
              value={payload.variant}
              onChange={e => setPayload(data.find(i => i.variant === e.target.value))}
            >
              {data.map((item, index) => <MenuItem key={index} value={item.variant}>{item.variant}</MenuItem>)}
            </TextField>
            {unitPrice}
          </Box> :
          <>{unitPrice}</>}
      </CardActions>
    </Card>
  )
}