import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

// styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

class TemplateEditor extends React.Component {
  constructor (props) {
    super(props)
    const html = '<p>Hey this <strong>editor</strong> rocks 😀</p>'
    const contentBlock = htmlToDraft(html)
    console.log(contentBlock)
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      this.state = {
        editorState
      }
    }
  }

  onEditorStateChange = editorState => {
    this.setState({ editorState })
  }

  render () {
    const { editorState } = this.state

    return (
      <div className='container-fluid'>>
        <Editor 
          editorState={editorState}
          toolbarClassName='rdw-storybook-toolbar'
          wrapperClassName='rdw-storybook-wrapper'
          editorClassName='rdw-storybook-editor'
          onEditorStateChange={this.onEditorStateChange}
        />
        {/* <textarea disabled value={draftToHtml(convertToRaw(editorState.getCurrentContent()))} /> */}
      </div>
    )
  }
}

export default TemplateEditor
