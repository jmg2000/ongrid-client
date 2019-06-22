import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import { enableWorkplace, disableWorkplace, removeWorkplace, fetchWorkplaces } from '../../actions/workplaceActions'
import './workplaces.css'

class WorkPlaces extends Component {
  componentWillMount () {
    this.props.loadWorkPlaces()
  }
  
  handlerOnCheck = wp => {
    const { onWPEnable, onWPDisable } = this.props
    console.log(wp._id)
    if (wp.enabled) {
      console.log('wp disable')
      onWPDisable(wp._id)
    } else {
      console.log('wp enable')
      onWPEnable(wp._id)
    }
  }

  handleOnDelete = wp => {
    const { onWPDelete } = this.props
    console.log('onDelete: ', wp)
    onWPDelete(wp._id)
  }

  render () {
    const { client, workplaces, t } = this.props

    if (client.error || workplaces.error) {
      return <div>Error!!! {/*client.error.message ? client.error.message : workplaces.error.message*/}</div>
    }
    if (client.loading || workplaces.loading) {
      return (
        <div className='loader'>
          <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
        </div>
      )
    }
    return (
      <div className='container'>
        <section className='workplaces-section'>
          <table className='table'>
            <thead>
              <tr>
                <th>{t('workPlace.wpName')}</th>
                <th>{t('workPlace.macAddr')}</th>
                <th>{t('workPlace.enable')}</th>
                <th>{t('workPlace.control')}</th>
              </tr>
            </thead>
            <tbody>
              {workplaces.items.map(wp => (
                <tr key={wp._id}>
                  <td>{wp.wpName}</td>
                  <td>{wp.macAddr}</td>
                  <td>
                    <input type='checkbox' checked={wp.enabled} onChange={() => this.handlerOnCheck(wp)} />
                  </td>
                  <td>
                    <button className='btn btn-danger' onClick={() => this.handleOnDelete(wp)}>
                      {t('workPlace.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  client: state.client,
  workplaces: state.workplaces
})

const mapDispatchToProps = dispatch => ({
  onWPEnable (wpId) {
    dispatch(enableWorkplace(wpId))
  },
  onWPDisable (wpId) {
    dispatch(disableWorkplace(wpId))
  },
  onWPDelete (wpId) {
    dispatch(removeWorkplace(wpId))
  },
  loadWorkPlaces () {
    dispatch(fetchWorkplaces())
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNamespaces('translation')(WorkPlaces))
