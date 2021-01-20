import axios from 'axios';
import { REGISTER_FAIL, REGISTER_SUCCESS } from '../actions/types';
import { setAlert } from './alert';

export const register = (formData) => async (dispatch) => {
  const config = {
    header: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify(formData);
  console.log(body);

  try {
    const res = await axios.post('/api/users', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors)
      errors.forEach((errors) => dispatch(setAlert(errors.msg, 'danger')));
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};
