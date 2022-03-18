import type { NextPage } from 'next'
import { Button, Page, Text, Tabs, useTheme, Divider } from '@geist-ui/core'
import Head from 'next/head'

const Home: NextPage = () => {
  const { palette } = useTheme()

  return (
    <Page>
      <Page.Header>
        <div>
          <Text h1>KUTAN - 京大単位取得率</Text>
        </div>
      </Page.Header>
      <Page.Content>

      </Page.Content>
      <Page.Footer>
        <Text p>2022</Text>
      </Page.Footer>
    </Page>
  )
}

export default Home
