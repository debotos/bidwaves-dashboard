import Axios from 'axios'
import { useEffect } from 'react'
import { Row, Select, Skeleton, Spin } from 'antd'
import { useDebounceEffect, useSafeState } from 'ahooks'

import handleError from 'helpers/handleError'
import { sleep } from 'helpers/utility'

export const genericSearchOptionsFunc = async (_ep, searchText, config) => {
  try {
    const { searchField = 'label', sortByQuery = 'order@asc' } = config || {}
    // For pagination | After this portion '?' is always present
    const paginationQuery = `all=true`
    const paginationQueryPrefix = _ep.includes('?') ? '&' : '?'
    _ep += paginationQueryPrefix + paginationQuery

    // For filters
    if (searchText) {
      _ep += `&${searchField}=${encodeURIComponent(searchText)}`
    }

    // For sorting
    if (sortByQuery) {
      const [order, sort] = sortByQuery.split('@')
      _ep += `&order=${order}&sort=${sort}`
    }

    const req = await Axios.get(_ep)
    const res = req.data
    window.log(`Data response -> `, res)
    return res.list.map(option => ({ ...option, key: option.id, value: option.id }))
  } catch (error) {
    handleError(error, true)
  }
}

const AsyncSelect = ({
  minSearchCharCount,
  handleGetOptions,
  onlyFetchOnSearch,
  onlyInitialSearch = false,
  ...rest
}) => {
  const [options, setOptions] = useSafeState([])
  const [loading, setLoading] = useSafeState(!onlyFetchOnSearch)
  const [searchTerm, setSearchTerm] = useSafeState('')
  const [isApiCalled, setIsApiCalled] = useSafeState(false)
  const [isInitialLoad, setIsInitialLoad] = useSafeState(!onlyFetchOnSearch)

  const isCountOk = minSearchCharCount ? searchTerm.length > minSearchCharCount : true

  const fetchOptions = async () => {
    if (!isCountOk) return
    setLoading(true)
    const results = await handleGetOptions(searchTerm)
    setOptions(results)
    await sleep(500)
    setLoading(false)
    setIsApiCalled(true)
    setIsInitialLoad(false)
  }

  useEffect(() => {
    !searchTerm && !onlyFetchOnSearch && fetchOptions()
  }, [searchTerm])

  useDebounceEffect(
    () => {
      searchTerm && fetchOptions()
    },
    [searchTerm],
    { wait: 300 }
  )

  const handleSearch = async query => setSearchTerm(query)

  const onDropdownVisibleChange = open => {
    if (!open && searchTerm) setSearchTerm('')
  }

  const onSearch = onlyInitialSearch ? undefined : handleSearch

  if (isInitialLoad && loading) return <Skeleton.Input active={true} block={true} />

  const getShowArrow = () => {
    if (!onlyFetchOnSearch) return true
    if (options.length) return true
    return false
  }

  const handleBlur = () => {
    if (onlyFetchOnSearch) {
      setOptions([])
    }
  }

  const getNotFoundContent = () => {
    if (onlyFetchOnSearch && !searchTerm) return null
    if (!isCountOk || !isApiCalled) return null

    if (loading) {
      return (
        <Row justify="center">
          <Spin className="my-3" />
        </Row>
      )
    } else return undefined
  }

  return (
    <Select
      options={options}
      loading={loading}
      onSearch={onSearch}
      onBlur={handleBlur}
      showArrow={getShowArrow()}
      onDropdownVisibleChange={onDropdownVisibleChange}
      notFoundContent={getNotFoundContent()}
      {...rest}
    >
      {options.map(option => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  )
}

export default AsyncSelect
