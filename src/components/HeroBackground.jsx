import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

const DARK = { bg: '#080c14', particle: '#00bcd4', particleOpacity: 0.35, pageOpacity: 0.07, lineOpacity: 0.06 }
const LIGHT = { bg: '#f0f7ff', particle: '#0088bb', particleOpacity: 0.45, pageOpacity: 0.12, lineOpacity: 0.10 }

const Scene = ({ themeConfig }) => {
  const { gl } = useThree()
  
  const { resolvedTheme } = useTheme()
  
  // Since our body has the background color, we keep the canvas transparent
  React.useEffect(() => {
    gl.setClearColor(0x000000, 0)
    gl.setClearAlpha(0)
  }, [gl])

  const dotMat = useMemo(() => new THREE.MeshBasicMaterial(), [])
  const lineMat = useMemo(() => new THREE.LineBasicMaterial(), [])
  const pageMat = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), [])

  // Update materials upon theme config change
  React.useEffect(() => {
    dotMat.color.set(themeConfig.particle)
    dotMat.opacity = themeConfig.particleOpacity
    dotMat.transparent = true

    lineMat.color.set(themeConfig.particle)
    lineMat.opacity = themeConfig.lineOpacity
    lineMat.transparent = true

    pageMat.color.set(themeConfig.particle)
    pageMat.opacity = themeConfig.pageOpacity
    pageMat.transparent = true
  }, [themeConfig, dotMat, lineMat, pageMat])

  // Particles / Nodes
  const numNodes = 40
  const nodes = useMemo(() => {
    const pts = []
    for(let i=0; i<numNodes; i++) {
       pts.push({
         pos: new THREE.Vector3((Math.random()-0.5)*25, (Math.random()-0.5)*20, (Math.random()-0.5)*10),
         vel: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02)
       })
    }
    return pts
  }, [])

  const linesGeomRef = useRef(null)
  const groupRef = useRef(null)

  useFrame(() => {
    if(!groupRef.current || !linesGeomRef.current) return
    
    // Animate nodes
    const positions = []
    nodes.forEach(n => {
      n.pos.add(n.vel)
      if(n.pos.x > 12.5 || n.pos.x < -12.5) n.vel.x *= -1
      if(n.pos.y > 10 || n.pos.y < -10) n.vel.y *= -1
      if(n.pos.z > 5 || n.pos.z < -5) n.vel.z *= -1
      positions.push(n.pos)
    })

    // Update lines (connect nearby nodes)
    const linePts = []
    for(let i=0; i<numNodes; i++) {
       for(let j=i+1; j<numNodes; j++) {
          if(nodes[i].pos.distanceTo(nodes[j].pos) < 5) {
             linePts.push(nodes[i].pos)
             linePts.push(nodes[j].pos)
          }
       }
    }
    linesGeomRef.current.setFromPoints(linePts)
    
    // Rotate scene slightly
    groupRef.current.rotation.y += 0.001
    groupRef.current.rotation.x += 0.0005
  })

  // Pages
  const pages = useMemo(() => {
    const pgs = []
    for(let i=0; i<12; i++) {
      pgs.push({
        pos: new THREE.Vector3((Math.random()-0.5)*18, (Math.random()-0.5)*15, (Math.random()-0.5)*8),
        rot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI),
        speed: (Math.random()+0.5)*0.005
      })
    }
    return pgs
  }, [])

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos} material={dotMat}>
          <circleGeometry args={[0.06, 8]} />
        </mesh>
      ))}

      {/* Lines */}
      <lineSegments material={lineMat}>
        <bufferGeometry ref={linesGeomRef} />
      </lineSegments>

      {/* Pages */}
      {pages.map((p, i) => (
        <PageMesh key={i} data={p} material={pageMat} />
      ))}
    </group>
  )
}

const PageMesh = ({ data, material }) => {
  const meshRef = useRef()
  useFrame(() => {
    if(meshRef.current) {
      meshRef.current.rotation.x += data.speed
      meshRef.current.rotation.y += data.speed * 0.8
      meshRef.current.position.y += Math.sin(Date.now()*0.001 + data.pos.x)*0.01
    }
  })
  return (
    <mesh ref={meshRef} position={data.pos} rotation={data.rot} material={material}>
      <planeGeometry args={[1.2, 1.6]} />
    </mesh>
  )
}

export default function HeroBackground() {
  const { resolvedTheme } = useTheme()
  const themeConfig = resolvedTheme === 'dark' ? DARK : LIGHT

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <Scene themeConfig={themeConfig} />
      </Canvas>
    </div>
  )
}
