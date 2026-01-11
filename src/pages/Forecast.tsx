import { useState } from 'react'

interface DataPoint {
  period: string
  value: number
}

interface ForecastResult {
  historical: DataPoint[]
  forecast: DataPoint[]
  insights: string[]
  confidence: { lower: number[]; upper: number[] }
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
      if (!isNaN(value)) {
        data.push({ period: period.trim(), value })
      }
    }
    return data
  }

  const linearRegression = (data: DataPoint[]) => {
    const n = data.length
    const xMean = (n - 1) / 2
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / n

    let numerator = 0
    let denominator = 0

    data.forEach((d, i) => {
      numerator += (i - xMean) * (d.value - yMean)
      denominator += (i - xMean) ** 2
    })

    const slope = numerator / denominator
    const intercept = yMean - slope * xMean

    const residuals = data.map((d, i) => d.value - (slope * i + intercept))
    const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r ** 2, 0) / (n - 2))

    return { slope, intercept, stdError }
  }

  const generateForecast = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const historical = parseCSV(text)

      if (historical.length < 3) {
        throw new Error('Need at least 3 data points')
      }

      const { slope, intercept, stdError } = linearRegression(historical)

      // Generate 6 forecast periods
      const forecast: DataPoint[] = []
      const lower: number[] = []
      const upper: number[] = []

      for (let i = 0; i < 6; i++) {
        const x = historical.length + i
        const predicted = slope * x + intercept
        forecast.push({
          period: `Period ${x + 1}`,
          value: Math.max(0, predicted)
        })
        lower.push(Math.max(0, predicted - 1.96 * stdError))
        upper.push(predicted + 1.96 * stdError)
      }

      // Generate insights
      const insights: string[] = []
      const avgValue = historical.reduce((sum, d) => sum + d.value, 0) / historical.length
      const trend = slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'stable'

      insights.push(`Data shows ${trend} trend with ${Math.abs(slope).toFixed(2)} change per period`)
      insights.push(`Average historical value: ${avgValue.toFixed(2)}`)
      insights.push(`Forecast range: ${forecast[0].value.toFixed(2)} to ${forecast[5].value.toFixed(2)}`)

      if (Math.abs(slope) > avgValue * 0.1) {
        insights.push('Significant trend detected - monitor closely')
      }

      setResult({
        historical,
        forecast,
        insights,
        confidence: { lower, upper }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">Forecasting Tool</h1>
        <p className="text-gray-400 mb-8">Upload historical data, get forecasts with confidence intervals and insights.</p>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload Data</h2>
          <p className="text-gray-400 text-sm mb-4">CSV format: period,value (one header row)</p>

          <div className="flex gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1 bg-gray-700 rounded p-2 text-sm"
            />
            <button
              onClick={generateForecast}
              disabled={!file || loading}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded font-medium transition-colors"
            >
              {loading ? 'Processing...' : 'Generate Forecast'}
            </button>
          </div>

          {file && <p className="mt-2 text-sm text-gray-400">Selected: {file.name}</p>}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Insights */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">2. Insights</h2>
              <ul className="space-y-2">
                {result.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Forecast Table */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">3. Forecast (with 95% confidence)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3">Period</th>
                      <th className="text-right py-2 px-3">Forecast</th>
                      <th className="text-right py-2 px-3">Lower Bound</th>
                      <th className="text-right py-2 px-3">Upper Bound</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.forecast.map((f, i) => (
                      <tr key={i} className="border-b border-gray-700/50">
                        <td className="py-2 px-3">{f.period}</td>
                        <td className="py-2 px-3 text-right font-mono text-cyan-400">{f.value.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-400">{result.confidence.lower[i].toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-400">{result.confidence.upper[i].toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">4. Visualization</h2>
              <div className="h-64 flex items-end gap-1 bg-gray-900 rounded p-4">
                {/* Historical bars */}
                {result.historical.map((d, i) => {
                  const maxVal = Math.max(...result.historical.map(h => h.value), ...result.forecast.map(f => f.value))
                  const height = (d.value / maxVal) * 100
                  return (
                    <div
                      key={`h-${i}`}
                      className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                      style={{ height: `${height}%` }}
                      title={`${d.period}: ${d.value.toFixed(2)}`}
                    />
                  )
                })}
                {/* Forecast bars */}
                {result.forecast.map((d, i) => {
                  const maxVal = Math.max(...result.historical.map(h => h.value), ...result.forecast.map(f => f.value))
                  const height = (d.value / maxVal) * 100
                  return (
                    <div
                      key={`f-${i}`}
                      className="flex-1 bg-cyan-500 rounded-t opacity-70 transition-all hover:opacity-100"
                      style={{ height: `${height}%` }}
                      title={`${d.period}: ${d.value.toFixed(2)} (forecast)`}
                    />
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" /> Historical
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-500 rounded opacity-70" /> Forecast
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
