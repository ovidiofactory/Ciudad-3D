import {
  loadAppConfig,
  getLayersGroups,
  getLayersByLayersGroupId,
  getFullLayerConfig,
  getExplorerFilters,
  getFullExplorerLayerConfig,
  getBaseLayers,
  getCamera,
  getImagesToLoad,
  getImagesToMerge,
} from 'utils/configQueries';
import { mapOnPromise, loadImages, mergeImages } from 'utils/mapboxUtils';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let mapGL = null;

// Definición de asyncThunks antes de su uso
const initMap = createAsyncThunk(
  'map/initMap',
  async (mapInstance) => {
    mapGL = mapInstance;
    const mapOnLoad = mapOnPromise(mapInstance.map)('load');
    const imagesToLoad = getImagesToLoad().map(({ id, data }) => ({
      id,
      data,
    }));
    const imagesToMerge = getImagesToMerge();

    return mapOnLoad
      .then(() => loadImages(mapGL.map, imagesToLoad))
      .then(() =>
        imagesToMerge.forEach((images) => mergeImages(mapGL.map, images))
      )
      .then(() => true)
      .catch(() => false);
  },
  {
    condition: () => mapGL === null,
  }
);

const toggleLayer = createAsyncThunk(
  'map/toggleLayer',
  async ({ idGroup, idLayer }, { getState }) => {
    const state = getState();
    const { isVisible, index } = state.map.groups[idGroup][idLayer];
    const layer = getFullLayerConfig(idGroup, idLayer);
    const order = await mapGL.toggle(layer, isVisible, index, state.map.groups);
    await mapOnPromise(mapGL.map)('idle');
    return { order };
  },
  {
    condition: ({ idGroup, idLayer }, { getState }) => {
      const state = getState();
      const layerState = state.map.groups[idGroup][idLayer];
      return state.map.isMapReady && layerState.processingId === null;
    },
  }
);

const loadLayers = createAsyncThunk('map/loadLayers', async () => {
  await loadAppConfig();

  const explorerLayers = {};
  getExplorerFilters().forEach(({ id }) => {
    explorerLayers[id] = { isVisible: false, processingId: null };
  });

  const groups = {};
  getLayersGroups().forEach(({ id: idGroup, index }) => {
    groups[idGroup] = {};
    getLayersByLayersGroupId(idGroup).forEach(({ id: idLayer, index: idxLayer }) => {
      groups[idGroup][idLayer] = {
        isVisible: false,
        processingId: null,
        index: idxLayer || index,
        order: 0,
      };
    });
  });

  const baseLayers = getBaseLayers();

  return {
    explorerLayers,
    groups,
    baseLayers,
  };
});

// Slice
const map = createSlice({
  name: 'map',
  initialState: {
    isMapReady: false,
    defaultMapStyle: null,
    camera: null,
    selectedCoords: null,
    groups: {},
    explorerLayers: {},
  },
  reducers: {
    isMeasureActive: (draftState, { payload: isActive }) => {
      draftState.isMeasureActive = isActive;
    },
    cameraUpdated: (
      draftState,
      {
        payload: {
          lat: newLat,
          lng: newLng,
          zoom: newZoom,
          pitch: newPitch,
          bearing: newBearing,
        },
      }
    ) => {
      draftState.camera = {
        lat: newLat,
        lng: newLng,
        zoom: newZoom || draftState.camera.zoom,
        pitch: newPitch ?? draftState.camera.pitch,
        bearing: newBearing ?? draftState.camera.bearing,
      };
    },
    setMapReady: (draftState) => {
      draftState.isMapReady = true;
    },
    clickOnMap: (draftState, action) => {
      draftState.selectedCoords = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initMap.fulfilled, (draftState) => {
        draftState.isMapReady = true;
      })
      .addCase(toggleLayer.pending, (draftState, { meta: { requestId, arg } }) => {
        const { idGroup, idLayer } = arg;
        const layerState = draftState.groups[idGroup][idLayer];
        layerState.processingId = requestId;
        layerState.isVisible = !layerState.isVisible;
      })
      .addCase(toggleLayer.fulfilled, (draftState, { payload, meta }) => {
        const { idGroup, idLayer } = meta.arg;
        const layerState = draftState.groups[idGroup][idLayer];
        layerState.processingId = null;
        layerState.order = payload.order;
      })
      .addCase(toggleLayer.rejected, (draftState, { meta }) => {
        const { idGroup, idLayer } = meta.arg;
        const layerState = draftState.groups[idGroup][idLayer];
        layerState.processingId = null;
      })
      .addCase(loadLayers.fulfilled, (draftState, { payload }) => {
        draftState.groups = payload.groups;
        draftState.explorerLayers = payload.explorerLayers;
        draftState.defaultMapStyle = {
          version: 8,
          sources: payload.baseLayers.sources,
          layers: payload.baseLayers.layers,
          glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
          light: payload.baseLayers.light,
        };
        draftState.camera = getCamera();
      });
  },
});

export default map.reducer;

const actions = {
  ...map.actions,
  initMap,
  toggleLayer,
  loadLayers,
};
export { actions, initMap, toggleLayer, loadLayers };
