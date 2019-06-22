import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { withNamespaces } from 'react-i18next'

let ClientInfoForm = props => {
  const { handleSubmit, t } = props
  return (
    <form onSubmit={handleSubmit}>
      <section className='info'>
        <div className='form-group'>
          <label htmlFor='name'>{t('client.name')}</label>
          <Field name='name' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label className='control-label'>{t('client.login')}</label>
          <Field name='login' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='phone'>{t('client.phone')}</label>
          <Field name='phone' component='input' type='tel' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='url'>{t('client.web')}</label>
          <Field name='url' component='input' type='url' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='address'>{t('client.address')}</label>
          <Field name='address' component='input' type='text' className='form-control' />
        </div>
      </section>
      <hr />
      <section className='windfarm'>
        <div className='form-group'>
          <label htmlFor='windFarmCode'>{t('client.windFarmCode')}</label>
          <Field name='windFarmCode' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmCoord'>{t('client.windFarmCoord')}</label>
          <Field name='windFarmCoord' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmManufacturer'>{t('client.windFarmManufacturer')}</label>
          <Field name='windFarmManufacturer' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmConnectDate'>{t('client.windFarmConnectDate')}</label>
          <Field name='windFarmConnectDate' component='input' type='date' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmOperator'>{t('client.windFarmOperator')}</label>
          <Field name='windFarmOperator' component='input' type='text' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmServiceDate'>{t('client.windFarmServiceDate')}</label>
          <Field name='windFarmServiceDate' component='input' type='date' className='form-control' />
        </div>
        <div className='form-group'>
          <label htmlFor='windFarmDescription'>{t('client.windFarmDescription')}</label>
          <Field name='windFarmDescription' component='input' type='text' className='form-control' />
        </div>
      </section>
      <button className='btn btn-primary'>{t('client.save')}</button>
    </form>
  )
}

ClientInfoForm = reduxForm({ form: 'clientInfo' })(ClientInfoForm)

export default withNamespaces('translation')(ClientInfoForm)
