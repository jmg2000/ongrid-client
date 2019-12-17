import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Tabs, List, Icon, Button } from 'antd'
import axios from 'axios'
import queryString from 'query-string'
import ReactLoading from 'react-loading'
import { withRouter } from 'react-router-dom'

import FroalaEditor from 'react-froala-wysiwyg'

import 'froala-editor/js/languages/ru.js'

// actions
import { fetchConfiguration } from '../../../actions/configurationActions'
import { addObjectProp, modifyObjectProp } from '../../../actions/propsActions'

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import './TemplateEditor.css'

const { TabPane } = Tabs

class TemplateEditor extends React.Component {
  constructor (props) {
    super(props)

    if (
      props.configuration.items.length === 0 &&
      props.configuration.loading === false
    ) {
      console.log('fetchConfiguration')
      props.fetchConfiguration()
    }

    this.state = {
      model: 'Example text',
      froalaInstance: null,
      loading: true,
      template: null,
      fileNameProp: null
    }
  }

  componentDidMount () {
    const query = queryString.parse(this.props.location.search)
    console.log(query)
    if (query.owner) {
      const template = this.props.configuration.items.find(
        item => item.id === parseInt(query.owner)
      )
      console.log(template)
      console.log(query.objectid)
      if (query.objectid !== 'null') {
        axios
          .get(`/api/configuration/object-props/${query.owner}`)
          .then(response => {
            console.log(response.data)
            let property
            for (const prop of response.data.props) {
              console.log(prop)
              if (prop.id === parseInt(query.objectid)) {
                property = prop
                break
              }
            }
            console.log(property)
            axios
              .get(`/api/template/${property.paramValue}`)
              .then(response => {
                console.log(response.data)
                this.setState({
                  model: response.data,
                  template,
                  fileNameProp: property,
                  loading: false
                })
              })
              .catch(err => {
                console.log(err)
                this.setState({
                  template,
                  loading: false
                })
              })
          })
          .catch(err => console.log(err))
      } else {
        this.setState({
          template,
          loading: false
        })
      }
    }
  }

  insertText = text => {
    console.log('insert')
    this.froalaInstance.html.insert(text, true)
  }

  handleModelChange = model => {
    this.setState({ model })
  }

  handleSaveTemplate = () => {
    const { template, fileNameProp } = this.state
    axios
      .post('/api/template', {
        html: this.state.model,
        fileName: fileNameProp && fileNameProp.paramValue
      })
      .then(response => {
        console.log(response.data)
        const fileName = response.data.fileName
        const property = {
          id: fileNameProp ? fileNameProp.id : null,
          name: 'FileName',
          type: 2,
          paramValue: fileName,
          owner: template.id
        }
        // TODO: не пересохранять свойство, если не поменялось имя файла
        if (fileNameProp) {
          this.props.modifyObjectProp(property)
        } else {
          this.props.addObjectProp(property)
        }
      })
      .catch(err => console.log(err))
  }

  handleReturnToConfigurator = () => {
    this.props.history.push(`/configuration?objecttype=4&objectid=${this.state.template.id}`)
  }

  render () {
    const { loading } = this.state
    const tabs = ['Rents.CarLessor', 'Rents.Comment']
    const setFloalaInstance = instance => {
      this.froalaInstance = instance
    }
    const editorConfig = {
      events: {
        initialized: function () {
          setFloalaInstance(this)
        }
      }
    }

    if (loading) {
      return (
        <div className='loader'>
          <ReactLoading
            type='spinningBubbles'
            color='#007bff'
            height={'15%'}
            width={'15%'}
          />
        </div>
      )
    }

    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-9'>
            <FroalaEditor
              config={editorConfig}
              model={this.state.model}
              onModelChange={this.handleModelChange}
            />
          </div>
          <div className='col-sm-3'>
            <Tabs defaultActiveKey='tabs' key='tabs'>
              <TabPane tab='Закладки' key='tabs'>
                <List
                  size='small'
                  bordered
                  dataSource={tabs}
                  renderItem={item => (
                    <List.Item>
                      <Button
                        type='default'
                        onClick={() => this.insertText(`{{${item}}}`)}
                      >
                        <Icon
                          type='double-left'
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px'
                          }}
                        />
                        {item}
                      </Button>
                    </List.Item>
                  )}
                />
              </TabPane>
              <TabPane tab='Табличные закладки' key='table'>
                567
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className='row'>
          <div className='TemplateEditor__MainButtons'>
            <Button type='primary' onClick={this.handleSaveTemplate}>
              Save
            </Button>
            <Button type='default' onClick={this.handleReturnToConfigurator}>Return to Configuration editor</Button>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  configuration: state.configuration
})

export default connect(mapStateToProps, { fetchConfiguration, addObjectProp, modifyObjectProp })(withRouter(TemplateEditor))
