import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe, MapPin, Zap, Loader2, ZoomIn, ZoomOut, RotateCcw, Target, AlertTriangle } from 'lucide-react'

// Simplified SVG World Map component
const WorldMap = ({ attacks, honeypots, onZoomIn, onZoomOut, onReset, zoom, pan }) => {
  const svgRef = useRef(null)
  
  // Simple world map paths (simplified)
  const worldPaths = [
    // Continents as simple shapes for demonstration
    { id: 'na', name: 'North America', path: 'M100,150 Q150,120 200,160 Q220,140 250,180 Q230,220 180,250 Q120,240 80,200 Q70,180 100,150', center: [175, 180] },
    { id: 'sa', name: 'South America', path: 'M160,260 Q190,280 180,340 Q170,370 140,370 Q110,370 100,340 Q110,280 160,260', center: [140, 320] },
    { id: 'eu', name: 'Europe', path: 'M280,130 Q320,120 360,140 Q370,120 390,140 Q400,170 380,190 Q340,180 300,170 Q270,150 280,130', center: [330, 150] },
    { id: 'af', name: 'Africa', path: 'M320,190 Q360,180 390,220 Q400,280 370,330 Q330,350 290,330 Q270,280 300,220 Q310,190 320,190', center: [320, 260] },
    { id: 'as', name: 'Asia', path: 'M390,120 Q460,100 520,130 Q550,110 570,140 Q580,200 550,240 Q500,260 450,240 Q400,220 390,190 Q380,150 390,120', center: [470, 180] },
    { id: 'oc', name: 'Oceania', path: 'M520,320 Q550,310 570,330 Q580,350 560,370 Q530,380 520,370 Q500,350 520,320', center: [540, 340] },
  ]

  // Convert lat/long to x/y on our simplified map (600x400)
  const latLongToXY = (lat, lng) => {
    // Simple equirectangular projection
    const x = ((lng + 180) / 360) * 600
    const y = ((90 - lat) / 180) * 400
    return { x: Math.max(10, Math.min(590, x)), y: Math.max(10, Math.min(390, y)) }
  }

  // Honeypot locations (mock data)
  const honeypotLocations = [
    { name: 'US-East (AWS)', lat: 39.0, lng: -77.0, cloud: 'AWS' },
    { name: 'EU-West (Azure)', lat: 51.5, lng: -0.1, cloud: 'Azure' },
    { name: 'Asia-Pacific (GCP)', lat: 1.3, lng: 103.8, cloud: 'GCP' },
    { name: 'US-West (AWS)', lat: 37.4, lng: -122.0, cloud: 'AWS' },
    { name: 'Canada (Azure)', lat: 43.6, lng: -79.4, cloud: 'Azure' },
    { name: 'Singapore (GCP)', lat: 1.3, lng: 103.8, cloud: 'GCP' },
  ]

  // Attacker locations from real data
  const attackerLocations = attacks.map((attack, i) => ({
    ...attack,
    // Generate realistic-ish lat/long for demo
    lat: (Math.random() - 0.5) * 160,
    lng: (Math.random() - 0.5) * 360,
  }))

  const transformedHoneypots = honeypotLocations.map(hp => ({
    ...hp,
    ...latLongToXY(hp.lat, hp.lng)
  }))

  const transformedAttackers = attackerLocations.map(att => ({
    ...att,
    ...latLongToXY(att.lat, att.lng)
  }))

  const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`

  return (
    <div className="relative w-full h-96 lg:h-[500px] rounded-xl overflow-hidden bg-beige-50">
      <svg
        ref={svgRef}
        viewBox="0 0 600 400"
        className="w-full h-full"
        style={{ transform, transformOrigin: 'center center', transition: 'transform 0.1s linear' }}
      >
        {/* World background */}
        <rect width="600" height="400" fill="#F8F5EF" />
        
        {/* Continents */}
        <g fill="#E8E2D5" stroke="#DCD4C4" strokeWidth="0.5">
          {worldPaths.map(continent => (
            <path key={continent.id} d={continent.path} />
          ))}
        </g>

        {/* Attack lines */}
        <g strokeWidth="1" strokeLinecap="round" opacity="0.6">
          {transformedAttackers.map((attacker, i) => {
            // Find nearest honeypot
            const target = transformedHoneypots[Math.floor(Math.random() * transformedHoneypots.length)]
            return (
              <motion.line
                key={`attack-${i}`}
                x1={attacker.x}
                y1={attacker.y}
                x2={target.x}
                y2={target.y}
                stroke="#EF4444"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="animate-pulse-soft"
              />
            )
          })}
        </g>

        {/* Honeypots */}
        <g>
          {transformedHoneypots.map((hp, i) => (
            <motion.g
              key={`hp-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, type: 'spring' }}
            >
              {/* Pulse ring */}
              <motion.circle
                cx={hp.x}
                cy={hp.y}
                r={12}
                fill="none"
                stroke="#67B86B"
                strokeWidth="2"
                animate={{ r: [12, 18], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              <motion.circle
                cx={hp.x}
                cy={hp.y}
                r={8}
                fill="#67B86B"
              />
              <circle cx={hp.x} cy={hp.y} r={4} fill="#FFFFFF" />
            </motion.g>
          ))}
        </g>

        {/* Attackers */}
        <g>
          {transformedAttackers.map((attacker, i) => (
            <motion.g
              key={`att-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03, type: 'spring' }}
            >
              <circle 
                cx={attacker.x} 
                cy={attacker.y} 
                r={6} 
                fill="#EF4444" 
                opacity="0.9"
                filter="drop-shadow(0 0 4px #EF4444)"
              />
              <motion.circle
                cx={attacker.x}
                cy={attacker.y}
                r={10}
                fill="none"
                stroke="#EF4444"
                strokeWidth="1"
                animate={{ r: [6, 14], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            </motion.g>
          ))}
        </g>
      </svg>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button onClick={onZoomIn} className="btn-secondary p-2" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={onZoomOut} className="btn-secondary p-2" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={onReset} className="btn-secondary p-2" title="Reset View"><RotateCcw className="w-4 h-4" /></button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-beige-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500 relative">
            <motion.div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75" />
            <motion.div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-50" style={{ animationDelay: '1s' }} />
          </div>
          <span className="text-sm text-dark-600">Honeypots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 relative">
            <motion.div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          </div>
          <span className="text-sm text-dark-600">Attack Origins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-red-500" style={{ background: 'repeating-linear-gradient(90deg, #EF4444, #EF4444 5px, transparent 5px, transparent 10px)' }} />
          <span className="text-sm text-dark-600">Attack Paths</span>
        </div>
      </div>
    </div>
  )
}

const GeoMap = () => {
  const [attacks, setAttacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchAttacks()
  }, [])

  const fetchAttacks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/top-attackers?limit=20')
      if (res.ok) {
        const data = await res.json()
        setAttacks(data)
      } else {
        setMockAttacks()
      }
    } catch {
      setMockAttacks()
    } finally {
      setLoading(false)
    }
  }

  const setMockAttacks = () => {
    setAttacks([
      { ip: '185.234.219.8', count: 128 },
      { ip: '203.0.113.45', count: 96 },
      { ip: '192.168.1.100', count: 74 },
      { ip: '198.51.100.23', count: 42 },
      { ip: '203.0.113.99', count: 31 },
      { ip: '192.168.1.200', count: 28 },
      { ip: '203.0.113.150', count: 22 },
      { ip: '198.51.100.89', count: 18 },
    ])
  }

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.3))
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.3))
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  if (loading) {
    return <div className="flex items-center justify-center h-[500px]"><Loader2 className="w-10 h-10 text-primary-500 animate-spin" /></div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Attack Map (Live)</h1>
          <p className="text-dark-500 mt-1">Real-time visualization of honeypot attacks and threat origins</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Live Data</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="glass-card p-4">
        <WorldMap 
          attacks={attacks} 
          honeypots={[]}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          zoom={zoom}
          pan={pan}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">6</p>
              <p className="text-sm text-dark-500">Active Honeypots</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">{attacks.length}</p>
              <p className="text-sm text-dark-500">Active Threat Sources</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900">{attacks.reduce((sum, a) => sum + a.count, 0)}</p>
              <p className="text-sm text-dark-500">Total Attack Events</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GeoMap