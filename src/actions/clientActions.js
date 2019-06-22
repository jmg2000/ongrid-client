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

export const updateClientInfo = client => dispatch =>
  fetchAndDispatch(dispatch, `/api/clients/${client.id}`, 'PUT', { client })

export const fetchClient = () => dispatch => {
  dispatch(fetchClientBegin())
  return axios
    .get('/api/clients/current')
    .then(handleErrors)
    .then(parseResponse)
    .then(logData)
    .then(json => {
      dispatch(fetchClientSuccess(json.client))
      return json.client
    })
    .catch(error => dispatch(fetchClientFailure(error)))
}

export const fetchClientBegin = () => ({
  type: C.FETCH_CLIENT_BEGIN
})

export const fetchClientSuccess = client => ({
  type: C.FETCH_CLIENT_SUCCESS,
  payload: { client }
})

export const fetchClientFailure = error => ({
  type: C.FETCH_CLIENT_FAILURE,
  payload: { error }
})
