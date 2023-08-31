import Axios from 'axios'
import { Avatar, List } from 'antd'
import { useSelector } from 'react-redux'
import { LinkOutlined } from '@ant-design/icons'
import { useMount, useBoolean, useSafeState } from 'ahooks'

import endpoints from 'config/endpoints'
import { Page } from 'components/micro/Common'
import handleError from 'helpers/handleError'
import { renderLoading } from 'helpers/utility'

const PR = () => {
  const { user } = useSelector(state => state.auth)
  const [loading, { set: setLoading }] = useBoolean(true)
  const [userInfo, setUserInfo] = useSafeState(null)

  const getData = async () => {
    try {
      setLoading(true)
      const { data } = await Axios.get(endpoints.client(user.id))
      setUserInfo(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  useMount(() => getData())

  if (loading) return renderLoading()

  return (
    <>
      <Page>
        <h2 className="mb-1">Current Published PR By Bidwaves</h2>
        <p className="mb-4">Here is a list of publications and URLS that we have published on your behalf.</p>
        <List
          bordered={true}
          size="small"
          className="bg-white"
          itemLayout="horizontal"
          dataSource={userInfo.published_pr ?? []}
          renderItem={(item, i) => (
            <List.Item
              key={i}
              className="cursor-pointer hover:bg-[--body-bg-color]"
              onClick={() => window.open(item.link, '_blank')}
            >
              <List.Item.Meta
                style={{ alignItems: 'center' }}
                avatar={<Avatar icon={<LinkOutlined />} />}
                title={
                  <a target="_blank" href={item.link} rel="noreferrer">
                    {item.title}
                  </a>
                }
                description={item.comment ?? ''}
              />
            </List.Item>
          )}
        />
      </Page>
    </>
  )
}

export default PR
