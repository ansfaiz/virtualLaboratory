import { useState, useEffect, useCallback } from 'react'

// Generic async data fetcher.
// fetchFn should return the data directly (already unwrapped from response).
// All service callers chain .then(r => r.data) before passing to this hook.
export function useFetch(fetchFn, deps = []) {
  // Initialize data as undefined (not null) so that JS destructuring defaults
  // like `const { data: assignments = [] }` activate during the loading period.
  // With null, JS default destructuring does NOT kick in, causing crashes on
  // array operations (e.g. .filter()) before data is fetched.
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      // Reliably detect a real Axios response: it always has a `config` key.
      // Mock services return plain { data: ... } objects (no `config`).
      // This replaces the old fragile key-count heuristic (<= 3 keys).
      if (result && typeof result === 'object' && 'config' in result && 'data' in result) {
        // Real Axios response — unwrap .data
        setData(result.data)
      } else if (result && typeof result === 'object' && 'data' in result && !('config' in result)) {
        // Mock ok() response — { data: ... } shape, unwrap .data
        setData(result.data)
      } else {
        // Already plain data (service pre-unwrapped via .then(r => r.data))
        setData(result)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}

// Mutation hook for POST/PUT/DELETE
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await mutationFn(...args)
      // Handle both Axios response objects (res.data) and plain returns (mock services)
      return (res && typeof res === 'object' && ('config' in res || ('data' in res && !('config' in res)))) ? res.data : res
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Error occurred'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [mutationFn])

  return { mutate, loading, error, clearError: () => setError(null) }
}

// Debounce hook
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Local storage hook
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback((val) => {
    setValue(val)
    localStorage.setItem(key, JSON.stringify(val))
  }, [key])

  return [value, set]
}
