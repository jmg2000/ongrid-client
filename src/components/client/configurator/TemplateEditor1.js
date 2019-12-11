import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Tabs, List, Icon, Button } from 'antd'
import { Editor } from '@tinymce/tinymce-react'

const { TabPane } = Tabs

class TemplateEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      content: ''
    }
  }

  handleEditorChange = (content, editor) => {
    // console.log(content)
    this.setState({ content })
  }

  insertText = () => {
    const myField = document.getElementById('tinymce')
    console.log(myField)
    const myValue = '123!!!'
    if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart
      var endPos = myField.selectionEnd
      myField.value =
        myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length)
    } else {
      myField.value += myValue
    }
  }

  render () {
    const tabs = ['Rents.CarLessor', 'Rents.Comment']

    return (
      <div className='container-fluid'>
        <div className='row'>
          <Button type='default' onClick={this.insertText}>
            Insert
          </Button>
        </div>
        <div className='row'>
          <div className='col-sm-9'>
            <Editor
              apiKey='go7ou3haeeu8jf378tj61mhd40d58r08ghzuv9gini28u926'
              initialValue='<p>This is the initial content of the editor</p>'
              value={this.state.content}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | \
             alignleft aligncenter alignright alignjustify | \
             bullist numlist outdent indent | removeformat | help'
              }}
              onEditorChange={this.handleEditorChange}
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
                      <Button type='default' icon='double-left' />
                      <span style={{ marginLeft: '5px' }}>{item}</span>
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
      </div>
    )
  }
}

const mapStateToProps = state => ({
  configuration: state.configuration
})

export default connect(mapStateToProps)(TemplateEditor)
