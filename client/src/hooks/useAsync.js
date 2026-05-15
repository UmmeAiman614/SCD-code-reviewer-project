import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic async data fetcher with loading, error, retry support.
 * @param {Function} asyncFn - async function to call
 * @param {Array} deps - dependency array (re-fetch when these change)
 * @param {Object} options
 */
export function useAsync(asyncFn, deps = [], { immediate = true, onSuccess, onError } = {}) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      const payload = result?.data ?? result
      if (mountedRef.current) {
        setData(payload)
        onSuccess?.(payload)
      }
      return payload
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      if (mountedRef.current) {
        setError(msg)
        onError?.(err)
      }
      throw err
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute()
  }, [execute]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, setData }
}
