import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon } from 'antd'

import './IconCard.css'

const IconCard = ({ onClick, iconName, caption, selected }) => {
  return (
    <div className={classNames('IconCard', { 'IconCard_Selected': selected })} onClick={() => onClick(iconName)}>
      <Icon className='IconCard_Icon' type={iconName} />
      <span className='IconCard_Label'>{caption}</span>
    </div>
  )
}

export default IconCard
