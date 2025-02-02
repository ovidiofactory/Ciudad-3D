//import { createMuiTheme } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';

import { red } from '@material-ui/core/colors';
import * as colors from '@material-ui/core/colors';

const spacing = 8;
const theme = createTheme({
  overrides: {
    spacing,
    MuiCssBaseline: {
      '@global': {
        html: {
          fontSize: 14,
          backgroundColor: colors.common.white // Corregido: Usamos `common.white` para el color blanco
        }
      }
    },
    MuiSvgIcon: {
      root: {
        colorPrimary: '#fed304'
      }
    },
    MuiAccordion: {
      root: {
        marginBottom: spacing,
        border: '1px solid #D9D9D9'
      }
    },
    MuiAccordionSummary: {
      root: {
        minHeight: 0,
        '&$expanded': {
          minHeight: 0
        },
        height: spacing * 4.25
      }
    },
    MuiAccordionDetails: {
      root: {
        padding: 0
      }
    },
    MuiFormLabel: {
      root: {
        color: '#707070'
      }
    }
  },
  typography: {
    fontFamily: ['Nunito', 'Open Sans'].join(','),
    caption: {
      letterSpacing: 0,
      fontSize: '11.5px',
      lineHeight: '17px'
    },
    h5: {
      fontSize: '1.5rem'
    },
    body1: {}
  },
  palette: {
    text: {
      primary: '#707070',
      secondary: '#D9D9D9',
      Info: '#00f'
    },
    action: {
      active: '#707070',
      hoverOpacity: 0.1
    },
    primary: {
      main: '#EECE2F!important'
    },
    secondary: {
      main: '#F3F3F3'
    },
    error: {
      main: red.A400
    },
    background: {
      default: colors.common.white // Corregido: Usamos `common.white` aquí también
    }
  }
});

export default theme;
