import React, { useContext, useState } from "react"
import { graphql, navigate, useStaticQuery } from "gatsby"
import clsx from "clsx"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { ActionAnimations, SwipeableListItem } from "@sandstreamdev/react-swipeable-list"
import "@sandstreamdev/react-swipeable-list/dist/styles.css"
import NumberFormat from "react-number-format"
import { storeContext } from "./store"
import logo from "../../assets/logos/logo.svg"
import {
  makeStyles,
  Avatar,
  Backdrop,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Divider,
  Drawer,
  Fade,
  Hidden,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Modal,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline"
import PublishIcon from "@material-ui/icons/Publish"
import RemoveIcon from "@material-ui/icons/Remove"

const useStyles = makeStyles(theme => ({
  toolbar: {
    minHeight: theme.spacing(6),
    marginTop: 'env(safe-area-inset-top)',
  },
  itemText: {
    display: 'block',
    paddingRight: theme.spacing(),
  },
  checkout: {
    display: 'block',
    paddingLeft: theme.spacing(9),
    paddingRight: theme.spacing(9),
  },
  spacer: {
    paddingTop: theme.spacing(),
  },
  qty: {
    width: '2em',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
  deleteBg: {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(216, 48, 37)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteIcon: {
    color: theme.palette.background.paper,
    marginRight: theme.spacing(3),
  },
  drawer: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerPaper: {
    width: '100%',
    maxWidth: theme.spacing(50),
  },
  drawerOpen: {
    width: theme.spacing(50),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflow: 'hidden',
    width: theme.spacing(9),
  },
  saveCart: {
    alignItems: 'center',
    display: 'flex',
    paddingLeft: theme.spacing(),
    paddingBottom: theme.spacing(),
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    outline: 'none',
  },
  exit: {
    opacity: 1,
  },
  exitActive: {
    opacity: 0,
    maxHeight: 0,
    transition: "max-height 500ms, opacity 500ms",
  },
  enter: {
    opacity: 0,
    maxHeight: 0,
  },
  enterActive: {
    opacity: 1,
    maxHeight: "1000px",
    transition: "max-height 500ms, opacity 500ms",
  },
}))

export default function Cart() {
  const classes = useStyles()
  const { state, dispatch } = useContext(storeContext)
  const [saveCart, setSaveCart] = useState({show: false, key: ''})

  const { options } = useStaticQuery(
    graphql`
      query {
        options {
          altPricesDisabled
          altPricesName
        }
      }
    `
  )

  const content = (
    <>
      <Box className={classes.toolbar} />
        <List style={{paddingRight:'env(safe-area-inset-right)'}} disablePadding>
          {state.cart.length !== 0 ?
            <TransitionGroup>
              {state.cart.map(item =>
                <CSSTransition
                  key={item.id}
                  classNames={{
                    exit: classes.exit,
                    exitActive: classes.exitActive,
                    enter: classes.enter,
                    enterActive: classes.enterActive
                  }}
                  timeout={1000}
                >
                  <SwipeableListItem
                    swipeLeft={{
                      content: <Box className={classes.deleteBg}>
                                <DeleteOutlineIcon className={classes.deleteIcon} />
                              </Box>,
                      actionAnimation: ActionAnimations.REMOVE,
                      action: () => dispatch({type: 'changeQty', payload: {sku: item.sku, qty: -1}}),
                    }}
                    threshold={0.33}
                  >
                    <ListItem>
                      <ListItemAvatar>
                        <Badge
                          color="secondary"
                          max={999}
                          badgeContent={state.cart.find(i => i.sku === item.sku)?.qty}
                        >
                          {item.image ?
                            <Avatar src={item.image} alt={item.product + '-icon'} /> :
                            <Avatar src={logo} alt="Logo" />
                          }
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product}
                        secondary={item.variant}
                        primaryTypographyProps={{classes:{root:classes.itemText}, noWrap: true}}
                        secondaryTypographyProps={{classes:{root:classes.itemText}, noWrap: true}}
                      />
                      <NumberFormat
                        customInput={TextField}
                        decimalScale="0"
                        allowNegative={false}
                        className={classes.qty}
                        type="text"
                        error={item.qtyErr}
                        name={item.sku}
                        inputProps={{
                          inputMode: 'numeric',
                          style:{textAlign: 'center'},
                          min: item.minQty, max: 999,
                        }}
                        value={item.qtyErr ? item.qtyErrVal : item.qty}
                        onChange={event => dispatch({
                          type: 'changeQty',
                          payload: {sku: event.target.name, qty: event.target.value},
                        })}
                        aria-label="change quantity"
                      />
                      <ButtonGroup
                        orientation="vertical"
                        color="primary"
                        size="small"
                        aria-label="change quantity"
                        variant="contained"
                      >
                        <Button
                          aria-label="add"
                          onClick={() => dispatch({type: 'incrementQty', payload: item})}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                        <Button
                          aria-label="remove"
                          onClick={() => item.qty > item.minQty &&
                            dispatch({type: 'decrementQty', payload: {sku: item.sku}})}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>
                    </ListItem>
                  </SwipeableListItem>
                </CSSTransition>
              )}
            </TransitionGroup> :
            <ListItem>
              <ListItemText className={classes.spacer} inset>Cart Empty</ListItemText>
            </ListItem>
          }
        </List>
        {state.cart.length !== 0 &&
          <List>
            <ListItem>
              <ListItemText style={{margin:0}} inset>
                Subtotal: ${state.subtotal.toFixed(2)}
              </ListItemText>
            </ListItem>
            {(state.discount || null) &&
              <ListItem>
                <ListItemText style={{margin:0}} inset>
                  Discount: ${state.discount.toFixed(2)}
                </ListItemText>
              </ListItem>
            }
            <ListItem>
              <ListItemText style={{margin:0}} inset>
                <Switch
                  checked={state.altPrices}
                  disabled={options.altPricesDisabled.toLowerCase().includes('yes')}
                  onChange={event => dispatch({type: 'setAltPrices', payload: event.target.checked})}
                />
                {options.altPricesName}
              </ListItemText>
            </ListItem>
            <ListItem className={classes.checkout}>
              <Collapse in={saveCart.show}>
                <Box className={classes.saveCart}>
                  <TextField
                    variant="outlined"
                    size="small"
                    onBlur={event => {
                      const key = event.target.value.replace(/\s+/g, " ").trim()
                      if (key.length > 0)
                        dispatch({type: 'saveCart', payload: key})
                      event.target.value = ''
                      setSaveCart({show: false})
                    }}
                    onKeyPress={event => {
                      if (event.key === 'Enter' && event.target.value.replace(/\s+/g, " ").trim().length > 0) {
                        event.target.blur()
                      }
                    }}
                  />
                </Box>
              </Collapse>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {navigate('/order/'); dispatch({type: 'showCart', payload: false})}}
                >
                  Checkout
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={saveCart.show}
                  onClick={() => setSaveCart({...saveCart, show: true})}
                >
                  Save Cart
                </Button>
              </Box>
            </ListItem>
          </List>
        }
        {state.savedCarts.length !== 0 &&
          <>
            <List
              style={{paddingRight:'env(safe-area-inset-right)'}}
              subheader={<ListSubheader className={classes.spacer} inset>Saved Carts</ListSubheader>}
            >
              <Divider variant="inset" />
              <TransitionGroup>
                {state.savedCarts.map(item =>
                  <CSSTransition
                    key={item.id}
                    classNames={{
                      exit: classes.exit,
                      exitActive: classes.exitActive,
                      enter: classes.enter,
                      enterActive: classes.enterActive
                    }}
                    timeout={1000}
                  >
                    <SwipeableListItem
                      swipeLeft={{
                        content: <Box className={classes.deleteBg}>
                                  <DeleteOutlineIcon className={classes.deleteIcon} />
                                </Box>,
                        actionAnimation: ActionAnimations.REMOVE,
                        action: () => dispatch({type: 'deleteCart', payload: item.name}),
                      }}
                      threshold={0.33}
                    >
                      <ListItem dense>
                        <ListItemText inset
                          primary={item.name}
                          secondary={`${item.cart.length} items`}
                          primaryTypographyProps={{classes:{root:classes.itemText}, noWrap: true}}
                          secondaryTypographyProps={{classes:{root:classes.itemText}, noWrap: true}}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => dispatch({type: 'loadCart', payload: item.name})}
                        >
                          <PublishIcon />
                        </Button>
                      </ListItem>
                    </SwipeableListItem>
                  </CSSTransition>
                )}
              </TransitionGroup>
            </List>
          </>
        }
    </>
  )

  return (
    <>
      <Box display="flex">
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor="right"
            open={state.showCart}
            onClose={() => dispatch({type: 'showCart', payload: false})}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {content}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            anchor="right"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: state.showCart,
              [classes.drawerClose]: !state.showCart
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: state.showCart,
                [classes.drawerClose]: !state.showCart
              })
            }}
          >
            {content}
          </Drawer>
        </Hidden>
      </Box>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{display:'flex', alignItems:'center', justifyContent:'center'}}
        open={state.invalid.show}
        onClose={() => dispatch({type: 'setInvalid', payload: {show: false}})}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 200,
        }}
      >
        <Fade in={state.invalid.show}>
          <Box className={classes.paper}>
            <Typography variant="h4" id="modal-title" gutterBottom>Out of Stock</Typography>
            <Typography variant="h6" id="modal-description">The following items are removed:</Typography>
            <Table aria-label="out of stock table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography style={{fontWeight:'bold'}}>Category</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography style={{fontWeight:'bold'}}>Product</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography style={{fontWeight:'bold'}}>Variant</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.invalid.items?.map((item, index) =>
                  item.category || item.product || item.variant ?
                    <TableRow key={index}>
                      <TableCell><Typography>{item.category}</Typography></TableCell>
                      <TableCell><Typography>{item.product}</Typography></TableCell>
                      <TableCell><Typography>{item.variant}</Typography></TableCell>
                    </TableRow> :
                    <TableRow key={index}>
                      <TableCell colSpan="3"><Typography>SKU: {item.sku}</Typography></TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}
