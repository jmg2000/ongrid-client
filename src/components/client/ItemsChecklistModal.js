import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

class ItemsChecklistModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      items: props.items
    }
    this.handlerItemChange = this.handlerItemChange.bind(this)
    this.handlerOnSave = this.handlerOnSave.bind(this)
  }

  static getDerivedStateFromProps (nextProps, state) {
    if (state.show !== nextProps.show) {
      return {
        show: nextProps.show,
        items: nextProps.items
      }
    }
    return null
  }

  handlerItemChange (item) {
    const { items } = this.state
    this.setState({
      items: items.map(i => (i.id === item.id ? { ...i, selected: !i.selected } : i))
    })
  }

  handlerOnSave () {
    this.props.onSave(this.state.items)
  }

  render () {
    const { show, items } = this.state
    const { title, onClose } = this.props
    return (
      <Modal isOpen={show}>
        <ModalHeader toggle={onClose}>{title}</ModalHeader>
        <ModalBody>
          <form>
            <div className='form-group'>
              {items.map(item => (
                <ItemCheckbox
                  key={item.id}
                  itemName={item.name}
                  checked={item.selected}
                  onChange={() => this.handlerItemChange(item)}
                />
              ))}
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button role='button' className='btn btn-secondary' onClick={onClose}>
            Закрыть
          </button>
          <button role='button' className='btn btn-primary' onClick={this.handlerOnSave}>
            Сохранить
          </button>
        </ModalFooter>
      </Modal>
    )
  }
}

ItemsChecklistModal.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      selected: PropTypes.bool
    })
  ).isRequired,
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func
}

const ItemCheckbox = ({ itemName, checked, onChange }) => (
  <div className='form-check'>
    <input type='checkbox' className='form-check-input' checked={checked} onChange={onChange} />
    <label className='form-check-label'>
      {itemName}
    </label>
  </div>
)

ItemCheckbox.propTypes = {
  itemName: PropTypes.string.isRequired,
  checked: PropTypes.bool
}

export default ItemsChecklistModal
