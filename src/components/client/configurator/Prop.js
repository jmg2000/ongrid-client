import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { addObjectProp, modifyObjectProp } from '../../../actions/propsActions'

class Property extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      property: props.property
    }
    this.handleOnBlur = this.handleOnBlur.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.property.objectId !== prevState.property.objectId) {
      return {
        property: nextProps.property
      }
    }
    return null
  }

  saveProperty = (property) => {
    const {entity, onAddObjectProp, onModifyObjectProp} = this.props
    console.log(property)
    const object = {
      id: property.objectId,
      name: property.name,
      description: property.description,
      type: property.propType === 'property' ? 2 : 3,
      paramValue: property.paramValue,
      eventValue: property.eventValue,
      owner: entity.id
    }
    if (property.objectId) {
      onModifyObjectProp(object)
    } else {
      onAddObjectProp(object)
    }
  }

  handleValueChange = (event) => {
    const {property} = this.state
    console.log('ValueOnChange:', event.target.value)
    if (property.valueType === 'filename' || property.valueType === 'picture') {
      const resourceFileName = event.target.value.replace(/^.*[\\\/]/, '')
      this.setState({property: {...property, paramValue: resourceFileName}})
      axios.post('/api/resource', new FormData(this.refs.form)).then(() => {
        this.saveProperty(this.state.property)
      })
    } else {
      this.setState({property: {...property, paramValue: event.target.value}})
    }
  }

  // метод вызывается когда перешли на другое свойство и измененное св-во надо сохранить
  handleOnBlur (event) {
    const {property} = this.state
    console.log(property)
    this.saveProperty(property)
  }

  render () {
    const {editMode, onClick} = this.props
    const {property} = this.state
    return (
      <tr className={property.default ? '' : 'text-primary'}>
        <td>{property.name}</td>
        <td onClick={() => onClick(property)}>
          {editMode ? this.getInputByType(property.valueType) : property.paramValue}
        </td>
      </tr>
    )
  }

  getInputByType (type) {
    const {property} = this.state
    switch (type) {
      case 'string':
      case 'int':
      case 'font':
      case 'set':
        return <input type='text' value={property.paramValue} onChange={this.handleValueChange} onBlur={this.handleOnBlur} />
      case 'bool':
      case 'enum':
        return (
          <select value={property.paramValue} onChange={this.handleValueChange} onBlur={this.handleOnBlur} >
            {property.values.map((val, i) => <option key={i}>{val}</option>)}
          </select>
        )
      case 'color':
        return <input type='color' value={property.paramValue} onChange={this.handleValueChange} onBlur={this.handleOnBlur} />
      case 'filename':
      case 'picture':
        return (
          <form ref='form' action='/api/resource' method='POST' encType='multipart/form-data'>
            <input type='file' name='resource' onChange={this.handleValueChange} />
          </form>
        )
    }
  }
}

Property.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    paramValue: PropTypes.string,
    description: PropTypes.string,
    valueType: PropTypes.string,
    default: PropTypes.bool
  }).isRequired,
  entity: PropTypes.object.isRequired,
  editMode: PropTypes.bool,
  onClick: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  onModifyObjectProp (property) {
    dispatch(modifyObjectProp(property))
  },
  onAddObjectProp (property) {
    dispatch(addObjectProp(property))
  }
})

export default connect(null, mapDispatchToProps)(Property)
