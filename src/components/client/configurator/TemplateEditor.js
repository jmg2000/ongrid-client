import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Tabs, List, Icon, Button } from 'antd'

import FroalaEditor from 'react-froala-wysiwyg'

import 'froala-editor/js/languages/ru.js'

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import './TemplateEditor.css'

const { TabPane } = Tabs

class TemplateEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      model: 'Example text',
      froalaInstance: null
    }
  }

  insertText = text => {
    console.log('insert')
    this.froalaInstance.html.insert(text, true)
  }

  handleModelChange = model => {
    this.setState({ model })
  }

  render () {
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

    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-9'>
            <FroalaEditor config={editorConfig} model={this.state.model} onModelChange={this.handleModelChange} />
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
                      <Button type='default' onClick={() => this.insertText(`{{${item}}}`)}>
                        <Icon type='double-left' style={{ position: 'absolute', top: '6px', left: '6px' }} />
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
            <Button type='primary'>Save</Button>
            <Button type='default'>Cancel</Button>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  configuration: state.configuration
})

export default connect(mapStateToProps)(TemplateEditor)
