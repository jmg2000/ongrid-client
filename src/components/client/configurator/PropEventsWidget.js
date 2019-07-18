import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import { Table, Tabs } from 'antd'
import { Nav, NavItem, NavLink, TabContent } from 'reactstrap'
// components
import SystemProps from './SystemProps'
import Property from './Prop'
import Event from './Event'
import EditableTable from './EditableTable'
// actions
import { fetchProps } from '../../../actions/propsActions'

const { TabPane } = Tabs

const objectsPropsName = ['ID', 'Name', 'Description', 'Tag']

class PropEventsBlock extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedProperty: null,
      selectedEvent: null,
      activeTab: '1'
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

  render () {
    const { selectedProperty, activeTab } = this.state
    const { onEntityChange, entity, t } = this.props
    const columns = [
      {
        title: t('configurator.objectProperty'),
        dataIndex: 'property',
        width: '50%'
      },
      {
        title: t('configurator.propertyValue'),
        dataIndex: 'value',
        width: '50%',
        editable: true
      }
    ]

    let dataSource = objectsPropsName.map((item, idx) => ({
      key: idx,
      property: item,
      value: entity[item.toLowerCase()]
    }))

    dataSource = [...dataSource, ...this.getProperties().map(item => ({
      key: item.id,
      property: item.name,
      value: item.paramValue,
      valueType: item.valueType,
      values: item.values
    }))]

    return (
      <Tabs defaultActiveKey={activeTab} type='card' onChange={this.handleTabSelect}>
        <TabPane tab={t('configurator.properties')} key='1'>
          <EditableTable columns={columns} dataSource={dataSource} />
          {console.log(this.getProperties())}
        </TabPane>
        <TabPane tab={t('configurator.events')} key='2'>
          <Table bordered size='small' />
        </TabPane>
      </Tabs>
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
    let defaultProps = this.props.defaultProps.filter(p => p.type === entity.type && p.propType === 'property')
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
    let defaultProps = this.props.defaultProps.filter(p => p.type === entity.type && p.propType === 'event')
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
  { fetchProps }
)(withNamespaces('translation')(PropEventsBlock))
