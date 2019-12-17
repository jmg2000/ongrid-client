import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import { Table, Tabs, Modal, Input } from 'antd'
// components
import SystemProps from './SystemProps'
import EditableTable from './EditableTable'
import EventEditForm from './EventEdit'
// actions
import { fetchProps } from '../../../actions/propsActions'
import { addObjectEvent, modifyObjectEvent, addObjectProp, modifyObjectProp } from '../../../actions/propsActions'
import { modifyConfiguration } from '../../../actions/configurationActions'

const { TabPane } = Tabs

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
    const { selectedEvent } = this.state
    const { form } = this.formRef.props

    form.validateFields((err, values) => {
      if (err) {
        console.log(err)
        return
      }
      const object = {
        id: selectedEvent.objectId,
        name: selectedEvent.name,
        description: selectedEvent.description,
        type: 3,
        paramValue: values.event,
        owner: entity.id
      }
      if (selectedEvent.objectId) {
        this.props.modifyObjectEvent(object)
      } else {
        this.props.addObjectEvent(object)
      }
      form.resetFields()
      this.setState({ showEventEditModal: false })
    })
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
        type: 2,
        paramValue: prop.value,
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

  getProperties = () => {
    const { properties, entity } = this.props
    // выбыраем все св-ва по умолчанию для данного типа объекта
    const defaultProps = this.props.defaultProps.filter(
      p => p.type === entity.type && p.paramType === entity.paramType && p.propType === 'property'
    )
    return defaultProps.map(property => {
      const entityProp = properties.find(p => p.name.toLowerCase() === property.name.toLowerCase())
      return {
        ...property,
        objectId: entityProp ? entityProp.id : null,
        paramValue: entityProp ? entityProp.paramValue : property.defaultValue,
        default: !entityProp,
        owner: entity.id
      }
    })
  }

  getEvents = () => {
    const { events, entity } = this.props
    // console.log(events)
    // выбыраем все события по умолчанию для данного типа объекта
    const defaultProps = this.props.defaultProps.filter(
      p => p.type === entity.type && p.paramType === entity.paramType && p.propType === 'event'
    )
    return defaultProps.map(event => {
      // console.log(event)
      let entityEvents
      if (events.length > 0) {
        entityEvents = events.find(e => e.name.toLowerCase() === event.name.toLowerCase())
      }
      return {
        ...event,
        objectId: entityEvents ? entityEvents.id : null,
        paramValue: entityEvents ? entityEvents.paramValue : event.defaultValue,
        default: !entityEvents,
        owner: entity.id
      }
    })
  }

  saveFormRef = formRef => {
    this.formRef = formRef
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
        value: item.paramValue,
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
              size='middle'
              columns={columns}
              dataSource={events}
              pagination={{ pageSize: 100 }}
              scroll={{ y: 540 }}
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
        <EventEditForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.showEventEditModal}
          onCancel={this.handleEventEditClose}
          onSave={this.handleSaveEvent}
          defaultValue={this.state.eventEditValue}
        />
      </React.Fragment>
    )
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
      paramValue: PropTypes.string
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
