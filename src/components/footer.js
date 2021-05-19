import React, { useState } from "react"
import PropTypes from "prop-types"
import { graphql, useStaticQuery, Link } from "gatsby"
import { useIsJsEnabled } from "gatsby-plugin-js-fallback"
import {
  makeStyles,
  Backdrop,
  Box,
  ButtonBase,
  Divider,
  Fade,
  Hidden,
  IconButton,
  Modal,
  Typography
} from "@material-ui/core"
import FacebookIcon from "@material-ui/icons/Facebook"
import InstagramIcon from "@material-ui/icons/Instagram"
import WhatsAppIcon from "@material-ui/icons/WhatsApp"

const useStyles = makeStyles(theme => ({
  divider: {
    margin: 'auto',
    marginTop: theme.spacing(3),
    maxWidth: theme.spacing(125),
  },
  xsDown: {
    paddingBottom: theme.spacing(),
  },
  smUp: {
    margin: 'auto',
    maxWidth: theme.spacing(125),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(4),
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    outline: 'none',
  },
}))

Footer.propTypes = {
  siteTitle: PropTypes.string,
}

Footer.defaultProps = {
  siteTitle: ``,
}

export default function Footer(props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const isJsEnabled = useIsJsEnabled()

  const { facebook, instagram, whatsapp } = useStaticQuery(
    graphql`
      query {
        options {
          facebook
          instagram
          whatsapp
        }
      }
    `
  ).options

  const socialButtons =
    <>
      <a
        href={`https://api.whatsapp.com/send?phone=${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{color:'inherit'}}
      >
        <IconButton color="inherit" aria-label="whatsapp">
          <WhatsAppIcon />
        </IconButton>
      </a>
      <a
        href={`https://www.facebook.com/${facebook}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{color:'inherit'}}
      >
        <IconButton color="inherit" aria-label="facebook">
          <FacebookIcon />
        </IconButton>
      </a>
      <a
        href={`https://www.instagram.com/${instagram}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{color:'inherit'}}
      >
        <IconButton color="inherit" aria-label="instagram">
          <InstagramIcon />
        </IconButton>
      </a>
    </>

  const attrib =
    <Typography style={{margin:'auto'}} variant="caption" align="center">
      © {new Date().getFullYear()} {props.siteTitle}
    </Typography>

  const wholesalesButton =
    <ButtonBase onClick={() => setOpen(true)}>
      <Typography variant="button">We do wholesales too!</Typography>
    </ButtonBase>

  const wholesales = isJsEnabled ?
    wholesalesButton :
    <Link
      to="/wholesales/"
      style={{color:'inherit', textDecoration:'none'}}
      activeStyle={{display:'none'}}
    >
      {wholesalesButton}
    </Link>

  return (
    <>
      <Divider className={classes.divider} variant="middle" />
      <Hidden smUp implementation="css">
        <Box display="flex" justifyContent="center">{socialButtons}</Box>
        <Box className={classes.xsDown} display="flex" justifyContent="center">{attrib}</Box>
        <Box display="flex" justifyContent="center">{wholesales}</Box>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Box
          className={classes.smUp}
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          justifyContent="center"
        >
          {socialButtons}
          {attrib}
          {wholesales}
        </Box>
      </Hidden>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{display:'flex', alignItems:'center', justifyContent:'center'}}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 200,
        }}
      >
        <Fade in={open}>
          <Box className={classes.paper}>
            <Typography id="modal-title" variant="h2">Wholesales</Typography>
            <Typography id="modal-description">Do contact us for more details.</Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}
