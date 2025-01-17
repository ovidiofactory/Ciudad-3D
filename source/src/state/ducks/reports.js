/* eslint-disable camelcase */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import buildPDF from 'utils/reportTemplate';

import {
  getParcelBySmp,
  getBuildable,
  getPdfLink,
  getCadLink,
  getAffectations,
  getUses,
  getPhoto,
  getPhotoData,
} from 'utils/apiConfig';

import {
  getAlert,
  getAffectationsTable,
  getUsesTable,
} from 'utils/configQueries';

const getData = createAsyncThunk(
  'report/getData',
  async (smp) => {
    const { direccion, superficie_total } = await fetch(
      getParcelBySmp(smp)
    ).then((response) => response.json());

    const buildableData = await fetch(getBuildable(smp)).then((response) =>
      response.json()
    );

    const hasImage = await fetch(getPhotoData(smp))
      .then((response) => response.text())
      .then((text) => JSON.parse(text.slice(1, -1)))
      .then(({ length }) => length > 0);

    const fachadaImg = hasImage ? getPhoto(smp, 0) : null;

    // Rest of the logic remains unchanged...

    return { smp, direccion, sections };
  },
  {
    condition: (smp, { getState }) => !getState().reports[smp],
  }
);

const download = createAsyncThunk(
  'report/download',
  async (smp, { getState }) => {
    const report = getState().reports[smp];
    await buildPDF(report.sections, `Plano Abierto - CUR3D ${smp}.pdf`);
  }
);

const reports = createSlice({
  name: 'reports',
  initialState: {},
  extraReducers: (builder) => {
    builder
      .addCase(getData.pending, (draftState, { meta: { arg: smp } }) => {
        draftState[smp] = { state: 'loading', cadLink: getCadLink(smp) };
      })
      .addCase(
        getData.fulfilled,
        (draftState, { payload: { smp, direccion, sections } }) => {
          draftState[smp].sections = sections;
          draftState[smp].state = 'ready';
          draftState[smp].address = direccion;
        }
      )
      .addCase(getData.rejected, (draftState, { error, meta: { arg: smp } }) => {
        console.error('getData.rejected:', error);
        draftState[smp].state = 'error';
      })
      .addCase(download.rejected, (draftState, { error, meta: { arg: smp } }) => {
        console.error('download.rejected:', error);
        draftState[smp].state = 'error';
      });
  },
});

export default reports.reducer;

const actions = { ...reports.actions, getData, download };
export { actions };
