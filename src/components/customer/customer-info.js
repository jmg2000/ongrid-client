import React, { Component } from 'react'
import { connect } from 'react-redux'
import CustomerNavBar from '../../components/navbar-customer'
import CustomerInfoForm from '../../components/customer-info-form'
import { initialize } from 'redux-form'
import { updateCustomerInfo } from '../../store/actions/customer'
import ReactLoading from 'react-loading'
import './customer-info.css'

class CustomerInfoPage extends Component {
  handlerOnSubmit = values => {
    const { onCustomerUpdate } = this.props
    onCustomerUpdate(values)
  }

  render () {
    const { customer, loading, error, initializeInfo } = this.props
    if (error) {
      return <div>Error!!! {error.message}</div>
    }
    if (loading) {
      return (
        <div className='loader'>
          <ReactLoading
            type='spinningBubbles'
            color='#007bff'
            height={'20%'}
            width={'20%'}
          />
        </div>
      )
    }
    initializeInfo(customer.info)
    return (
      <React.Fragment>
        <CustomerNavBar />
        <div className='container'>
          <section className='info'>
            <CustomerInfoForm onSubmit={this.handlerOnSubmit} />
          </section>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  customer: state.customer,
  loading: state.customer.loading,
  error: state.customer.error
})

const mapDispatchToProps = dispatch => ({
  initializeInfo (customer) {
    dispatch(initialize('customerInfo', customer))
  },
  onCustomerUpdate (customer) {
    dispatch(updateCustomerInfo(customer))
  },
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomerInfoPage)
