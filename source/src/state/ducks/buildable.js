import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getBuildable,
  getEnrase,
  getPlusvalia,
  getPdfLink,
} from 'utils/apiConfig';
import { actions as alertsActions } from 'state/ducks/alerts';

const areaChanged = createAsyncThunk('buildable/areaChanged', async ({ smp, text }) => {
  const area = Number.parseFloat(text);
  if (Number.isNaN(area) || !smp || smp.length === 0) {
    return {
      plusvalia: {
        plusvalia_em: '-',
        plusvalia_pl: '-',
        plusvalia_sl: '-',
      },
    };
  }
  const url = getPlusvalia(smp, area);
  const data = await fetch(url)
    .then((response) => response.json())
    .then(
      ({
        plusvalia_em: em,
        plusvalia_pl: pl,
        plusvalia_sl: sl,
        alicuota: al,
        incidencia_uva: uva,
        distrito_cpu: cpu,
      }) => ({
        plusvalia_em: em === 0 ? 0 : em.toLocaleString('es-AR'),
        plusvalia_pl: pl === 0 ? 0 : pl.toLocaleString('es-AR'),
        plusvalia_sl: sl === 0 ? 0 : sl.toLocaleString('es-AR'),
        alicuota: al === 0 ? 0 : al.toLocaleString('es-AR'),
        incidencia_uva: uva === 0 ? 0 : uva.toLocaleString('es-AR'),
        distrito_cpu: cpu,
      })
    );
  return {
    plusvalia: data,
  };
});

const getDataBuild = (url) =>
  fetch(url)
    .then((response) => response.json())
    .then(
      ({
        altura_max: alturas,
        fot: {
          fot_medianera: medianera,
          fot_perim_libre: perim,
          fot_semi_libre: semi,
        },
        plusvalia: {
          alicuota: al,
          incidencia_uva: uva,
          distrito_cpu: cpu,
        },
        sup_max_edificable: supMax,
        sup_edificable_planta: supPlanta,
        ...others
      }) => {
        const alturasAux = alturas
          .filter((altura) => altura > 0)
          .map((altura) => altura.toLocaleString('es-AR'));
        return {
          altura_max: alturasAux.length === 0 ? [0] : alturasAux,
          fot: {
            fot_medianera: medianera.toLocaleString('es-AR'),
            fot_perim_libre: perim.toLocaleString('es-AR'),
            fot_semi_libre: semi.toLocaleString('es-AR'),
            total: medianera + perim + semi,
          },
          plusvalia: {
            plusvalia_em: 0,
            plusvalia_pl: 0,
            plusvalia_sl: 0,
            alicuota: al === 0 ? 0 : al.toLocaleString('es-AR'),
            incidencia_uva: uva === 0 ? 0 : uva.toLocaleString('es-AR'),
            distrito_cpu: cpu,
          },
          sup_max_edificable: supMax.toLocaleString('es-AR'),
          sup_edificable_planta: supPlanta.toLocaleString('es-AR'),
          ...others,
        };
      }
    );

const clickOnParcel = createAsyncThunk('buildable/clickOnParcel', async (smp, { dispatch }) => {
  dispatch(alertsActions.clear());
  if (smp.length === undefined) {
    return { smp: 'Invalido' };
  }
  const [dataBuild, dataEnrase] = await Promise.all([
    getDataBuild(getBuildable(smp)),
    fetch(getEnrase(smp)).then((response) => response.json()),
  ]);

  const data = {
    ...dataBuild,
    ...dataEnrase,
  };

  // Alert logic remains the same...
  return data;
});

const buildable = createSlice({
  name: 'buildable',
  initialState: {
    isLoading: false,
    lastIDCAll: '',
    data: {},
    plusvalia: {},
    isSelected: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(areaChanged.fulfilled, (draftState, action) => {
        draftState.plusvalia = action.payload;
        draftState.isLoading = false;
      })
      .addCase(clickOnParcel.pending, (draftState) => {
        draftState.isLoading = true;
        draftState.data = {};
        draftState.isSelected = false;
      })
      .addCase(clickOnParcel.fulfilled, (draftState, action) => {
        draftState.data = action.payload;
        draftState.isLoading = false;
        draftState.isSelected = true;
      })
      .addCase(clickOnParcel.rejected, (draftState) => {
        draftState.isLoading = false;
        draftState.data = {};
        draftState.isSelected = false;
      });
  },
});

export default buildable.reducer;

const actions = { ...buildable.actions, clickOnParcel, areaChanged };
export { actions };
