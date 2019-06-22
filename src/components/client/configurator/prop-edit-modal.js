import React from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'react-bootstrap'

class PropertyEditModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: null
    }
    this.handlerValueChange = this.handlerValueChange.bind(this)
  }

  handlerValueChange (event) {
    this.setState({
      value: event.target.value
    })
  }

  render () {
    const {show, title, onClose, onSave} = this.props
    const {value} = this.state
    return (
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className='form-horizontal'>
            <div className='form-group'>
              <label htmlFor='name' className='col-sm-3 control-label'>Имя роли</label>
              <div className='col-sm-9'>
                <input type='text' className='form-control' name='name' id='name' value={value} onChange={this.handlerValueChange} />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button role='button' className='btn btn-default' onClick={onClose}>Закрыть</button>
          <button role='button' className='btn btn-primary' onClick={onSave}>Сохранить</button>
        </Modal.Footer>
      </Modal>
    )
  }
}

PropertyEditModal.propTypes = {
  show: PropTypes.bool,
  valueType: PropTypes.string,
  values: PropTypes.array,
  onClose: PropTypes.func,
  onSave: PropTypes.func
}

export default PropertyEditModal
