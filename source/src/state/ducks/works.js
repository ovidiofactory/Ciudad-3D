import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getWorks, getSade } from 'utils/apiConfig';

const sadeProcess = [
  // (Tu array sadeProcess permanece igual)
];

const clickOnParcel = createAsyncThunk('works/clickOnParcel', async (smp) => {
  if (smp.length === undefined) {
    return { smp: 'Invalido' };
  }
  const url = getWorks(smp);
  const dataStatePromise = fetch(url).then((response) => response.json());

  const urlSade = getSade(smp);
  const dataSadePromise = fetch(urlSade).then((response) => response.json());

  const [dataState, dataSade] = await Promise.all([
    dataStatePromise,
    dataSadePromise,
  ]);

  const sade = sadeProcess
    .map((process) => {
      const rows = dataSade.tratas.filter(process.filter);
      const dataTable = rows.map((row) =>
        process.columns.map(({ id }) => {
          const value = row[id];
          const date = Date.parse(value);

          return id === 'fecha' && !isNaN(date)
            ? new Date(value).toLocaleDateString()
            : value;
        })
      );

      return {
        title: process.title,
        columns: process.columns.map(({ title }) => title),
        dataTable,
      };
    })
    .filter(({ dataTable }) => dataTable.length > 0);

  return {
    ...dataState,
    sade,
  };
});

const works = createSlice({
  name: 'works',
  initialState: {
    isLoading: false,
    data: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(clickOnParcel.pending, (draftState) => {
        draftState.isLoading = true;
        draftState.data = [];
      })
      .addCase(clickOnParcel.fulfilled, (draftState, action) => {
        draftState.data = action.payload;
        draftState.isLoading = false;
      })
      .addCase(clickOnParcel.rejected, (draftState) => {
        draftState.isLoading = false;
        draftState.data = [];
      });
  },
});

export default works.reducer;

const actions = { ...works.actions, clickOnParcel };
export { actions };
