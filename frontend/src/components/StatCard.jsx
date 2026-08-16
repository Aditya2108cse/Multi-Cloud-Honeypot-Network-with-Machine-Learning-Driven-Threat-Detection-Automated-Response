import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, GitBranch, ShieldCheck, Globe } from 'lucide-react'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: IconComponent, 
  iconColor = 'text-primary-600',
  bgColor = 'bg-primary-100',
  delay = 0
}) => {
  const isPositive = change >= 0
  const ChangeIcon = isPositive ? TrendingUp : change < 0 ? TrendingDown : Minus
  const changeColor = isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-dark-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card glass-card-hover p-6 animate-fade-in"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-500 mb-1">{title}</p>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
            className="text-3xl lg:text-4xl font-bold text-dark-900 mb-2"
          >
            {value}
          </motion.div>
          <div className="flex items-center gap-1.5">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}
            >
              <ChangeIcon className="w-3.5 h-3.5" />
              {Math.abs(change)}%
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-dark-500"
            >
              {changeLabel}
            </motion.span>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.3 }}
          className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 ${iconColor}`}
        >
          <IconComponent className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default StatCard