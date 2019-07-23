import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import { Table, Tabs, Modal, Input } from 'antd'
// components
import SystemProps from './SystemProps'
import EditableTable from './EditableTable'
// actions
import { fetchProps } from '../../../actions/propsActions'
import { addObjectEvent, modifyObjectEvent, addObjectProp, modifyObjectProp } from '../../../actions/propsActions'
import { modifyConfiguration } from '../../../actions/configurationActions'

const { TabPane } = Tabs
const { TextArea } = Input

const objectsPropsName = ['ID', 'Name', 'Description', 'Tag']

class PropEventsBlock extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedProperty: null,
      selectedEvent: null,
      activeTab: '1',
      showEventEditModal: false,
      eventEditValue: null
    }
    this.handlePropertyClick = this.handlePropertyClick.bind(this)
    this.handleTabSelect = this.handleTabSelect.bind(this)
  }

  componentDidMount () {
    console.log('PropEventsBlock componentDidMount')
    this.props.fetchProps(this.props.entity.id)
  }

  handlePropertyClick (property) {
    console.log('handlePropertyClick')
    this.setState({ selectedProperty: property })
  }

  handleTabSelect (key) {
    this.setState({ activeTab: key })
  }

  handleEventEditClose = () => {
    this.setState({ showEventEditModal: false })
  }

  handleEventEditShow = record => {
    console.log(record)
    this.setState({
      eventEditValue: record.value,
      showEventEditModal: true
    })
  }

  handleEventValueChange = ev => {
    this.setState({ eventEditValue: ev.target.value })
  }

  handleSaveEvent = () => {
    const { entity } = this.props
    const { selectedEvent, eventEditValue } = this.state
    const object = {
      id: selectedEvent.objectId,
      name: selectedEvent.name,
      description: selectedEvent.description,
      type: selectedEvent.propType === 'property' ? 2 : 3,
      paramValue: selectedEvent.paramValue,
      eventValue: eventEditValue,
      owner: entity.id
    }
    if (selectedEvent.objectId) {
      this.props.modifyObjectEvent(object)
    } else {
      this.props.addObjectEvent(object)
    }
    this.setState({ showEventEditModal: false })
  }

  handleSaveProp = prop => {
    const { entity } = this.props
    const { selectedProperty } = this.state
    if (objectsPropsName.includes(prop.property)) {
      console.log('objects props')
      const editProp = objectsPropsName.indexOf(prop.property)
      console.log(editProp)
      const object = {
        ...entity,
        name: editProp === 1 ? prop.value : entity.name,
        description: editProp === 2 ? prop.value : entity.description,
        tag: editProp === 3 ? prop.value : entity.tag
      }
      this.props.modifyConfiguration(object)
    } else {
      const property = {
        id: selectedProperty.objectId,
        name: selectedProperty.name,
        description: selectedProperty.description,
        type: selectedProperty.propType === 'property' ? 2 : 3,
        paramValue: prop.value,
        eventValue: selectedProperty.eventValue,
        owner: entity.id
      }
      if (selectedProperty.objectId) {
        this.props.modifyObjectProp(property)
      } else {
        this.props.addObjectProp(property)
      }
    }
  }

  handleEventClick = event => {
    this.setState({ selectedEvent: event })
  }

  handlePropertyClick = prop => {
    this.setState({ selectedProperty: prop })
  }

  validateObjectName = (rule, value, cb) => {
    const { objectsList, entity } = this.props
    console.log('validator', rule, value)
    const dublicate = objectsList.find(obj => obj.name.toLowerCase() === value.toLowerCase())
    if (dublicate && entity.id !== dublicate.id) {
      cb(false)
    }
    cb()
  }

  render () {
    const { activeTab } = this.state
    const { entity, t } = this.props

    const columns = [
      {
        title: t('configurator.objectProperty'),
        dataIndex: 'property',
        width: '50%',
        sorter: (a, b) => {
          const nameA = a.property.toLowerCase()
          const nameB = b.property.toLowerCase()
          if (nameA < nameB) {
            // sort string ascending
            return -1
          }
          if (nameA > nameB) return 1
          return 0
        }
      },
      {
        title: t('configurator.propertyValue'),
        dataIndex: 'value',
        width: '50%',
        editable: true
      }
    ]

    let properties = objectsPropsName.map((item, idx) => ({
      key: idx,
      property: item,
      value: entity[item.toLowerCase()],
      default: item.default
    }))

    properties = [
      ...properties,
      ...this.getProperties().map(item => ({
        key: item.id,
        property: item.name,
        value: item.paramValue,
        valueType: item.valueType,
        values: item.values,
        default: item.default,
        ...item
      }))
    ]

    const events = [
      ...this.getEvents().map(item => ({
        key: item.id,
        property: item.name,
        value: item.eventValue,
        default: item.default,
        ...item
      }))
    ]

    return (
      <React.Fragment>
        <Tabs defaultActiveKey={activeTab} type='card' onChange={this.handleTabSelect}>
          <TabPane tab={t('configurator.properties')} key='1'>
            <EditableTable
              columns={columns}
              dataSource={properties}
              onRowClick={this.handlePropertyClick}
              onChange={this.handleSaveProp}
              validator={this.validateObjectName}
            />
          </TabPane>
          <TabPane tab={t('configurator.events')} key='2'>
            <Table
              bordered
              size='small'
              columns={columns}
              dataSource={events}
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => this.handleEventClick(record),
                  onDoubleClick: () => this.handleEventEditShow(record),
                  className: !record.default && 'editable-row__text-primary'
                }
              }}
            />
          </TabPane>
        </Tabs>
        <Modal
          title='Редактирование события'
          visible={this.state.showEventEditModal}
          onOk={this.handleSaveEvent}
          onCancel={this.handleEventEditClose}
        >
          <span>Код события:</span>
          <TextArea rows={20} defaultValue={this.state.eventEditValue} onChange={this.handleEventValueChange} />
        </Modal>
      </React.Fragment>
    )
  }

  getProperties = () => {
    const { properties, entity } = this.props
    // выбыраем все св-ва по умолчанию для данного типа объекта
    const defaultProps = this.props.defaultProps.filter(p => p.type === entity.type && p.propType === 'property')
    return defaultProps.map(property => {
      const entityProp = properties.find(p => p.name === property.name)
      return {
        ...property,
        objectId: entityProp ? entityProp.id : null,
        paramValue: entityProp ? entityProp.paramValue : property.defaultValue,
        eventValue: entityProp ? entityProp.eventValue : property.defaultValue,
        default: !entityProp
      }
    })
  }

  getEvents = () => {
    const { events, entity } = this.props
    // выбыраем все события по умолчанию для данного типа объекта
    const defaultProps = this.props.defaultProps.filter(p => p.type === entity.type && p.propType === 'event')
    return defaultProps.map(event => {
      const entityEvents = events.find(e => e.name === event.name)
      return {
        ...event,
        objectId: entityEvents ? entityEvents.id : null,
        paramValue: entityEvents ? entityEvents.paramValue : event.defaultValue,
        eventValue: entityEvents ? entityEvents.eventValue : event.defaultValue,
        default: !entityEvents
      }
    })
  }
}

PropEventsBlock.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.number
  }).isRequired,
  defaultProps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      type: PropTypes.number,
      name: PropTypes.string,
      paramValue: PropTypes.string,
      eventValue: PropTypes.string
    })
  ).isRequired,
  properties: PropTypes.array,
  events: PropTypes.array,
  objectsList: PropTypes.array.isRequired
}

const mapStateToProps = state => ({
  properties: state.currentProps.properties,
  events: state.currentProps.events
})

export default connect(
  mapStateToProps,
  { fetchProps, addObjectEvent, modifyObjectEvent, addObjectProp, modifyObjectProp, modifyConfiguration }
)(withNamespaces('translation')(PropEventsBlock))
