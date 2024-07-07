import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
// import html2canvas from 'html2canvas'
import { DEFAULT_SETTINGS } from './constants'
import { MemoizedControlGroup } from './components/MemoizedControlGroup'
import './App.css'

const FractalGlassEffect = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const [selectedImage, setSelectedImage] = useState(null)
  const wrapperRef = useRef(null)
  const fileInputRef = useRef(null)

  const applyFractalGlassEffect = useCallback(() => {
    if (!wrapperRef.current || !selectedImage) return

    const wrapper = wrapperRef.current
    wrapper.innerHTML = ''

    const {
      steps,
      hue,
      saturation,
      brightness,
      flip,
      shimmer,
      baseFrequency,
      numOctaves,
      scale,
    } = settings
    const hueRotate = `hue-rotate(${hue}deg) saturate(${
      100 + parseInt(saturation)
    }%) brightness(${100 + parseInt(brightness)}%)`

    for (let i = 0; i < steps; i++) {
      const flipStyle = flip && i % 2 === 0 ? 'scaleX(-1)' : 'scaleX(1)'
      const cellWidth =
        (100 / steps) * (1 - (Math.abs(i - steps / 2) / (steps / 2)) * 0.2)

      const cell = document.createElement('div')
      cell.classList.add('cell')
      cell.style.backgroundImage = `url(${selectedImage})`
      cell.style.backgroundPosition = `${(i / steps) * 100}% 50%`
      cell.style.transform = flipStyle
      cell.style.filter = `${hueRotate} url('#displacementFilter')`
      cell.style.width = `${cellWidth}%`

      if (shimmer) {
        const shimmerEl = document.createElement('div')
        shimmerEl.classList.add('shimmer')
        cell.appendChild(shimmerEl)
      }

      wrapper.appendChild(cell)
    }

    // Update the displacement filter
    const filter = document.getElementById('displacementFilter')
    if (filter) {
      const turbulence = filter.querySelector('feTurbulence')
      const displacementMap = filter.querySelector('feDisplacementMap')
      if (turbulence && displacementMap) {
        turbulence.setAttribute('baseFrequency', baseFrequency)
        turbulence.setAttribute('numOctaves', numOctaves)
        displacementMap.setAttribute('scale', scale)
      }
    }
  }, [settings, selectedImage])

  useEffect(() => {
    if (selectedImage) {
      const timer = setTimeout(() => {
        applyFractalGlassEffect()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [applyFractalGlassEffect, selectedImage])

  const handleSettingChange = useCallback((setting, value) => {
    setSettings((prev) => ({ ...prev, [setting]: value }))
  }, [])

  const debouncedApplyEffect = useMemo(() => {
    let timer
    return () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        applyFractalGlassEffect()
      }, 300)
    }
  }, [applyFractalGlassEffect])

  useEffect(() => {
    debouncedApplyEffect()
  }, [settings, debouncedApplyEffect])

  const handleUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // const handleDownloadPng = useCallback(() => {
  //   if (!wrapperRef.current) return

  //   html2canvas(wrapperRef.current).then((canvas) => {
  //     const link = document.createElement('a')
  //     link.download = 'fractal-glass-effect.png'
  //     link.href = canvas.toDataURL()
  //     link.click()
  //   })
  // }, [])

  // const handleDownload = useCallback(() => {
  //   if (!wrapperRef.current || !selectedImage) return

  //   // Create a new SVG element
  //   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  //   svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  //   svg.setAttribute('width', wrapperRef.current.offsetWidth.toString())
  //   svg.setAttribute('height', wrapperRef.current.offsetHeight.toString())

  //   // Clone the displacement filter
  //   const filter = document.getElementById('displacementFilter')
  //   if (filter) {
  //     svg.appendChild(filter.cloneNode(true))
  //   }

  //   // Create an image element within the SVG
  //   const image = document.createElementNS(
  //     'http://www.w3.org/2000/svg',
  //     'image'
  //   )
  //   image.setAttribute('width', '100%')
  //   image.setAttribute('height', '100%')
  //   image.setAttribute('href', selectedImage)
  //   image.style.filter = `url('#displacementFilter') hue-rotate(${
  //     settings.hue
  //   }deg) saturate(${100 + parseInt(settings.saturation)}%) brightness(${
  //     100 + parseInt(settings.brightness)
  //   }%)`

  //   svg.appendChild(image)

  //   // Convert SVG to a data URL
  //   const svgData = new XMLSerializer().serializeToString(svg)
  //   const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  //   const svgUrl = URL.createObjectURL(svgBlob)

  //   // Create a link and trigger download
  //   const link = document.createElement('a')
  //   link.href = svgUrl
  //   link.download = 'fractal-glass-effect.svg'
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)

  //   // Clean up the object URL
  //   URL.revokeObjectURL(svgUrl)
  // }, [selectedImage, settings, wrapperRef])

  return (
    <>
      <div className='page-header'>
        <h1>Fractal Glass Effect</h1>
        <button onClick={triggerFileInput}>Upload Image</button>
        {/* <button onClick={handleDownload} disabled={!selectedImage}>
          Download svg
        </button>
        <button onClick={handleDownloadPng} disabled={!selectedImage}>
          Download png
        </button> */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleUpload}
          accept='image/*'
          style={{ display: 'none' }}
        />
      </div>

      <div className='container'>
        <div className='image-preview' id='imagePreview'>
          {!selectedImage && <p>Please upload an image to see the effect.</p>}
          <div className='wrapper' id='wrapper' ref={wrapperRef}></div>
        </div>

        <div className='controls-panel' id='controlsPanel'>
          <h3>Settings</h3>
          <MemoizedControlGroup
            label='Flip'
            id='flip-toggle'
            type='checkbox'
            checked={settings.flip}
            onChange={(e) => handleSettingChange('flip', e.target.checked)}
          />
          <MemoizedControlGroup
            label='Shimmer'
            id='shimmer-toggle'
            type='checkbox'
            checked={settings.shimmer}
            onChange={(e) => handleSettingChange('shimmer', e.target.checked)}
          />
          <MemoizedControlGroup
            label='Steps'
            id='steps'
            type='range'
            min='12'
            max='64'
            value={settings.steps}
            onChange={(e) =>
              handleSettingChange('steps', parseInt(e.target.value))
            }
          />
          <MemoizedControlGroup
            label='Scale'
            id='scale'
            type='range'
            min='0'
            max='40'
            value={settings.scale}
            onChange={(e) =>
              handleSettingChange('scale', parseInt(e.target.value))
            }
          />
          <MemoizedControlGroup
            label='Frequency'
            id='baseFrequency'
            type='range'
            min='0'
            max='0.2'
            step='0.01'
            value={settings.baseFrequency}
            onChange={(e) =>
              handleSettingChange('baseFrequency', parseFloat(e.target.value))
            }
          />
          <MemoizedControlGroup
            label='Octaves'
            id='numOctaves'
            type='range'
            min='0'
            max='8'
            value={settings.numOctaves}
            onChange={(e) =>
              handleSettingChange('numOctaves', parseInt(e.target.value))
            }
          />
          <h3>Coloring</h3>
          <div id='coloring-options'>
            <MemoizedControlGroup
              label='Hue'
              id='hue'
              type='range'
              min='-180'
              max='180'
              value={settings.hue}
              onChange={(e) =>
                handleSettingChange('hue', parseInt(e.target.value))
              }
            />
            <MemoizedControlGroup
              label='Saturation'
              id='saturation'
              type='range'
              min='-100'
              max='100'
              value={settings.saturation}
              onChange={(e) =>
                handleSettingChange('saturation', parseInt(e.target.value))
              }
            />
            <MemoizedControlGroup
              label='Brightness'
              id='brightness'
              type='range'
              min='-100'
              max='100'
              value={settings.brightness}
              onChange={(e) =>
                handleSettingChange('brightness', parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      <svg width='0' height='0'>
        <filter id='displacementFilter'>
          <feTurbulence
            type='turbulence'
            baseFrequency={settings.baseFrequency}
            numOctaves={settings.numOctaves}
            result='turbulence'
          />
          <feDisplacementMap
            in2='turbulence'
            in='SourceGraphic'
            scale={settings.scale}
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>
    </>
  )
}

export default React.memo(FractalGlassEffect)
