import React from 'react'

export const MemoizedControlGroup = React.memo(
  ({ label, id, type, min, max, step, value, onChange }) => (
    <div className='control-group'>
      <label htmlFor={id}>
        {label}: {value}
      </label>
      <input
        type={type}
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  )
)
