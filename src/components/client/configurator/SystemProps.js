import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { modifyConfiguration } from '../../../actions/configurationActions'

const objectsProps = ['id', 'name', 'description', 'tag']
const objectsPropsName = ['ID', 'Name', 'Description', 'Tag']

class SystemProps extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editProp: null,
      editPropValue: ''
    }
    this.handlePropClick = this.handlePropClick.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleOnBlur = this.handleOnBlur.bind(this)
  }

  handlePropClick (idx) {
    const { entity } = this.props
    const value = entity[objectsProps[idx]]
    if (idx > 0) {
      this.setState({
        editProp: idx,
        editPropValue: value || ''
      })
    }
  }

  handleValueChange (e) {
    this.setState({
      editPropValue: e.target.value
    })
  }

  handleOnBlur (e) {
    const { modifyObject, entity } = this.props
    const { editProp, editPropValue } = this.state
    let object = {
      ...entity,
      name: editProp === 1 ? editPropValue : entity.name,
      description: editProp === 2 ? editPropValue : entity.description,
      tag: editProp === 3 ? editPropValue : entity.tag
    }
    modifyObject(object)
  }

  render () {
    const { editProp, editPropValue } = this.state
    const { entity } = this.props
    return (
      <React.Fragment>
        {objectsProps.map((op, i) => (
          <tr key={i}>
            <td>{objectsPropsName[i]}</td>
            <td onClick={() => this.handlePropClick(i)}>
              {editProp === i ? (
                <input type='text' value={editPropValue} onChange={this.handleValueChange} onBlur={this.handleOnBlur} />
              ) : (
                entity[op]
              )}
            </td>
          </tr>
        ))}
      </React.Fragment>
    )
  }
}

SystemProps.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onEntityChange: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  modifyObject (object) {
    dispatch(modifyConfiguration(object))
  }
})

export default connect(null, mapDispatchToProps)(SystemProps)
