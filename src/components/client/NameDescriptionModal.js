import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

class NameDescriptionModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      show: false,
      name: '',
      description: ''
    }
    this.handlerNameChange = this.handlerNameChange.bind(this)
    this.handlerDescriptionChange = this.handlerDescriptionChange.bind(this)
  }

  static getDerivedStateFromProps (nextProps, state) {
    if (state.show !== nextProps.show) {
      return {
        show: nextProps.show,
        name: nextProps.name,
        description: nextProps.description
      }
    }
    return null
  }

  handlerNameChange (event) {
    this.setState({ name: event.target.value })
  }

  handlerDescriptionChange (event) {
    this.setState({ description: event.target.value })
  }

  render () {
    const { show, name, description } = this.state
    const { title, onClose, onSave } = this.props
    return (
      <Modal isOpen={show} size='lg'>
        <ModalHeader toggle={onClose}>{title}</ModalHeader>
        <ModalBody>
          <form className='form-row'>
            <div className='form-group'>
              <label htmlFor='name' className='col-sm-3 control-label'>
                Имя роли
              </label>
              <div className='col-sm-9'>
                <input
                  type='text'
                  className='form-control'
                  name='name'
                  id='name'
                  value={name}
                  onChange={this.handlerNameChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='desc' className='col-sm-3 control-label'>
                Описание роли
              </label>
              <div className='col-sm-9'>
                <input
                  type='text'
                  className='form-control'
                  name='description'
                  id='desc'
                  value={description}
                  onChange={this.handlerDescriptionChange}
                />
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button role='button' className='btn btn-secondary' onClick={onClose}>
            Закрыть
          </button>
          <button role='button' className='btn btn-primary' onClick={() => onSave(name, description)}>
            Сохранить
          </button>
        </ModalFooter>
      </Modal>
    )
  }
}

NameDescriptionModal.propTypes = {
  show: PropTypes.bool,
  name: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func
}

export default NameDescriptionModal
