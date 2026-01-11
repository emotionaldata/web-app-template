import { useState } from 'react'

interface DataPoint {
  period: string
  value: number
}

interface Statistics {
  mean: number
  median: number
  min: number
  max: number
  stdDev: number
  variance: number
  coefficientOfVariation: number
  range: number
}

interface TrendAnalysis {
  slope: number
  intercept: number
  rSquared: number
  stdError: number
  trendDirection: 'increasing' | 'decreasing' | 'stable'
  trendStrength: 'strong' | 'moderate' | 'weak' | 'none'
  percentChangePerPeriod: number
  projectedGrowth: number
}

interface ForecastResult {
  historical: DataPoint[]
  forecast: DataPoint[]
  insights: string[]
  confidence: { lower: number[]; upper: number[] }
  statistics: Statistics
  trend: TrendAnalysis
  anomalies: number[]
}

export default function Forecast() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ForecastResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const parseCSV = (text: string): DataPoint[] => {
    const lines = text.trim().split('\n')
    const data: DataPoint[] = []

    for (let i = 1; i < lines.length; i++) {
      const [period, valueStr] = lines[i].split(',')
      const value = parseFloat(valueStr)
      if (!isNaN(value) && period) {
        data.push({ period: period.trim(), value })
      }
    }
    return data
  }

  const calculateStatistics = (data: DataPoint[]): Statistics => {
    const values = data.map(d => d.value)
    const n = values.length
    const mean = values.reduce((sum, v) => sum + v, 0) / n
    const sortedValues = [...values].sort((a, b) => a - b)
    const median = n % 2 === 0
      ? (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2
      : sortedValues[Math.floor(n / 2)]
    const min = sortedValues[0]
    const max = sortedValues[n - 1]
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1)
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = mean !== 0 ? (stdDev / mean) * 100 : 0
    const range = max - min

    return { mean, median, min, max, stdDev, variance, coefficientOfVariation, range }
  }

  const linearRegression = (data: DataPoint[]): TrendAnalysis => {
    const n = data.length
    const values = data.map(d => d.value)
    const xMean = (n - 1) / 2
    const yMean = values.reduce((sum, v) => sum + v, 0) / n

    let numerator = 0
    let denominator = 0

    data.forEach((d, i) => {
      numerator += (i - xMean) * (d.value - yMean)
      denominator += (i - xMean) ** 2
    })

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean

    // Calculate R-squared
    const predictions = data.map((_, i) => slope * i + intercept)
    const ssRes = data.reduce((sum, d, i) => sum + (d.value - predictions[i]) ** 2, 0)
    const ssTot = data.reduce((sum, d) => sum + (d.value - yMean) ** 2, 0)
    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0

    // Standard error
    const stdError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0

    // Trend analysis
    const percentChangePerPeriod = yMean !== 0 ? (slope / yMean) * 100 : 0
    const projectedGrowth = yMean !== 0 ? ((slope * n) / yMean) * 100 : 0

    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (slope > 0.001) trendDirection = 'increasing'
    else if (slope < -0.001) trendDirection = 'decreasing'

    let trendStrength: 'strong' | 'moderate' | 'weak' | 'none' = 'none'
    if (Math.abs(rSquared) >= 0.7) trendStrength = 'strong'
    else if (Math.abs(rSquared) >= 0.4) trendStrength = 'moderate'
    else if (Math.abs(rSquared) >= 0.2) trendStrength = 'weak'

    return {
      slope,
      intercept,
      rSquared,
      stdError,
      trendDirection,
      trendStrength,
      percentChangePerPeriod,
      projectedGrowth,
    }
  }

  const detectAnomalies = (data: DataPoint[], stats: Statistics): number[] => {
    const anomalies: number[] = []
    const threshold = 2 * stats.stdDev

    data.forEach((d, i) => {
      if (Math.abs(d.value - stats.mean) > threshold) {
        anomalies.push(i)
      }
    })

    return anomalies
  }

  const generateInsights = (
    historical: DataPoint[],
    forecast: DataPoint[],
    stats: Statistics,
    trend: TrendAnalysis,
    anomalies: number[]
  ): string[] => {
    const insights: string[] = []

    // Trend insight
    const trendEmoji = trend.trendDirection === 'increasing' ? '📈' : trend.trendDirection === 'decreasing' ? '📉' : '➡️'
    insights.push(
      `${trendEmoji} ${trend.trendStrength.charAt(0).toUpperCase() + trend.trendStrength.slice(1)} ${trend.trendDirection} trend detected (R² = ${(trend.rSquared * 100).toFixed(1)}% fit)`
    )

    // Growth rate
    if (trend.trendDirection !== 'stable') {
      insights.push(
        `Growth rate: ${trend.percentChangePerPeriod >= 0 ? '+' : ''}${trend.percentChangePerPeriod.toFixed(2)}% per period`
      )
    }

    // Volatility insight
    if (stats.coefficientOfVariation > 30) {
      insights.push(`⚠️ High volatility detected (CV: ${stats.coefficientOfVariation.toFixed(1)}%) - forecasts may be less reliable`)
    } else if (stats.coefficientOfVariation > 15) {
      insights.push(`Moderate volatility (CV: ${stats.coefficientOfVariation.toFixed(1)}%)`)
    } else {
      insights.push(`✓ Low volatility (CV: ${stats.coefficientOfVariation.toFixed(1)}%) - data is relatively stable`)
    }

    // Range and distribution
    insights.push(
      `Historical range: ${stats.min.toFixed(2)} to ${stats.max.toFixed(2)} (spread: ${stats.range.toFixed(2)})`
    )

    // Forecast projection
    const lastHistorical = historical[historical.length - 1].value
    const lastForecast = forecast[forecast.length - 1].value
    const totalChange = ((lastForecast - lastHistorical) / lastHistorical) * 100
    insights.push(
      `Projected ${forecast.length}-period change: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}% (${lastHistorical.toFixed(2)} → ${lastForecast.toFixed(2)})`
    )

    // Anomaly detection
    if (anomalies.length > 0) {
      insights.push(
        `🔍 ${anomalies.length} outlier${anomalies.length > 1 ? 's' : ''} detected at period${anomalies.length > 1 ? 's' : ''}: ${anomalies.map(i => historical[i].period).join(', ')}`
      )
    }

    // Model confidence
    if (trend.rSquared >= 0.7) {
      insights.push('✓ High model confidence - linear trend explains most variance')
    } else if (trend.rSquared >= 0.4) {
      insights.push('Moderate model confidence - consider additional factors')
    } else {
      insights.push('⚠️ Low model confidence - data may be non-linear or highly variable')
    }

    return insights
  }

  const generateForecast = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const historical = parseCSV(text)

      if (historical.length < 3) {
        throw new Error('Need at least 3 data points for analysis')
      }

      const statistics = calculateStatistics(historical)
      const trend = linearRegression(historical)
      const anomalies = detectAnomalies(historical, statistics)

      // Generate 6 forecast periods
      const forecast: DataPoint[] = []
      const lower: number[] = []
      const upper: number[] = []

      for (let i = 0; i < 6; i++) {
        const x = historical.length + i
        const predicted = trend.slope * x + trend.intercept

        // Wider confidence interval for further predictions
        const uncertaintyMultiplier = 1 + (i * 0.1)
        const interval = 1.96 * trend.stdError * uncertaintyMultiplier

        forecast.push({
          period: `Forecast ${i + 1}`,
          value: Math.max(0, predicted)
        })
        lower.push(Math.max(0, predicted - interval))
        upper.push(predicted + interval)
      }

      const insights = generateInsights(historical, forecast, statistics, trend, anomalies)

      setResult({
        historical,
        forecast,
        insights,
        confidence: { lower, upper },
        statistics,
        trend,
        anomalies,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setLoading(false)
    }
  }

  // Calculate chart dimensions
  const getChartData = () => {
    if (!result) return { maxVal: 0, minVal: 0, allData: [] }

    const allValues = [
      ...result.historical.map(d => d.value),
      ...result.forecast.map(d => d.value),
      ...result.confidence.upper,
    ]
    const maxVal = Math.max(...allValues, 1) // Ensure at least 1 to avoid division by zero
    const minVal = Math.min(...allValues.filter(v => v > 0), 0)

    return { maxVal, minVal, allData: [...result.historical, ...result.forecast] }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">Forecasting Tool</h1>
        <p className="text-gray-400 mb-8">Upload historical data for trend analysis, forecasting, and insights.</p>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload Data</h2>
          <p className="text-gray-400 text-sm mb-4">CSV format: period,value (with header row)</p>

          <div className="flex gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1 bg-gray-700 rounded p-2 text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer"
            />
            <button
              onClick={generateForecast}
              disabled={!file || loading}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze & Forecast'}
            </button>
          </div>

          {file && <p className="mt-2 text-sm text-gray-400">Selected: {file.name}</p>}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Statistics Overview */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">2. Statistical Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Mean</div>
                  <div className="text-2xl font-bold text-white">{result.statistics.mean.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Median</div>
                  <div className="text-2xl font-bold text-white">{result.statistics.median.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Std Dev</div>
                  <div className="text-2xl font-bold text-white">{result.statistics.stdDev.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">R² Score</div>
                  <div className={`text-2xl font-bold ${
                    result.trend.rSquared >= 0.7 ? 'text-green-400' :
                    result.trend.rSquared >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(result.trend.rSquared * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">3. Analysis & Insights</h2>
              <ul className="space-y-3">
                {result.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="text-gray-200">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">4. Visualization</h2>

              {/* SVG Chart */}
              <div className="bg-gray-900 rounded-lg p-4">
                <svg viewBox="0 0 800 300" className="w-full h-64">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="50"
                      y1={50 + i * 50}
                      x2="780"
                      y2={50 + i * 50}
                      stroke="#374151"
                      strokeDasharray="4"
                    />
                  ))}

                  {/* Y-axis labels */}
                  {(() => {
                    const { maxVal } = getChartData()
                    return [0, 1, 2, 3, 4].map(i => (
                      <text
                        key={i}
                        x="45"
                        y={55 + i * 50}
                        textAnchor="end"
                        className="fill-gray-400 text-xs"
                      >
                        {(maxVal * (1 - i / 4)).toFixed(0)}
                      </text>
                    ))
                  })()}

                  {/* Confidence interval area */}
                  {(() => {
                    const { maxVal } = getChartData()
                    const totalPoints = result.historical.length + result.forecast.length
                    const barWidth = 700 / totalPoints
                    const startX = 60 + result.historical.length * barWidth

                    const upperPoints = result.confidence.upper.map((v, i) => {
                      const x = startX + i * barWidth + barWidth / 2
                      const y = 250 - (v / maxVal) * 200
                      return `${x},${y}`
                    })
                    const lowerPoints = result.confidence.lower.map((v, i) => {
                      const x = startX + i * barWidth + barWidth / 2
                      const y = 250 - (v / maxVal) * 200
                      return `${x},${y}`
                    }).reverse()

                    return (
                      <polygon
                        points={[...upperPoints, ...lowerPoints].join(' ')}
                        fill="rgba(6, 182, 212, 0.15)"
                        stroke="none"
                      />
                    )
                  })()}

                  {/* Historical bars */}
                  {(() => {
                    const { maxVal } = getChartData()
                    const totalPoints = result.historical.length + result.forecast.length
                    const barWidth = 700 / totalPoints
                    const barPadding = barWidth * 0.1

                    return result.historical.map((d, i) => {
                      const height = maxVal > 0 ? (d.value / maxVal) * 200 : 0
                      const x = 60 + i * barWidth + barPadding
                      const y = 250 - height
                      const isAnomaly = result.anomalies.includes(i)

                      return (
                        <g key={`h-${i}`}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth - barPadding * 2}
                            height={height}
                            fill={isAnomaly ? '#ef4444' : '#3b82f6'}
                            rx="2"
                            className="transition-all hover:opacity-80"
                          />
                          {/* Value label on hover area */}
                          <title>{`${d.period}: ${d.value.toFixed(2)}${isAnomaly ? ' (outlier)' : ''}`}</title>
                        </g>
                      )
                    })
                  })()}

                  {/* Forecast bars */}
                  {(() => {
                    const { maxVal } = getChartData()
                    const totalPoints = result.historical.length + result.forecast.length
                    const barWidth = 700 / totalPoints
                    const barPadding = barWidth * 0.1

                    return result.forecast.map((d, i) => {
                      const height = maxVal > 0 ? (d.value / maxVal) * 200 : 0
                      const x = 60 + (result.historical.length + i) * barWidth + barPadding
                      const y = 250 - height

                      return (
                        <g key={`f-${i}`}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth - barPadding * 2}
                            height={height}
                            fill="#06b6d4"
                            opacity="0.7"
                            rx="2"
                            className="transition-all hover:opacity-100"
                          />
                          {/* Confidence interval lines */}
                          <line
                            x1={x + (barWidth - barPadding * 2) / 2}
                            y1={250 - (result.confidence.lower[i] / maxVal) * 200}
                            x2={x + (barWidth - barPadding * 2) / 2}
                            y2={250 - (result.confidence.upper[i] / maxVal) * 200}
                            stroke="#06b6d4"
                            strokeWidth="2"
                            opacity="0.5"
                          />
                          <title>{`${d.period}: ${d.value.toFixed(2)} (${result.confidence.lower[i].toFixed(2)} - ${result.confidence.upper[i].toFixed(2)})`}</title>
                        </g>
                      )
                    })
                  })()}

                  {/* Trend line */}
                  {(() => {
                    const { maxVal } = getChartData()
                    const totalPoints = result.historical.length + result.forecast.length
                    const barWidth = 700 / totalPoints

                    const startY = 250 - ((result.trend.intercept) / maxVal) * 200
                    const endY = 250 - ((result.trend.slope * (totalPoints - 1) + result.trend.intercept) / maxVal) * 200

                    return (
                      <line
                        x1="60"
                        y1={startY}
                        x2={60 + (totalPoints - 1) * barWidth + barWidth / 2}
                        y2={endY}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="6"
                        opacity="0.8"
                      />
                    )
                  })()}

                  {/* X-axis line */}
                  <line x1="50" y1="250" x2="780" y2="250" stroke="#4b5563" strokeWidth="1" />
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 mt-4 text-sm justify-center">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" /> Historical
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-500 rounded opacity-70" /> Forecast
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" /> Outliers
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }} /> Trend
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-500/20 rounded" /> 95% Confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Forecast Table */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">5. Detailed Forecast</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">Forecast</th>
                      <th className="text-right py-3 px-4">Lower (95%)</th>
                      <th className="text-right py-3 px-4">Upper (95%)</th>
                      <th className="text-right py-3 px-4">Uncertainty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.forecast.map((f, i) => {
                      const uncertainty = ((result.confidence.upper[i] - result.confidence.lower[i]) / f.value) * 100
                      return (
                        <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4 font-medium">{f.period}</td>
                          <td className="py-3 px-4 text-right font-mono text-cyan-400">{f.value.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono text-gray-400">{result.confidence.lower[i].toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono text-gray-400">{result.confidence.upper[i].toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              uncertainty < 20 ? 'bg-green-500/20 text-green-400' :
                              uncertainty < 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              ±{uncertainty.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Data Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-400">6. Historical Data</h2>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-800">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">Value</th>
                      <th className="text-right py-3 px-4">vs Mean</th>
                      <th className="text-right py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.historical.map((d, i) => {
                      const deviation = ((d.value - result.statistics.mean) / result.statistics.mean) * 100
                      const isAnomaly = result.anomalies.includes(i)
                      return (
                        <tr key={i} className={`border-b border-gray-700/50 ${isAnomaly ? 'bg-red-500/10' : 'hover:bg-gray-700/30'}`}>
                          <td className="py-2 px-4">{d.period}</td>
                          <td className="py-2 px-4 text-right font-mono">{d.value.toFixed(2)}</td>
                          <td className={`py-2 px-4 text-right font-mono ${deviation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}%
                          </td>
                          <td className="py-2 px-4 text-right">
                            {isAnomaly && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                Outlier
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
