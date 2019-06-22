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

export const fetchConfiguration = () => dispatch => {
  dispatch(fetchConfigurationBegin())
  return axios
    .get('/api/configuration')
    .then(handleErrors)
    .then(parseResponse)
    .then(logData)
    .then(json => {
      dispatch(fetchConfigurationSuccess(json.configuration))
      return json.configuration
    })
    .catch(error => dispatch(fetchConfigurationFailure(error)))
}

export const fetchConfigurationBegin = () => ({
  type: C.FETCH_CONFIGURATION_BEGIN
})

export const fetchConfigurationSuccess = configuration => ({
  type: C.FETCH_CONFIGURATION_SUCCESS,
  payload: { configuration }
})

export const fetchConfigurationFailure = error => ({
  type: C.FETCH_CONFIGURATION_FAILURE,
  payload: { error }
})

export const modifyConfiguration = object => dispatch => {
  return fetchAndDispatch(
    dispatch,
    `/api/configuration/${object.id}`,
    'PUT',
    { object }
  )
}

export const addConfigurationObject = object => dispatch => {
  return fetchAndDispatch(
    dispatch,
    '/api/configuration',
    'POST',
    { object }
  )
}

export const removeConfigurationObject = objectId => dispatch => {
  return fetchAndDispatch(
    dispatch,
    `/api/configuration/${objectId}`,
    'DELETE'
  )
}
