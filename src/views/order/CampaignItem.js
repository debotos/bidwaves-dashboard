import { Card } from 'antd'
import React from 'react'

function CampaignItem({ item }) {
  return (
    <>
      <Card>{item.name}</Card>
    </>
  )
}

export default CampaignItem
