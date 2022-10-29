import React, { useEffect } from 'react'

import PropTypes from 'prop-types'

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
  IconButton
} from '@material-ui/core'

import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

import ContainerBar from 'components/Sections/ContainerBar'
import CustomTooltip from 'theme/wrappers/CustomTooltip'
import SelectParcel from 'components/Sections/SubSection/SelectParcel'

import useFontsStyles from 'theme/fontsDecorators'

import { actions as worksActions } from 'state/ducks/works'

import { useDispatch, useSelector } from 'react-redux'

import { getWorksGroups } from 'utils/configQueries'

import useStyles from './styles'

const GridPanel = ({ id, columns, data, styles: { bold, tableCell } }) => {
  const tableData = data[id]
  return (
    <>
      {tableData.length === 0 && (
        <TableContainer>
          <Typography>No posee</Typography>
        </TableContainer>
      )}
      {tableData.length >= 1 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(({ label, field }) => (
                  <TableCell key={field} className={tableCell}>
                    <Typography variant="subtitle2" className={bold}>
                      {label}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody styles={{ tableCell }}>
              {
                // Se mapea cada una de las obras para dicha tabla
                // Por lo tanto se crea una nueva TableRow por cada obra
                tableData.map((row, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={idx}>
                    {
                      // Se mapean los valores de cada obra para cada columna
                      columns.map(({ field }) => (
                        <TableCell key={field} className={tableCell}>
                          {row[field]}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

const Works = () => {
  const classes = useStyles()
  const decorators = useFontsStyles()
  const data = useSelector((state) => state.works.data)
  const dispatch = useDispatch()
  const smp = useSelector((state) => state.parcel.smp)

  useEffect(() => {
    dispatch(worksActions.clickOnParcel(smp))
  }, [dispatch, smp])

  return (
    <ContainerBar type="table">
      <Box className={classes.boxContainer}>
        {
          data?.sade?.map(({ title, columns, dataTable }) => (
            <Box className={classes.boxSubContainer} key={title}>
              <Box className={classes.title}>
                <Typography
                  variant="subtitle1"
                  className={`${decorators.bold} ${decorators.marginBottom_ml}`}
                >
                  {title}
                </Typography>
                <table border="1" className={classes.table}>
                  <tbody>
                    <tr>
                      {
                        // Se mapea cada una de las columnas para la tabla
                        columns.map((column) => (
                          <th id={column} key={column}>{column}</th>
                        ))
                      }
                    </tr>
                    {
                      // Se mapea cada una de las obras para dicha tabla
                      dataTable.map((row) => (
                        <tr>
                          {
                            // Se mapean los valores de cada obra para cada columna
                            columns.map((column, idx) => (
                              <td headers={column} key={column}>{row[idx]}</td>
                            ))
                          }
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </Box>
            </Box>
          ))
        }
        {data.length === 0 && <SelectParcel />}
      </Box>
    </ContainerBar>
  )
}

GridPanel.defaultProps = {
  bold: '',
  tableCell: ''
}
GridPanel.propTypes = {
  id: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  bold: PropTypes.string,
  tableCell: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  styles: PropTypes.objectOf(makeStyles).isRequired
}

export default Works
