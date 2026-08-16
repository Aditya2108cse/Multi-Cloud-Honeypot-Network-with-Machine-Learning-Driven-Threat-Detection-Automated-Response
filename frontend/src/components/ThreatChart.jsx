import { useEffect, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { ChevronDown, Clock } from 'lucide-react'

const ThreatChart = ({ data }) => {
  const [timeRange, setTimeRange] = useState('24h')
  const [chartData, setChartData] = useState(data || generateMockData())
  const animationRef = useRef(false)

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ]

  useEffect(() => {
    if (data && data.length > 0 && data.some(d => d.alerts > 5 || d.correlated_threats > 2)) {
      setChartData(data)
    } else {
      setChartData(generateMockData(timeRange))
    }
  }, [data, timeRange])

  function generateMockData(range = '24h') {
    const now = new Date()
    const result = []
    let points = 24
    let intervalMs = 60 * 60 * 1000 // 1 hour
    let formatOptions = { hour: '2-digit', minute: '2-digit' }

    if (range === '1h') {
      points = 12
      intervalMs = 5 * 60 * 1000
    } else if (range === '6h') {
      points = 12
      intervalMs = 30 * 60 * 1000
    } else if (range === '7d') {
      points = 7
      intervalMs = 24 * 60 * 60 * 1000
      formatOptions = { month: 'short', day: 'numeric' }
    } else if (range === '30d') {
      points = 15
      intervalMs = 2 * 24 * 60 * 60 * 1000
      formatOptions = { month: 'short', day: 'numeric' }
    }

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMs)
      const baseAlerts = 25 + Math.sin(i * 0.4) * 15 + Math.random() * 10
      const baseThreats = 8 + Math.sin(i * 0.6) * 5 + Math.random() * 4
      result.push({
        time: timestamp.toLocaleTimeString('en-US', formatOptions),
        alerts: Math.round(Math.max(5, baseAlerts)),
        correlated_threats: Math.round(Math.max(2, baseThreats)),
      })
    }
    return result
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-lg border border-beige-200 p-3">
          <p className="text-sm font-medium text-dark-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-dark-600">{entry.name}: </span>
              <span className="font-medium text-dark-900">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900">Threat Activity</h3>
        </div>
        
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-beige-100 border border-beige-200 rounded-lg text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 cursor-pointer"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D5" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#737A74"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={timeRange === '1h' ? 0 : timeRange === '6h' ? 0 : 2}
            />
            <YAxis
              stroke="#737A74"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={customTooltip} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => value === 'alerts' ? 'Alerts' : 'Correlated Threats'}
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="alerts"
              stroke="#67B86B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={animationRef.current ? 1000 : 0}
              animationEasing="easeOut"
            />
            <Line
              type="monotone"
              dataKey="correlated_threats"
              stroke="#D0C8B3"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={animationRef.current ? 1200 : 0}
              animationEasing="easeOut"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-beige-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm text-dark-600">Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-beige-400" />
          <span className="text-sm text-dark-600">Correlated Threats</span>
        </div>
      </div>
    </motion.div>
  )
}

export default ThreatChart