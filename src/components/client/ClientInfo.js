import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactLoading from 'react-loading'
import { initialize } from 'redux-form'
import ClientInfoForm from './ClientInfoForm'
import { updateClientInfo, fetchClient } from '../../actions/clientActions'
// import './client-info.css'

class ClientInfo extends Component {
  componentDidMount () {
    this.props.getClientInfo()
  }

  handlerOnSubmit = values => {
    const { onClientUpdate } = this.props
    onClientUpdate(values)
  }

  render () {
    const { loading, client, error, initializeInfo } = this.props
    if (error) {
      return <div>Error!!! {error.message}</div>
    }
    if (loading) {
      return (
        <div className='loader'>
          <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
        </div>
      )
    }
    initializeInfo(client.info)
    return (
      <div className='container'>
        <ClientInfoForm onSubmit={this.handlerOnSubmit} />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  client: state.client,
  loading: state.client.loading,
  error: state.client.error
})

const mapDispatchToProps = dispatch => ({
  initializeInfo (client) {
    dispatch(initialize('clientInfo', client))
  },
  onClientUpdate (client) {
    dispatch(updateClientInfo(client))
  },
  getClientInfo () {
    dispatch(fetchClient())
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClientInfo)
