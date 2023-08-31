import React from 'react'
import { Row } from 'antd'
import styled from 'styled-components'
import { MdClear } from 'react-icons/md'
import ReactPlayer from 'react-player/lazy'
import { useSafeState, useLocalStorageState } from 'ahooks'

import keys from 'config/keys'

const Video = ({ url }) => {
  const [done, setDone] = useSafeState(false)
  const [videos, setVideos] = useLocalStorageState(keys.VIDEO_GUIDE_DB, {
    defaultValue: [],
    onError: () => {
      localStorage.removeItem(keys.VIDEO_GUIDE_DB)
    }
  })

  const handleClose = () => {
    setDone(true)
    setVideos(prevVideos => [...new Set([...prevVideos, url])])
  }

  if (!url || done || videos.includes(url)) return null

  return (
    <Wrapper>
      <Row justify="end">
        <MdClear size={22} className="close-video-btn" onClick={() => handleClose()} />
      </Row>
      <div className="bg-indigo-50">
        <ReactPlayer url={url} />
      </div>
    </Wrapper>
  )
}

export default React.memo(Video)

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 9;

  .close-video-btn {
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
`
