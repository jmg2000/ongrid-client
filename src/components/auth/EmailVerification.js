import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactLoading from 'react-loading'

export class EmailVerification extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      error: null,
      tokenValid: false
    }
  }

  static propTypes = {
    match: PropTypes.object
  }

  componentDidMount () {
    const { match } = this.props
    this.setState({ loading: true })
    axios
      .post('/api/clients/email-verification', {
        token: match.params.token
      })
      .then(response => {
        console.log(response.data)
        this.setState({
          loading: false,
          tokenValid: true
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
          error: err
        })
      })
  }

  render () {
    const { loading, tokenValid } = this.state
    return (
      <div className='container'>
        {loading ? (
          <div className='loader'>
            <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
          </div>
        ) : tokenValid ? (
          <section className='row shadow p-4 mb-5 rounded'>
            <div className='lead m-auto'>Ваш аккаунт активирован. Можете войти в систему.</div>
            <div>
              <Link to='/login' className='btn btn-lg btn-primary'>
                Login
              </Link>
            </div>
          </section>
        ) : (
          <div>Облом..</div>
        )}
      </div>
    )
  }
}

export default EmailVerification
