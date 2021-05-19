import React, { useContext, useEffect, useRef, useState } from "react"
import { graphql, navigate, useStaticQuery } from "gatsby"
import { SwipeableListItem } from "@sandstreamdev/react-swipeable-list"
import "@sandstreamdev/react-swipeable-list/dist/styles.css"
import NumberFormat from "react-number-format"
import DateFnsUtils from "@date-io/date-fns"
import { Formik, Form, Field } from "formik"
import { CheckboxWithLabel, TextField as FormikTextField, RadioGroup, Select } from "formik-material-ui"
import { DatePicker } from "formik-material-ui-pickers"
import { string, object } from "yup"
import ReCAPTCHA from "react-google-recaptcha"
import SEO from "../components/seo"
import { storeContext } from "../components/store"
import {
  makeStyles,
  useMediaQuery,
  useTheme,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  FormControlLabel,
  Hidden,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core"
import ClearIcon from "@material-ui/icons/Clear"
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    maxWidth: theme.spacing(85),
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
    },
  },
  '@global': {
    '.SwipeableListItem_content__3wbMa': {
      display: 'inherit',
    },
  },
  form: {
    paddingTop: theme.spacing(),
    padding: theme.spacing(2),
  },
  formField: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(5),
      flex: 1,
    },
  },
  formRow: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      alignItems: 'center',
    },
  },
  formTopField: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    marginRight: theme.spacing(5),
    flex: 1,
  },
  promo: {
    width: theme.spacing(14),
  },
  promoSpinner: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(),
  },
  sgQRPaymentSchemes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 60px)',
    gridGap: theme.spacing(),
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
}))

const OrderPage = () => {
  const classes = useStyles()
  const { state, dispatch } = useContext(storeContext)
  const recaptchaRef = useRef()
  const [submitErr, setSubmitErr] = useState({state: false})
  const [promo, setPromo] = useState({disabled: true, code: '', err: {state: false}, isVerifying: false})
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  const { allFile, functions, options } = useStaticQuery(
    graphql`
      query {
        allFile(filter: {relativeDirectory: {eq: "logos/sgqr"}}) {
          nodes {
            publicURL
          }
        }
        functions {
          submitorder
          verifypromo
        }
        options {
          altPricesName
          deliveryCutoffHr
          deliveryDelay
          deliveryFee
          deliveryMaxDate
          deliveryMinDate
          deliveryPeakDays
          deliveryPeakDelay
          deliveryPeakTimeslots
          deliveryTimeslots
          deliveryUnavailDates
          deliveryUnavailDays
          messageOrder
          takingOrders
        }
      }
    `
  )

  const sgQRPaymentSchemeLogos = allFile.nodes.map(item => item.publicURL)

  const minDate = new Date(Date.now()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000)
  minDate.setUTCDate(minDate.getUTCDate()+parseInt(options.deliveryMinDate))
  const peakDays = options.deliveryPeakDays.split(',').map(str => parseInt(str))
  const noDeliveryDates = options.deliveryUnavailDates.split(',').map(str => [parseInt(str.split('/')[0]), parseInt(str.split('/')[1])])
  const noDeliveryDays = options.deliveryUnavailDays.split(',').map(str => parseInt(str))
  const incrementMinDate = () => minDate.setUTCDate(minDate.getUTCDate()+1)
  minDate.getUTCHours() >= parseInt(options.deliveryCutoffHr) && incrementMinDate()
  if (state.cart.some(item => item.delay))
    for (let i = 0; i < parseInt(options.deliveryDelay); i++)
      incrementMinDate()
  for (let i = 0; i < parseInt(options.deliveryPeakDelay); i++)
    peakDays.includes(minDate.getUTCDay()) && incrementMinDate()
  while (noDeliveryDays.includes(minDate.getUTCDay()))
    incrementMinDate()
  minDate.setTime(minDate.getTime()-parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000)
  const [selectedDate, setSelectedDate] = useState(minDate)
  const deliveryTimeslots = options.deliveryTimeslots.split(',').map(str => str.trim())
  const deliveryPeakTimeslots = options.deliveryPeakTimeslots.split(',').map(str => str.trim())

  const delivery =
  <>
    <TableCell><Typography>Delivery</Typography></TableCell>
    <TableCell><Typography>{state.freeDelivery ? 'Free' : `$${options.deliveryFee}`}</Typography></TableCell>
  </>

  const shouldDisableDate = date => {
    const localDate = new Date(date.getTime()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000)
    if (noDeliveryDays.includes(localDate.getUTCDay()))
      return true
    return noDeliveryDates.some(item => item[0] === localDate.getUTCDate() && item[1] === localDate.getUTCMonth()+1)
  }

  const getToken = (resolve, reject) => {
    recaptchaRef.current.reset()
    recaptchaRef.current.execute()
    function pollRecaptcha() {
      setTimeout(() => recaptchaRef.current.getValue() ? resolve(recaptchaRef.current.getValue()) : pollRecaptcha(), 100)
    }
    setTimeout(() => reject('Took too long to solve captcha.'), 120000)
    pollRecaptcha()
  }

  const request = payload => ({
    method: 'POST',
    mode: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
    })

  const verifyPromo = async () => {
    setPromo({...promo, isVerifying: true})
    try {
      const token = await new Promise(getToken)
      const response = await fetch(functions.verifypromo, request({code: promo.code, rt: token}))
      if (response.status === 200) {
        const result = await response.json()
        if (Object.keys(result).length > 0) {
          dispatch({type: 'setPromo', payload: result})
          setPromo({...promo, isVerifying: false})
        }
        else
          setPromo({...promo, err: {state: true, server: false, body: "Invalid code"}, isVerifying: false})
      }
      else {
        setPromo({...promo, err: {state: true, server: true, status: response.status, body: await response.text()}, isVerifying: false})
      }
    } catch (err) {
      setPromo({...promo, err: {state: true, server: false, body: err}, isVerifying: false})
    }
  }

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
  },[dispatch])

  return (
    <>
      <SEO title="Order" />
      {state.cart.length !== 0 ?
        <Box className={classes.root}>
          <TableContainer component={Paper}>
            <Toolbar style={{alignItems:'flex-end'}} variant="dense"><Typography variant="h6">Review Order</Typography></Toolbar>
            <Table aria-label="order table">
              <TableHead>
                <TableRow>
                  <Hidden xsDown implementation="js">
                    <TableCell width="1%" />
                  </Hidden>
                  <TableCell>
                    <Typography style={{fontWeight:'bold'}}>Product</Typography>
                  </TableCell>
                  <TableCell width="1%" align="center">
                    <Typography style={{fontWeight:'bold'}}>Qty.</Typography>
                  </TableCell>
                  <TableCell width="1%" align="center">
                    <Typography style={{fontWeight:'bold'}}>Unit</Typography>
                  </TableCell>
                  <TableCell width="1%" align="center">
                    <Typography style={{fontWeight:'bold'}}>Price</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.cart.map(item => {
                  const price = state.altPrices ? item.altPrice : item.price
                  const remove = () => dispatch({type: 'changeQty', payload: {sku: item.sku, qty: -1}})
                  const product =
                    <>
                      <Typography>{item.product}</Typography>
                      <Typography variant="body2" color="textSecondary">{item.variant ? `${item.unit} - ${item.variant}` : item.unit}</Typography>
                    </>
                  return (
                    <TableRow key={item.id}>
                      <Hidden xsDown implementation="js">
                        <TableCell align="center">
                          <ButtonBase
                            aria-label="remove"
                            onClick={remove}
                          >
                            <ClearIcon />
                          </ButtonBase>
                        </TableCell>
                      </Hidden>
                      <TableCell>
                        <Hidden smUp implementation="js">
                          <SwipeableListItem
                            className={classes.SwipeableListItem_content__3wbMa}
                            swipeLeft={{content: <DeleteOutlineIcon />, action: remove}}
                            threshold={0.25}
                          >
                            {product}
                          </SwipeableListItem>
                        </Hidden>
                        <Hidden xsDown implementation="js">
                          {product}
                        </Hidden>
                      </TableCell>
                      <TableCell align="center">
                        <NumberFormat
                          customInput={TextField}
                          decimalScale="0"
                          allowNegative={false}
                          style={{width:'2em'}}
                          type="text"
                          error={item.qtyErr}
                          name={item.sku}
                          inputProps={{inputMode: 'numeric', style:{textAlign: 'center'}, min: item.minQty, max: 999}}
                          value={item.qtyErr ? item.qtyErrVal : item.qty}
                          onChange={event => dispatch({type: 'changeQty', payload: {sku: event.target.name, qty: event.target.value}})}
                          aria-label="change quantity"
                        />
                      </TableCell>
                      <TableCell align="center"><Typography>${price}</Typography></TableCell>
                      <TableCell><Typography>${(price * item.qty).toFixed(2)}</Typography></TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <Hidden xsDown implementation="js">
                    <TableCell rowSpan={state.discount ? 4 : 3} />
                  </Hidden>
                  <TableCell style={{verticalAlign:'baseline', borderBottom:'unset'}} colSpan={2}>
                    <Typography>{options.altPricesName}: {state.altPrices ? 'Yes' : 'No'}</Typography>
                  </TableCell>
                  <TableCell><Typography>Subtotal</Typography></TableCell>
                  <TableCell><Typography>${state.subtotal.toFixed(2)}</Typography></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{verticalAlign:'baseline'}} colSpan={2} rowSpan={state.discount ? 3 : 2}>
                    <TextField
                      className={classes.promo}
                      size="small"
                      label="Promo Code"
                      value={promo.code}
                      onBlur={() => {
                        dispatch({type: 'clearPromo'})
                        if (promo.code)
                          verifyPromo().then(() => dispatch({type: 'reCalc'}))
                        else
                          dispatch({type: 'reCalc'})
                      }}
                      onChange={event => setPromo({
                        disabled: event.target.value.length === 0,
                        code: event.target.value,
                        err: {state: false},
                      })}
                      onKeyPress={event => {
                        if (event.key === 'Enter' && !promo.disabled) {
                          event.target.blur()
                        }
                      }}
                    />
                    {promo.isVerifying && <CircularProgress className={classes.promoSpinner} size={24} />}
                    {promo.err.state &&
                      <Typography color="error">
                        {promo.err.server ? `Server error ${promo.err.status}: ${promo.err.body}` : `Error: ${promo.err.body}`}
                      </Typography>
                    }
                  </TableCell>
                  {state.discount ?
                    <>
                      <TableCell><Typography>Discount</Typography></TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}><Typography>- ${state.discount.toFixed(2)}</Typography></TableCell>
                    </> :
                    delivery
                  }
                </TableRow>
                {(state.discount || null) &&
                  <TableRow>
                    {delivery}
                  </TableRow>
                }
                <TableRow>
                  <TableCell><Typography>Total</Typography></TableCell>
                  <TableCell>
                    <Typography>
                      ${(Math.max(0, state.subtotal - state.discount) + (state.freeDelivery ? 0 : parseFloat(options.deliveryFee))).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Toolbar style={{alignItems:'flex-end'}} variant="dense"><Typography variant="h6">Delivery Information</Typography></Toolbar>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Formik
                initialValues={{
                  name: state.savedInfo?.name || '',
                  street: state.savedInfo?.street || '',
                  building: state.savedInfo?.building || '',
                  unit: state.savedInfo?.unit || '',
                  postal: state.savedInfo?.postal || '',
                  email: state.savedInfo?.email || '',
                  phone: state.savedInfo?.phone || '',
                  comments: state.savedInfo?.comments || '',
                  deliveryDate: minDate,
                  deliveryTime: peakDays.includes(new Date(minDate.getTime()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000).getUTCDay()) ?
                    deliveryPeakTimeslots[0] :
                    deliveryTimeslots[0],
                  paymentMethod: state.savedInfo?.paymentMethod || 'SGQR',
                  contactless: state.savedInfo?.contactless || false,
                }}
                validationSchema={object({
                  name: string()
                    .max(100, 'Not more than 100 characters')
                    .required('Required'),
                  street: string()
                    .max(50, 'Not more than 50 characters')
                    .required('Required'),
                  building: string()
                    .max(50, 'Not more than 50 characters'),
                  unit: string()
                    .max(10, 'Not more than 10 characters'),
                  postal: string()
                    .matches(/^[0-8]\d{5}$/, '6 digits. Must not start with 9.')
                    .required('Required'),
                  email: string()
                    .email('Format: user@example.com'),
                  phone: string()
                    .matches(/^[3,6,8,9]\d{7}$/, '8 digits. Start with 3, 6, 8 or 9.')
                    .required('Required'),
                  comments: string()
                    .max(150, 'Not more than 150 characters'),
                })}
                onSubmit={async values => {
                  try {
                    setSubmitErr({state: false})
                    const cart = state.cart.map(item => {return {sku: item.sku, qty: item.qty}})
                    const token = await new Promise(getToken)
                    const response = await fetch(
                      functions.submitorder,
                      request({...values, altPrices: state.altPrices, cart: cart, rt: token, promo: promo.code})
                    )
                    if (response.status === 200) {
                      dispatch({type: 'saveInfo', payload: {
                        name: values.name,
                        street: values.street,
                        building: values.building,
                        unit: values.unit,
                        postal: values.postal,
                        email: values.email,
                        phone: values.phone,
                        comments: values.comments,
                        paymentMethod: values.paymentMethod,
                        contactless: values.contactless,
                      }})
                      const result = await response.json()
                      navigate('/success/', {state: result})
                    }
                    else
                      setSubmitErr({state: true, server: true, status: response.status, body: await response.text()})
                  } catch (err) {
                    setSubmitErr({state: true, server: false, body: err})
                  }
                }}
              >
                {({ isSubmitting, setFieldValue, values }) =>
                  <Form className={classes.form}>
                    <Box style={{display:'flex', alignItems:'center'}}>
                      <Field
                        className={classes.formTopField}
                        component={FormikTextField}
                        name="postal"
                        type="text"
                        label="Postal Code"
                        variant="outlined"
                        inputProps={{onChange: e => {
                          if (e.target.value.length === 6)
                            dispatch({type: 'setPostal', payload: e.target.value})
                        }}}
                      />
                      <Typography className={classes.formTopField}>
                        Delivery: {state.freeDelivery ? 'Free' : `$${options.deliveryFee}`}
                      </Typography>
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="name"
                        type="text"
                        label="Name"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="street"
                        type="text"
                        label="Blk & Street"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="building"
                        type="text"
                        label="Building (if any)"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="unit"
                        type="text"
                        label="Unit No. (if any)"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="phone"
                        type="text"
                        label="Phone"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="email"
                        type="email"
                        label="Email"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={FormikTextField}
                        name="comments"
                        type="text"
                        label="Special Instructions"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      />
                    </Box>
                    <Box className={classes.formRow}>
                      <Field
                        className={classes.formField}
                        component={DatePicker}
                        name="deliveryDate"
                        label="Delivery Date"
                        disableToolbar
                        variant="inline"
                        format="dd MMM yyyy"
                        disablePast
                        shouldDisableDate={shouldDisableDate}
                        minDate={minDate}
                        maxDate={minDate.getTime()+parseInt(options.deliveryMaxDate)*24*60*60*1000}
                        inputVariant="outlined"
                        fullWidth={!isDesktop}
                        onAccept={date => {
                          setSelectedDate(date)
                          setFieldValue(
                            'deliveryTime',
                            peakDays.includes(new Date(date.getTime()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000).getUTCDay()) ?
                              deliveryPeakTimeslots[0] :
                              deliveryTimeslots[0]
                          )
                        }}
                      />
                      <Field
                        className={classes.formField}
                        component={Select}
                        name="deliveryTime"
                        variant="outlined"
                        fullWidth={!isDesktop}
                      >
                        {peakDays.includes(new Date(selectedDate.getTime()+parseFloat(process.env.GATSBY_TZ_OFFSET)*60*60*1000).getUTCDay()) ?
                          deliveryPeakTimeslots.map((item, index) => <MenuItem key={index} value={item}>{item}</MenuItem>) :
                          deliveryTimeslots.map((item, index) => <MenuItem key={index} value={item}>{item}</MenuItem>)}
                      </Field>
                    </Box>
                    <Box className={classes.formRow}>
                      <Field className={classes.formField} style={{flexDirection:'unset'}} component={RadioGroup} name="paymentMethod">
                        <FormControlLabel
                          value="SGQR"
                          control={<Radio size="small" disabled={isSubmitting} />}
                          label="QR"
                          disabled={isSubmitting}
                        />                    
                        <FormControlLabel
                          value="PayNow"
                          control={<Radio size="small" disabled={isSubmitting} />}
                          label="PayNow"
                          disabled={isSubmitting}
                        />
                        <FormControlLabel
                          value="Bank Transfer"
                          control={<Radio size="small" disabled={isSubmitting} />}
                          label="Bank Transfer"
                          disabled={isSubmitting}
                        />
                        <Field
                          style={{marginRight:'unset'}}
                          component={CheckboxWithLabel}
                          name="contactless"
                          Label={{ label: 'Contactless Delivery' }}
                          checked={values.contactless}
                          type="checkbox"
                        />
                      </Field>
                    </Box>
                    {((values.paymentMethod === 'SGQR') || null) &&
                      <Box className={classes.sgQRPaymentSchemes}>
                        {sgQRPaymentSchemeLogos.map((item, index) =>
                          <img key={index} src={item} alt={index} width="60" height="60" />
                        )}
                      </Box>
                    }
                    <Typography style={{whiteSpace:'pre-line'}} className={classes.formField}>{options.messageOrder}</Typography>
                    <ReCAPTCHA
                      className={classes.formField}
                      ref={recaptchaRef}
                      size="invisible"
                      badge="inline"
                      sitekey={process.env.GATSBY_CAPTCHA_SITE_KEY}
                    />
                    {isSubmitting && <LinearProgress className={classes.formField} />}
                    <Button
                      className={classes.formField}
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || options.takingOrders.toLowerCase().includes('no')}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Form>
                }
              </Formik>
            </MuiPickersUtilsProvider>
            {submitErr.state &&
              <Typography color="error">
                {submitErr.server ? `Server error ${submitErr.status}: ${submitErr.body}` : `Error: ${submitErr.body}`}
              </Typography>
            }
          </TableContainer>
        </Box> :
        <Typography variant="h6">Cart is empty, add some items first</Typography>
      }
    </>
  )
}

export default OrderPage