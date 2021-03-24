import React, { useState, useMemo, useEffect } from 'react'
import { StaticMap } from 'react-map-gl'
import DeckGL from '@deck.gl/react'

import MovingIconLayer from '@/layers/moving-icons/moving-icon-layer'

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
  info: { x: 128, y: 0, width: 128, height: 128, mask: true },
  vehicle: { x: 128, y: 128, width: 128, height: 128, mask: false },
  diamond: { x: 0, y: 128, width: 128, height: 128, mask: false },
}

// Set your mapbox token here
const MAPBOX_TOKEN =
  'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'
// process.env.MapboxAccessToken // eslint-disable-line

const DEFAULT_THEME = {
  vehicleColor: [200, 130, 250],
  trailColor0: [235, 235, 25],
  trailColor1: [23, 184, 190],
}

const INITIAL_VIEW_STATE = {
  latitude: 52.1,
  longitude: 13.45,
  zoom: 10,
  pitch: 0,
  minZoom: 2,
  maxZoom: 22,
}

const DRT_REQUEST = {
  time: 0,
  fromX: 1,
  fromY: 2,
  toX: 3,
  toY: 4,
  veh: 5,
  arrival: 6,
}

export default function Component(props: {
  simulationTime: number
  paths: any[]
  colors: any
  center: [number, number]
  settingsShowLayers: { [label: string]: boolean }
  vehicleLookup: string[]
  searchEnabled: boolean
  onClick: any
}) {
  const mapStyle = 'mapbox://styles/mapbox/dark-v9'

  // 'mapbox://styles/vsp-tu-berlin/ckek59op0011219pbwfar1rex'
  // const mapStyle = 'mapbox://styles/vsp-tu-berlin/ckeetelh218ef19ob5nzw5vbh'
  // mapStyle = "mapbox://styles/mapbox/dark-v10",

  const { simulationTime, paths, center, vehicleLookup, searchEnabled, onClick } = props

  const theme = DEFAULT_THEME

  const initialView = Object.assign({}, INITIAL_VIEW_STATE)
  initialView.latitude = center[1]
  initialView.longitude = center[0]

  const [hoverInfo, setHoverInfo] = useState({} as any)

  const layers: any = []

  function handleClick() {
    console.log(hoverInfo)
    // send null as message that blank area was clicked
    if (!hoverInfo.object) {
      onClick(null)
    } else {
      onClick(hoverInfo.object.v)
    }
  }

  function renderTooltip({ hoverInfo }: any) {
    return null

    // const { object, x, y } = hoverInfo

    // if (!object) {
    //   return null
    // }

    // const vehicleId = vehicleLookup[object.v]

    // return (
    //   <div
    //     className="tooltip"
    //     style={{
    //       fontSize: '0.8rem',
    //       backgroundColor: '#ddddeedd',
    //       borderLeft: '6px solid green',
    //       boxShadow: '2.5px 2px 4px rgba(0,0,0,0.25)',
    //       color: '#223',
    //       padding: '1rem 1rem',
    //       position: 'absolute',
    //       left: x + 40,
    //       top: y - 30,
    //     }}
    //   >
    //     <big>
    //       <b>Taxi: {vehicleId}</b>
    //     </big>
    //     <div>Passagiere: {object.occ} </div>
    //   </div>
    // )
  }

  layers.push(
    //@ts-ignore
    new MovingIconLayer({
      id: 'Agents',
      data: paths,
      getTimeStart: (d: any) => d[0],
      getTimeEnd: (d: any) => d[1],
      getPathStart: (d: any) => d[2],
      getPathEnd: (d: any) => d[3],
      getIcon: (d: any) => 'vehicle',
      getColor: (d: any) => [255, 0, 0], // props.colors[d.occ],
      iconMoving: 'vehicle',
      iconStill: 'diamond',
      getSize: searchEnabled ? 56 : 44,
      opacity: 1.0,
      currentTime: simulationTime,
      shadowEnabled: false,
      noAlloc: true,
      iconAtlas: '/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      sizeScale: 1,
      billboard: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 0, 255],
      onHover: setHoverInfo,
    })
  )

  return (
    <DeckGL
      layers={layers}
      pickingRadius={5}
      initialViewState={initialView}
      controller={true}
      getCursor={() => 'pointer'}
      onClick={handleClick}
    >
      {
        /*
        // @ts-ignore */
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      }
      {renderTooltip({ hoverInfo })}
    </DeckGL>
  )
}
