import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import { Table, Tabs, Modal, Input, Form } from 'antd'
import { Nav, NavItem, NavLink, TabContent } from 'reactstrap'
// components
import SystemProps from './SystemProps'
import Property from './Prop'
import Event from './Event'
import EditableTable from './EditableTable'
// actions
import { fetchProps } from '../../../actions/propsActions'
import { addObjectEvent, modifyObjectEvent } from '../../../actions/propsActions'

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
      eventEditValue: null,
      selectedEvent: null
    }
    this.handlePropertyClick = this.handlePropertyClick.bind(this)
    this.handleTabSelect = this.handleTabSelect.bind(this)
  }

  componentDidMount () {
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

  handleEventClick = event => {
    this.setState({ selectedEvent: event })
  }

  render () {
    const { selectedProperty, activeTab } = this.state
    const { onEntityChange, entity, t } = this.props
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
      default: item.default,
      
    }))

    properties = [
      ...properties,
      ...this.getProperties().map(item => ({
        key: item.id,
        property: item.name,
        value: item.paramValue,
        valueType: item.valueType,
        values: item.values,
        default: item.default
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
    console.log(events)

    return (
      <React.Fragment>
        <Tabs defaultActiveKey={activeTab} type='card' onChange={this.handleTabSelect}>
          <TabPane tab={t('configurator.properties')} key='1'>
            <EditableTable columns={columns} dataSource={properties} />
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

  render1 () {
    const { selectedProperty, activeTab } = this.state
    const { onEntityChange, entity, t } = this.props

    return (
      <React.Fragment>
        <Nav tabs>
          <NavItem>
            <NavLink className={classNames({ active: activeTab === '1' })} onClick={() => this.handleTabSelect('1')}>
              {t('configurator.properties')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={classNames({ active: activeTab === '2' })} onClick={() => this.handleTabSelect('2')}>
              {t('configurator.events')}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId='1'>
            <table className='table table-sm table-bordered table-condensed table-hover object-property'>
              <thead>
                <tr>
                  <th>{t('configurator.objectProperty')}</th>
                  <th>{t('configurator.propertyValue')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className='active'>
                  <td className='text-uppercase'>{t('configurator.systemProperty')}</td>
                </tr>
                <SystemProps entity={entity} />
                <tr className='active'>
                  <td className='text-uppercase'>{t('configurator.objectProperty')}</td>
                </tr>
                {this.getProperties().map(prop => (
                  <Property
                    key={prop.id}
                    property={prop}
                    entity={entity}
                    onClick={this.handlePropertyClick}
                    editMode={selectedProperty && selectedProperty.name === prop.name}
                  />
                ))}
              </tbody>
            </table>
          </TabPane>
          <TabPane tabId='2'>
            <table className='table table-sm table-bordered table-condensed table-hover object-property'>
              <thead>
                <tr>
                  <th>{t('configurator.objectProperty')}</th>
                  <th>{t('configurator.propertyValue')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className='active'>
                  <td className='text-uppercase'>{t('configurator.systemProperty')}</td>
                </tr>
                <SystemProps entity={entity} />
                <tr className='active'>
                  <td className='text-uppercase'>{t('configurator.objectProperty')}</td>
                </tr>
                {this.getEvents().map(event => (
                  <Event key={event.id} event={event} entity={entity} />
                ))}
              </tbody>
            </table>
          </TabPane>
        </TabContent>
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
  events: PropTypes.array
}

const mapStateToProps = state => ({
  properties: state.currentProps.properties,
  events: state.currentProps.events
})

export default connect(
  mapStateToProps,
  { fetchProps, addObjectEvent, modifyObjectEvent }
)(withNamespaces('translation')(PropEventsBlock))
