import C from './constants'
import axios from 'axios'

const parseResponse = response => response.data
const logError = error => console.log(error)
const logData = data => {
  console.log(data)
  return data
}

const fetchAndDispatch = (dispatch, url, method, body) => {
  axios({ method: method, url: url, data: body })
    .then(parseResponse)
    .then(dispatch)
    .catch(logError)
}

const handleErrors = response => {
  if (response.statusText !== 'OK') {
    throw Error(response.statusText)
  }
  return response
}

export const fetchWorkplaces = () => dispatch => {
  dispatch(fetchWorkplacesBegin())
  return axios
    .get('/api/clients/current/workplaces')
    .then(handleErrors)
    .then(parseResponse)
    .then(logData)
    .then(json => {
      dispatch(fetchWorkplacesSuccess(json.workplaces))
      return json.workplaces
    })
    .catch(error => dispatch(fetchWorkplacesFailure(error)))
}

export const fetchWorkplacesBegin = () => ({
  type: C.FETCH_WORKPLACES_BEGIN
})

export const fetchWorkplacesSuccess = workplaces => ({
  type: C.FETCH_WORKPLACES_SUCCESS,
  payload: { workplaces }
})

export const fetchWorkplacesFailure = error => ({
  type: C.FETCH_WORKPLACES_FAILURE,
  payload: { error }
})

export const enableWorkplace = wpId => dispatch =>
  fetchAndDispatch(dispatch, `/api/clients/current/workplace/${wpId}/enable`, 'PUT')

export const disableWorkplace = wpId => dispatch => {
  console.log('disableWorkplace')
  fetchAndDispatch(dispatch, `/api/clients/current/workplace/${wpId}/disable`, 'PUT')
}

export const removeWorkplace = wpId => dispatch =>
  fetchAndDispatch(dispatch, `/api/clients/current/workplaces/${wpId}`, 'DELETE')

  