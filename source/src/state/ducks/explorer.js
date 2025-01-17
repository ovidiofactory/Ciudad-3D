import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExplorer, getExplorerOptions } from 'utils/configQueries';
import { actions as mapActions } from 'state/ducks/map';

const loadExplorerOptions = createAsyncThunk('map/loadExplorerOptions', async () => {
  const options = {};
  getExplorer().forEach(({ id: idExplorer }) => {
    getExplorerOptions(idExplorer).forEach(({ id: idOption, options: opt }) => {
      options[idOption] = {};
      opt.forEach(({ id: idGroup, items }) =>
        items.forEach(({ id, filter }) => {
          options[idOption][id] = {
            isVisible: true,
            idGroup,
            filter,
            processingId: null,
          };
        })
      );
    });
  });
  return { options };
});

const refreshFilter = (optionsState, autoCompleteValue, idLayer, dispatch) => {
  const filters = [];
  // Cálculo del filtro
  const layers = [
    {
      idLayer,
      groups: filters,
    },
  ];
  dispatch(mapActions.filterUpdate({ layers }));
  return layers;
};

const refreshFilterRequest = createAsyncThunk(
  'explorer/refreshFilterRequest',
  async ({ idLayer }, { getState, dispatch }) => {
    const {
      explorer: { options: optionsState, autoCompleteValue },
    } = getState();
    const layersFilters = refreshFilter(optionsState, autoCompleteValue, idLayer, dispatch);
    return layersFilters;
  }
);

const checkChange = createAsyncThunk(
  'explorer/checkChange',
  async ({ idLayer }, { dispatch }) => {
    dispatch(refreshFilterRequest({ idLayer }));
  },
  {
    condition: ({ idExplorer, itemId }, { getState }) => {
      const state = getState();
      const { processingId } = state.explorer.options[idExplorer][itemId];
      return state.map.isMapReady && processingId === null;
    },
  }
);

const allSelected = createAsyncThunk('explorer/allSelected', async ({ idExp, idG }, { getState }) => {
  const optionsUpdated = { ...getState().explorer.options };
  const itemsChange = [];
  Object.keys(optionsUpdated[idExp]).forEach((item) => {
    if (optionsUpdated[idExp][item].idGroup === idG) {
      itemsChange.push(item);
    }
  });
  return { itemsChange };
});

const explorer = createSlice({
  name: 'explorer',
  initialState: {
    autoCompleteValue: [],
    filterHeighOptions: true,
    filterIncidenceOptions: false,
    options: {},
    layersFilters: null,
  },
  reducers: {
    filterHeighOptions: (draftState, action) => {
      draftState.filterHeighOptions = action.payload;
    },
    filterIncidenceOptions: (draftState, action) => {
      draftState.filterIncidenceOptions = action.payload;
    },
    selectedValue: (draftState, action) => {
      draftState.autoCompleteValue = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkChange.pending, (draftState, { meta: { requestId, arg: { idExplorer, itemId, isVisible } } }) => {
        draftState.options[idExplorer][itemId].isVisible = isVisible;
        draftState.options[idExplorer][itemId].processingId = requestId;
      })
      .addCase(checkChange.fulfilled, (draftState, { meta: { arg: { idExplorer, itemId, isVisible } } }) => {
        draftState.options[idExplorer][itemId].isVisible = isVisible;
        draftState.options[idExplorer][itemId].processingId = null;
      })
      .addCase(checkChange.rejected, (draftState, { meta: { arg: { idExplorer, itemId } } }) => {
        draftState.options[idExplorer][itemId].processingId = null;
      })
      .addCase(refreshFilterRequest.fulfilled, (draftState, { payload }) => {
        draftState.layersFilters = payload;
      })
      .addCase(allSelected.fulfilled, (draftState, { meta: { arg: { idExp, isSelected } }, payload: { itemsChange } }) => {
        itemsChange.forEach((item) => {
          draftState.options[idExp][item].isVisible = isSelected;
        });
      })
      .addCase(loadExplorerOptions.fulfilled, (draftState, { payload: { options } }) => {
        draftState.options = options;
      });
  },
});

export default explorer.reducer;

const actions = {
  ...explorer.actions,
  checkChange,
  refreshFilterRequest,
  allSelected,
  loadExplorerOptions,
};
export { actions };
