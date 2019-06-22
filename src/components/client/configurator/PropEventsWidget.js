import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import Property from './Prop'
import Event from './Event'
import { fetchProps } from '../../../actions/propsActions'
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import SystemProps from './SystemProps'

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
    this.props.loadProps(this.props.entity.id)
  }

  handlePropertyClick (property) {
    this.setState({ selectedProperty: property })
  }

  handleTabSelect (key) {
    this.setState({ activeTab: key })
  }

  render () {
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
                <SystemProps entity={entity} onEntityChange={onEntityChange} />
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
  events: PropTypes.array,
  onEntityChange: PropTypes.func
}

const mapStateToProps = state => ({
  properties: state.currentProps.properties,
  events: state.currentProps.events,
})

const mapDispatchToProps = dispatch => ({
  loadProps (objectId) {
    dispatch(fetchProps(objectId))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNamespaces('translation')(PropEventsBlock))
