import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { withNamespaces } from 'react-i18next'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

let CreateObjectModal = props => {
  const { t, show, handleClose, handleSubmit, field } = props
  return (
    <Modal isOpen={show}>
      <ModalHeader toggle={handleClose}>{t('configurator.newObject')}</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className='form-group'>
            <label htmlFor='name'>{t('configurator.name')}</label>
            <Field name='name' component='input' type='text' className='form-control' />
          </div>
          <div className='form-group'>
            <label htmlFor='description'>{t('configurator.desc')}</label>
            <Field name='description' component='input' type='text' className='form-control' />
          </div>
          {field && (
            <div className='form-row'>
              <div className='form-group col-sm-8'>
                <label htmlFor='fieldType'>{t('configurator.fieldType')}</label>
                <Field name='fieldType' component='select' className='form-control'>
                  <option>string</option>
                  <option>integer</option>
                  <option>numeric</option>
                  <option>date</option>
                </Field>
              </div>
              <div className='form-group col-sm-4'>
                <label htmlFor='fieldSize'>{t('configurator.fieldSize')}</label>
                <Field name='fieldSize' component='input' type='number' className='form-control' />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button type='button' className='btn btn-secondary' onClick={handleClose}>
            {t('configurator.close')}
          </button>
          <button className='btn btn-primary'>{t('configurator.save')}</button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default withNamespaces('translation')(reduxForm({ form: 'createObject' })(CreateObjectModal))
