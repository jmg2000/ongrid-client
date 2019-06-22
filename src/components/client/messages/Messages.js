import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import ReactLoading from 'react-loading'
import {
  setClientMessageReaded,
  addNewClientMessage,
} from '../../../actions/messageActions'
import NewMessageForm from './new-mesasge-form'
import FormData from 'form-data'
import './messages.css'

class Messages extends Component {
  constructor (props) {
    super(props)
    this.state = {
      curMsg: null
    }
  }

  onSelectMessage = msg => {
    console.log(msg.id)
    const { onClientMessageReaded } = this.props
    // direction === 0, значит письмо создано потребителем для клиента
    if (msg.direction === 0 && !msg.readed) {
      onClientMessageReaded(msg.id)
    }
    this.setState({ curMsg: msg })
  }

  handlerOnSubmit = values => {
    const { onNewClientMessage, client } = this.props
    console.log(values)
    const formData = new FormData()
    const customer = client.info.customers.find(customer => customer.id === values.to)
    console.log(customer)
    formData.append('to', JSON.stringify(customer))
    formData.append('message', values.body)
    if (values.attachments) {
      values.attachments.forEach(attach => formData.append('attachments', attach))
    }
    onNewClientMessage(formData)
  }

  render () {
    const { curMsg } = this.state
    const { messages, loading, error, client } = this.props
    if (error) {
      return <div>Error!!! {error.message}</div>
    }
    if (loading) {
      return (
        <div className='loader'>
          <ReactLoading
            type='spinningBubbles'
            color='#000'
            height={'20%'}
            width={'20%'}
          />
        </div>
      )
    }
    return (
      <div className='container'>
          <MessagesList
            messages={messages}
            curMsg={curMsg}
            onSelectMessage={this.onSelectMessage}
          />
          <div className='row'>
            <NewMessageForm
              recipients={client.info.customers}
              onSubmit={this.handlerOnSubmit}
            />
          </div>
      </div>
    )
  }
}

const MessagesList = ({ messages, curMsg, onSelectMessage }) => (
  <div className='list-group'>
    <div className='row'>
      <div className='col-md-5'>
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} onSelectMessage={onSelectMessage} />
        ))}
        {/* <button className='btn btn-primary'>Новое сообщение</button> */}
      </div>
      <div className='col-md-7'>
        {curMsg &&
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {curMsg.direction === 1 ? <span>To:</span> : <span>From:</span>}
              <span>{curMsg.customer}</span>
              <span className='message-createdat'>
                {moment(curMsg.createdAt).format('DD.MM.YYYY, HH:mm:ss')}
              </span>
            </div>
            <div className='panel-body'>
              {curMsg.body}
            </div>
            <div className='panel-footer'>
              <ul>
                {curMsg.attach
                  ? curMsg.attachments.map(attach => (
                    <li key={attach.fileName}>
                      <a
                        href={`/api/client/message-attach/${attach.fileName}`}
                        key={attach.fileName}
                        >
                        {attach.originalFileName}
                      </a>
                    </li>
                    ))
                  : 'No attachments'}
              </ul>
              {curMsg.direction === 0 && <button className='btn btn-info btn-xs'>Ответить</button>}
            </div>
          </div>}
      </div>
    </div>

  </div>
)

const Message = ({ msg, onSelectMessage }) => (
  <div
    className={msg.readed ? 'list-group-item' : 'unreaded list-group-item'}
    onClick={() => onSelectMessage(msg)}
  >
    <div className='list-group-item-heading'>
      {msg.direction === 1
        ? <h4>
          <span>To:</span>
          <span>{getMessageCustomerName(msg.customer)}</span>
        </h4>
        : <h4>
          <span>From:</span>
          <span>{getMessageCustomerName(msg.customer)}</span>
        </h4>}
      <div className='pull-right'>
        {msg.attach
          ? <span
            className='glyphicon glyphicon-folder-open'
            aria-hidden='true'
            />
          : ''}
        <span className='message-created'>
          {moment(msg.createdAt).format('DD.MM.YYYY, HH:mm:ss')}
        </span>
      </div>
    </div>
    <p className='message-body list-group-item-text'>
      {getMessageBody(msg.body)}
    </p>
  </div>
)

const getMessageBody = body =>
  (body.length > 50 ? body.substr(0, 50).concat('...') : body)
  
const getMessageCustomerName = customerName =>
  (customerName.length > 14
    ? customerName.substr(0, 12).concat('...')
    : customerName)

const mapStateToProps = state => ({
  messages: state.messages.items,
  loading: state.messages.loading,
  error: state.messages.error,
  client: state.client
})

const mapDispatchToProps = dispatch => ({
  onClientMessageReaded (msgId) {
    dispatch(setClientMessageReaded(msgId))
  },
  onNewClientMessage (formData) {
    dispatch(addNewClientMessage(formData))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Messages)
