import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { addObjectEvent, modifyObjectEvent } from '../../../actions/propsActions'

class Event extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      event: props.event,
      showEditModal: false
    }
    this.handleCloseEditModal = this.handleCloseEditModal.bind(this)
    this.handleDblClick = this.handleDblClick.bind(this)
    this.handleOnEventSave = this.handleOnEventSave.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if ((nextProps.event.objectId !== prevState.event.objectId)||(nextProps.event.eventValue !== prevState.event.eventValue)) {
      return {
        event: nextProps.event
      }
    }
    return null
  }

  handleCloseEditModal () {
    this.setState({
      showEditModal: false
    })
  }

  // метод вызывается когда перешли на другое свойство и измененное св-во надо сохранить
  handleOnEventSave (eventBody) {
    const { event } = this.state
    const { entity, onAddObjectEvent, onModifyObjectEvent } = this.props
    const object = {
      id: event.objectId,
      name: event.name,
      description: event.description,
      type: event.propType === 'property' ? 2 : 3,
      paramValue: event.paramValue,
      eventValue: eventBody,
      owner: entity.id
    }
    if (event.objectId) {
      onModifyObjectEvent(object)
    } else {
      onAddObjectEvent(object)
    }
    this.setState({ showEditModal: false })
  }

  handleDblClick () {
    this.setState({
      showEditModal: true
    })
  }

  render () {
    const { showEditModal } = this.state
    const { event } = this.state
    return (
      <tr className={event.default ? '' : 'text-primary'}>
        <td>{event.name}</td>
        <td onDoubleClick={this.handleDblClick}>{event.eventValue}</td>
        {showEditModal && (
          <EditEventModal
            defaultValue={event.eventValue}
            onClose={this.handleCloseEditModal}
            onSave={this.handleOnEventSave}
          />
        )}
      </tr>
    )
  }
}

Event.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    eventValue: PropTypes.string,
    description: PropTypes.string,
    valueType: PropTypes.string,
    default: PropTypes.bool
  }).isRequired,
  entity: PropTypes.object.isRequired
}

class EditEventModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.defaultValue
    }
    this.handleValueChange = this.handleValueChange.bind(this)
  }

  handleValueChange (e) {
    this.setState({
      value: e.target.value
    })
  }

  modalToggle = (e) => {
    console.log(e.target)
  }

  render () {
    const { onClose, onSave } = this.props
    const { value } = this.state
    return (
      <Modal isOpen>
        <ModalHeader toggle={onClose}>
          Редактирование события
        </ModalHeader>
        <ModalBody>
          <form className='form'>
            <div className='form-group'>
              <label htmlFor='code' className='control-label'>
                Код события
              </label>
              <textarea className='form-control' rows='20' id='code' value={value} onChange={this.handleValueChange} />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button role='button' className='btn btn-default' onClick={onClose}>
            Закрыть
          </button>
          <button role='button' className='btn btn-primary' onClick={() => onSave(value)}>
            Сохранить
          </button>
        </ModalFooter>
      </Modal>
    )
  }
}

EditEventModal.propTypes = {
  defaultValue: PropTypes.string,
  onClose: PropTypes.func,
  ovSave: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  onModifyObjectEvent (event) {
    dispatch(modifyObjectEvent(event))
  },
  onAddObjectEvent (event) {
    dispatch(addObjectEvent(event))
  }
})

export default connect(null, mapDispatchToProps)(Event)
