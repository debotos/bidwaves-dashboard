import Axios from 'axios'
import { useEffect } from 'react'
import { Row, Select, Skeleton, Spin } from 'antd'
import { useDebounceEffect, useSafeState } from 'ahooks'

import handleError from 'helpers/handleError'
import { isEmpty, sleep } from 'helpers/utility'

export const genericSearchOptionsFunc = async (_ep, searchText, config) => {
  try {
    const { searchField = 'label', sortByQuery = 'order@asc', optionPropsOverrideCb } = config || {}
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
    return res.list.map(option => {
      const overrideOptionProps = optionPropsOverrideCb ? optionPropsOverrideCb(option) : {}
      return {
        ...option,
        label: option.label ?? option.name ?? option.tag?.label,
        key: option.id,
        value: option.id,
        ...overrideOptionProps
      }
    })
  } catch (error) {
    handleError(error, true)
  }
}

const AsyncSelect = ({
  minSearchCharCount,
  handleGetOptions,
  onlyFetchOnSearch,
  onlyInitialSearch = false,
  defaultSelectFirstOption = false,
  firstCustomOption,
  lastCustomOption,
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
    if (!isEmpty(firstCustomOption)) results.unshift(firstCustomOption)
    if (!isEmpty(lastCustomOption)) results.push(lastCustomOption)
    setOptions(results)
    await sleep(500)
    if (defaultSelectFirstOption && results.length) {
      rest.onChange(results[0].value, results[0])
    }
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

  if (isInitialLoad && loading)
    return <Skeleton.Input active={true} block={true} size={rest.size || undefined} style={rest.style ?? undefined} />

  const getShowArrow = () => {
    if (!onlyFetchOnSearch) return undefined
    if (options.length) return undefined
    return null
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
      suffixIcon={getShowArrow()}
      onDropdownVisibleChange={onDropdownVisibleChange}
      notFoundContent={getNotFoundContent()}
      onClear={() => rest.onChange(null)}
      defaultValue={defaultSelectFirstOption && options.length ? options[0].value : undefined}
      {...rest}
    />
  )
}

export default AsyncSelect
