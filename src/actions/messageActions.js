import C from './constants'
import axios from 'axios'

const parseResponse = response => response.data
const logError = error => console.log(error)
const logData = data => {
  console.log(data)
  return data
}

const handleErrors = response => {
  if (response.statusText !== 'OK') {
    throw Error(response.statusText)
  }
  return response
}

const fetchAndDispatch = (dispatch, url, method, body) => {
  axios({ method: method, url: url, data: body })
    .then(parseResponse)
    .then(dispatch)
    .catch(logError)
}

export const fetchCustomerMessages = () => dispatch => {
  dispatch(fetchMessagesBegin())
  return axios
    .get('/api/customer/messages')
    .then(handleErrors)
    .then(parseResponse)
    .then(logData)
    .then(json => {
      dispatch(fetchMessagesSuccess(json.messages))
      return json.messages
    })
    .catch(error => dispatch(fetchMessagesFailure(error)))
}

export const fetchClientMessages = () => dispatch => {
  dispatch(fetchMessagesBegin())
  return axios
    .get('/api/clients/current/messages')
    .then(handleErrors)
    .then(parseResponse)
    .then(json => {
      dispatch(fetchMessagesSuccess(json.messages))
      return json.messages
    })
    .catch(error => dispatch(fetchMessagesFailure(error)))
}

export const fetchMessagesBegin = () => ({
  type: C.FETCH_MESSAGES_BEGIN
})

export const fetchMessagesSuccess = messages => ({
  type: C.FETCH_MESSAGES_SUCCESS,
  payload: { messages }
})

export const fetchMessagesFailure = error => ({
  type: C.FETCH_MESSAGES_FAILURE,
  payload: { error }
})

export const setCustomerMessageReaded = (messageId, ownerId) => dispatch => {
  console.log('setMessageReaded:', messageId)
  return fetchAndDispatch(
    dispatch,
    `/api/customer/messages/${messageId}`,
    'PUT',
    {
      ownerId
    }
  )
}

export const setClientMessageReaded = messageId => dispatch => {
  console.log('setMessageReaded:', messageId)
  return fetchAndDispatch(dispatch, `/api/clients/messages/${messageId}`, 'PUT')
}

export const addNewClientMessage = formData => dispatch => {
  return fetchAndDispatch(dispatch, '/api/clients/message', 'POST', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const addNewCustomerMessage = formData => dispatch => {
  return fetchAndDispatch(dispatch, '/api/customer/message', 'POST', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
