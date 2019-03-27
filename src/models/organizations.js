import { routerRedux } from 'dva/router';
import { initialize, stopSubmit } from 'redux-form';
import { message } from 'antd';
import { get, keyBy, omit } from 'lodash';

import * as organizationsService from '../services/organizations';

export default {
  namespace: 'organizations',

  state: {},

  effects: {
    *list(action, { put, call }) {
      try {
        const response = yield call(organizationsService.list);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error('Error loading organizations list!', 5);
      }
    },

    *details(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading organization details!', 5);
      }
    },

    *initialize(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('organization', response, false));
      } catch (e) {
        message.error('Error initializing organization form!', 5);
      }
    },

    *logo(
      {
        payload: { _id, _rev, file },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.logo, { _id, _rev, file });
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Organization logo changed!', 5);
      } catch (e) {
        message.error('Error changing organization logo!', 5);
      }
    },

    *save({ data }, { put, call }) {
      try {
        const response = yield call(organizationsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Organization saved!', 5);
        yield put(stopSubmit('organization'));
        yield put(routerRedux.push('/settings/organization'));
      } catch (e) {
        message.error('Error saving organization!', 5);
      }
    },
  },

  reducers: {
    listSuccess(state, payload) {
      const { data } = payload;

      return {
        ...state,
        items: keyBy(data, '_id'),
      };
    },

    detailsSuccess(state, payload) {
      const { data } = payload;

      return {
        ...state,
        items: {
          ...state.items,
          [data._id]: omit(data, '_attachments'),
        },
        attachments: {
          ...state.attachments,
          [data._id]: get(data, '_attachments'),
        },
      };
    },
  },
};
