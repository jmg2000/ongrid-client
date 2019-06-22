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

export const fetchProps = objectId => dispatch => {
  dispatch(fetchPropsBegin())
  return axios
    .get(`/api/configuration/object-props/${objectId}`)
    .then(handleErrors)
    .then(parseResponse)
    .then(logData)
    .then(json => {
      dispatch(fetchPropsSuccess(json))
      return json
    })
    .catch(error => dispatch(fetchPropsFailure(error)))
}

export const fetchPropsBegin = () => ({
  type: C.FETCH_PROPS_BEGIN
})

export const fetchPropsSuccess = payload => ({
  type: C.FETCH_PROPS_SUCCESS,
  payload
})

export const fetchPropsFailure = error => ({
  type: C.FETCH_PROPS_FAILURE,
  payload: { error }
})

export const addObjectProp = property => dispatch => {
  return fetchAndDispatch(dispatch, '/api/configuration/prop', 'POST', { property })
}

export const addObjectEvent = event => dispatch => {
  return fetchAndDispatch(dispatch, '/api/configuration/event', 'POST', { event })
}

export const modifyObjectProp = object => dispatch => {
  return fetchAndDispatch(dispatch, `/api/configuration/prop/${object.id}`, 'PUT', { object })
}

export const modifyObjectEvent = object => dispatch => {
  return fetchAndDispatch(dispatch, `/api/configuration/event/${object.id}`, 'PUT', { object })
}
