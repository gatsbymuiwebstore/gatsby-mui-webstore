import React, { useContext, useEffect, useRef, useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import Clipboard from "react-clipboard.js"
import ReCAPTCHA from "react-google-recaptcha"
import sgQRCode from "../../assets/sgqr.png"
import sgQRLogo from "../../assets/logos/sgqr.png"
import { storeContext } from "../components/store"
import SEO from "../components/seo"
import {
  makeStyles,
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  LinearProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera"
import PhotoIcon from "@material-ui/icons/Photo"

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    maxWidth: theme.spacing(85),
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
    },
  },
  box: {
    paddingTop: theme.spacing(),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  inputToolbar: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-between',
    },
  },
  messageSuccess: {
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
  recaptcha: {
    paddingTop: theme.spacing(),
  },
  sgQR: {
    marginBottom: theme.spacing(4),
  },
  sgQRPaymentSchemes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 60px)',
    gridGap: theme.spacing(),
    justifyContent: 'center',
    margin: `${theme.spacing(3)}px 0`,
  },
  sgQRScanToPay: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'crimson',
    borderRadius: theme.spacing(),
    color: 'white',
    height: theme.spacing(),
    justifyContent: 'center',
    margin: 'auto',
    maxWidth: '430px',
    padding: theme.spacing(3),
  },
  submitButton: {
    marginBottom: theme.spacing(2),
  },
  submitResult: {
    paddingBottom: theme.spacing(2),
  },
}))

const SuccessPage = ({ location }) => {
  const classes = useStyles()
  const { dispatch } = useContext(storeContext)
  const [copyToolOpen, setCopyToolOpen] = useState(0)
  const [proof, setProof] = useState('')
  const recaptchaRef = useRef()
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState({state: false})

  const { allFile, allGoogleSpreadsheetProducts, functions, options } = useStaticQuery(
    graphql`
      query {
        allFile(filter: {relativeDirectory: {eq: "logos/sgqr"}}) {
          nodes {
            publicURL
          }
        }
        allGoogleSpreadsheetProducts {
          nodes {
            sku
            category
            product
            variant
          }
        }
        functions {
          submitproof
        }
        options {
          altPricesName
          bankAccName
          bankAccNo
          messageSuccess
          mobileNo
          paynowName
          paynowMobileNo
          sgQRTitle
        }
      }
    `
  )

  const sgQRPaymentSchemeLogos = allFile.nodes.map(item => item.publicURL)

  const resizeProof = event => {
    if (event.target.files[0]) {
      const img = new Image()
      img.src = URL.createObjectURL(event.target.files[0])
      img.onload = () => {
        const maxWidth = 500
        const maxHeight = 1100
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(img.width, maxWidth)
        canvas.height = Math.min(img.height * canvas.width / img.width, maxHeight)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setProof(canvas.toDataURL('image/jpeg'))
      }
    }
  }

  const submitProof = async () => {
    setIsSubmitting(true)
    try {
      setSubmitResult({state: false})
      recaptchaRef.current.execute()
      const token = await new Promise((resolve, reject) => {
        function pollRecaptcha() {
          setTimeout(() => recaptchaRef.current.getValue() ?
            resolve(recaptchaRef.current.getValue()) :
            pollRecaptcha(), 100
          )
        }
        setTimeout(() => reject('Took too long to solve captcha.'), 120000)
        pollRecaptcha()
      })
      const response = await fetch(functions.submitproof, {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({orderId: location.state.orderId, proof: proof, rt: token})
      })
      if (response.status === 200) {
        setSubmitResult({state: true, server: true, status: response.status})
        setSubmitDisabled(true)
      }
      else {
        setSubmitResult({state: true, server: true, status: response.status, err: await response.text()})
        recaptchaRef.current.reset()
      }
    } catch (err) {
      setSubmitResult({state: true, server: false, err: err})
      recaptchaRef.current.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    dispatch({type: 'setTabIndex', payload: false})
    dispatch({type: 'showCart', payload: false})
    location.state && dispatch({type: 'clearCart', payload: new Date().toString().slice(0, 21)})
  },[dispatch, location.state])

  useEffect(() => {
    const closeCopyTool = async () => {
      await new Promise(r => setTimeout(r, 1000))
      setCopyToolOpen(0)
    }
    closeCopyTool()
  },[copyToolOpen])

  const copyTool = (index, payload) =>
  <Tooltip disableFocusListener disableHoverListener title="Copied!" open={copyToolOpen === index}>
    <Clipboard
      style={{backgroundColor:'unset', border:'unset', color:'unset', font:'unset', padding:'unset'}}
      data-clipboard-text={payload}
      onClick={() => setCopyToolOpen(index)}
    >
      {payload}
    </Clipboard>
  </Tooltip>

  const getPaymentStr = () => {
    switch (location.state.paymentMethod) {
      case 'PayNow':
        return <>{copyTool(1, options.paynowMobileNo)} ({options.paynowName})</>
      case 'Bank Transfer':
        return <>{copyTool(1, options.bankAccNo)} ({options.bankAccName})</>
      default:
        return "Error: Invalid payment method."
    }
  }

  return (
    <>
      <SEO title="Order Summary" />
      {location.state ?
        <Box className={classes.root}>
          <TableContainer component={Paper}>
            {location.state.invalid.length !== 0 &&
              <>
                <Toolbar style={{alignItems:'flex-end'}} variant="dense">
                  <Typography variant="h6" color="error">Out of Stock</Typography>
                </Toolbar>
                <Box className={classes.box}><Typography color="error">The following items are removed:</Typography></Box>
                <Table aria-label="out of stock table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography style={{fontWeight:'bold'}} color="error">Category</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography style={{fontWeight:'bold'}} color="error">Product</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography style={{fontWeight:'bold'}} color="error">Variant</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {location.state.invalid.map((item, index) => {
                      const dataItem = allGoogleSpreadsheetProducts.nodes.find(node => node.sku === item.sku)
                      if (dataItem)
                        return  <TableRow key={index}>
                                  <TableCell><Typography color="error">{dataItem.category}</Typography></TableCell>
                                  <TableCell><Typography color="error">{dataItem.product}</Typography></TableCell>
                                  <TableCell><Typography color="error">{dataItem.variant}</Typography></TableCell>
                                 </TableRow>
                      else
                        return  <TableRow key={index}>
                                  <TableCell colSpan="3"><Typography color="error">SKU: {item.sku}</Typography></TableCell>
                                 </TableRow>
                    })}
                  </TableBody>
                </Table>
              </>
            }
            <Toolbar style={{alignItems:'flex-end'}} variant="dense">
              <Typography variant="h6">Order {location.state.orderId}</Typography>
            </Toolbar>
            <Table aria-label="order table">
              <TableHead>
                <TableRow>
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
                {location.state.cart.map((item, index) => {
                  const price = location.state.altPrices ? item.altPrice : item.price
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography>{item.product}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.variant ? `${item.unit} - ${item.variant}` : item.unit}
                        </Typography>
                      </TableCell>
                      <TableCell align="center"><Typography>{item.qty}</Typography></TableCell>
                      <TableCell align="center"><Typography>${price}</Typography></TableCell>
                      <TableCell><Typography>${(price * item.qty).toFixed(2)}</Typography></TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell style={{verticalAlign:'baseline'}} colSpan={2} rowSpan={location.state.discount ? 4 : 3}>
                    <Typography>{options.altPricesName}: {location.state.altPrices ? 'Yes' : 'No'}</Typography>
                  </TableCell>
                  <TableCell><Typography>Subtotal</Typography></TableCell>
                  <TableCell><Typography>${location.state.subtotal.toFixed(2)}</Typography></TableCell>
                </TableRow>
                {(location.state.discount || null) &&
                  <TableRow>
                    <TableCell><Typography>Discount</Typography></TableCell>
                    <TableCell style={{whiteSpace:'nowrap'}}>
                      <Typography>- ${location.state.discount.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                }
                <TableRow>
                  <TableCell><Typography>Delivery</Typography></TableCell>
                  <TableCell>
                    <Typography>{location.state.isFreeDelivery ? 'Free' : `$${location.state.deliveryFee}`}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Typography>Total</Typography></TableCell>
                  <TableCell><Typography>${location.state.total.toFixed(2)}</Typography></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Box className={classes.messageSuccess}>
              <Typography style={{whiteSpace:'pre-line'}}>{options.messageSuccess}</Typography>
            </Box>
            <Toolbar style={{alignItems:'flex-end'}} variant="dense">
              <Typography variant="h6">Delivery Information</Typography>
            </Toolbar>
            <Box className={classes.box}>
              <Typography gutterBottom>Name: {location.state.name}</Typography>
              <Typography gutterBottom>
                Address: {location.state.street} {location.state.building} {location.state.unit} Singapore {location.state.postal}
              </Typography>
              <Typography gutterBottom>Phone: {location.state.phone}</Typography>
              <Typography gutterBottom>Email: {location.state.email}</Typography>
              <Typography gutterBottom>Delivery Date: {location.state.deliveryDate}, {location.state.deliveryTime}</Typography>
              <Typography gutterBottom={Boolean(location.state.comments)}>
                Contactless Delivery: {location.state.contactless ? 'Yes' : 'No'}
              </Typography>
              {location.state.comments && <Typography>Comments: {location.state.comments}</Typography>}
            </Box>
            <Toolbar style={{alignItems:'flex-end'}} variant="dense"><Typography variant="h6">Payment</Typography></Toolbar>
            <Box className={classes.box}>
              {location.state.paymentMethod === "SGQR" ?
                <>
                  <Typography className={classes.sgQR}>
                    If payment app is on your current device, save the QR code below to your gallery to open it in your payment app.
                  </Typography>
                  <img src={sgQRLogo} alt="SGQR Logo" />
                  <Box textAlign="center">
                    <Typography variant="h4" style={{fontWeight:'bold'}}>{options.sgQRTitle}</Typography>
                    <img style={{maxWidth:'100%', height:'auto'}} src={sgQRCode} alt={location.state.orderId} />
                    <Typography className={classes.sgQRScanToPay} variant="h4">SCAN TO PAY</Typography>
                    <Box className={classes.sgQRPaymentSchemes}>
                      {sgQRPaymentSchemeLogos.map((item, index) =>
                        <img key={index} src={item} alt={index} width="60" height="60" />
                      )}
                    </Box>
                  </Box>
                </> :
                <Typography gutterBottom>
                  Send ${location.state.total.toFixed(2)} to<br />
                  {getPaymentStr()}<br /><br />
                  Please append your order no. {copyTool(2, location.state.orderId)} under comments for quicker processing.
                </Typography>
              }
            </Box>
            <Toolbar className={classes.inputToolbar} variant="dense">
              <Typography variant="h6">Upload Proof of Payment</Typography>
              <Box paddingLeft="16px">
                <input
                  style={{display:'none'}}
                  id="file-input"
                  accept="image/*"
                  type="file"
                  onChange={resizeProof}
                />
                <label htmlFor="file-input">
                  <IconButton color="primary" aria-label="browse picture" component="span">
                    <PhotoIcon />
                  </IconButton>
                </label>
                <input
                  style={{display:'none'}}
                  id="camera-input"
                  accept="image/*"
                  type="file"
                  capture="environment"
                  onChange={resizeProof}
                />
                <label htmlFor="camera-input">
                  <IconButton color="primary" aria-label="take picture" component="span">
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              </Box>
            </Toolbar>
            {proof.length !== 0 &&
              <Box className={classes.box}>
                <img src={proof} alt="preview" />
                <ReCAPTCHA
                  className={classes.recaptcha}
                  ref={recaptchaRef}
                  size="invisible"
                  badge="inline"
                  sitekey={process.env.GATSBY_CAPTCHA_SITE_KEY}
                />
                {isSubmitting && <><br /><LinearProgress /></>}
                <br />
                <Button
                  className={classes.submitButton}
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || submitDisabled}
                  onClick={submitProof}
                >
                  Submit
                </Button>
                {submitResult.state && (submitResult.server ?
                  submitResult.status === 200 ?
                    <Typography className={classes.submitResult}>Thank you!</Typography> :
                    <Typography className={classes.submitResult} color="error">
                      Server error {submitResult.status}: {submitResult.err}
                    </Typography> :
                  <Typography className={classes.submitResult} color="error">Error: {submitResult.err}</Typography>
                )}
              </Box>
            }
          </TableContainer>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography>Need help?</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                Chat with us via WhatsApp below or call/sms us at {' '}
                <a href={`tel:${options.mobileNo}`} rel="nofollow" style={{color:'inherit', textDecoration:'none'}}>
                  {options.mobileNo}
                </a>.
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Box> :
        <Typography variant="h6" color="error">Error: Missing response from server.</Typography>
      }
    </>
  )
}

export default SuccessPage
