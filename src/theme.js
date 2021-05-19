import { createMuiTheme } from "@material-ui/core/styles"

const theme = createMuiTheme({
  palette: {
    primary: {
      light: process.env.GATSBY_SITE_COLOR_PRI_LIGHT,
      main: process.env.GATSBY_SITE_COLOR_PRI_MAIN,
      dark: process.env.GATSBY_SITE_COLOR_PRI_DARK,
    },
    secondary: {
      light: process.env.GATSBY_SITE_COLOR_SEC_LIGHT,
      main: process.env.GATSBY_SITE_COLOR_SEC_MAIN,
      dark: process.env.GATSBY_SITE_COLOR_SEC_DARK,
    },
    background: {
      default: '#fff',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          touchAction: 'manipulation',
        },
      },
    },
  },
})

export default theme
