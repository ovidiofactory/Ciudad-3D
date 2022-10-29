import { makeStyles } from '@material-ui/core/styles'

export default makeStyles((theme) => ({
  box: {
    marginLeft: theme.spacing(9.75), // 9.75 - 78px
    minHeight: '100vh',
    width: theme.spacing(86),
    [theme.breakpoints.down('sm')]: {
      maxWidth: theme.spacing(35)
    }
  },
  boxSubContainer: {
    paddingBottom: theme.spacing(4)
  },
  paper: {
    height: theme.spacing(13.62),
    paddingTop: theme.spacing(2.25), // 2.25 - 18px
    paddingLeft: theme.spacing(3.26), // 3.12 - 26px
    borderRadius: 0
  },
  button: {
    padding: 0,
    paddingRight: theme.spacing(0.5),
    minWidth: '0px !important'
  },
  tableCell: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      textAlign: 'center'
    }
  },
  tooltip: {
    marginTop: '3px',
    marginLeft: theme.spacing(1),
    float: 'left'
  },
  info: {
    height: '17px',
    width: '17px'
  },
  iconButton: {
    marginTop: '3px',
    padding: 0,
    marginLeft: theme.spacing(1),
    float: 'left'
  },
  downloadIcon: {
    height: '18px',
    width: '18px'
  },
  title: {
    float: 'left',
    display: 'inline',
    marginTop: theme.spacing(3),
    '& :first-child': {
      marginTop: theme.spacing(0),
    }
  },
  table: {
    width: '100%',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    borderCollapse: 'collapse',
    '& thead': {
      display: 'table-header-group',
      '& tr': {
        '& th': {
          padding: theme.spacing(1.5),
          textAlign: 'center',
          borderBottom: '1px solid #E0E0E0',
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
            fontSize: '12px'
          }
        }
      }
    },
    '& tbody': {
      display: 'table',
      width: '100%',
      '& tr:nth-child(odd)': {
        backgroundColor: '#F5F5F5'
      },
      '& tr': {
        '& td': {
          padding: theme.spacing(1),
          textAlign: 'left',
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
            fontSize: '12px'
          }
        }
      },
    }
  }


}))
