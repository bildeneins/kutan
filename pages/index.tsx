import type { GetServerSideProps, NextPage } from 'next'
import {
  Card,
  Divider,
  Grid,
  Input,
  Page,
  Pagination,
  Select,
  Spacer,
  Table,
  Text,
  useInput
} from '@geist-ui/core'
import prisma from '../lib/prisma'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {ChevronLeft, ChevronRight, Search} from '@geist-ui/icons'

interface SubjectWhereInput {
  name?: {
    startsWith: string
  },
  faculty?: {
    id: number
  }
}

export const getServerSideProps
    : GetServerSideProps<{
        subjects: any,
        counts: number,
        faculties: any[]
      }>
    = async ({ query }) => {
  const skip = (query.skip !== undefined) ? parseInt(query.skip as string) : 0
  const where: SubjectWhereInput = {
    name: query.searchQuery ? {
      startsWith: query.searchQuery as string
    } : undefined,
    faculty: query.faculty != undefined && query.faculty != '' ? {
      id: parseInt(query.faculty as string)
    } : undefined
  }
  const subjects = await prisma.subject.findMany({
    skip,
    take: 10,
    include: {
      faculty: true
    },
    where
  })
  const counts = await prisma.subject.count({
    where
  })
  const faculties = await prisma.faculty.findMany()
  return {
    props: {
      subjects,
      counts,
      faculties
    }
  }
}

const Home: NextPage<{ subjects: any, counts: number, faculties: any[] }> = ({ subjects, counts, faculties }: { subjects: any, counts: number, faculties: any[] }) => {
  const router = useRouter()
  const [skipNum, setSkipNum] = useState(0)
  const [faculty, setFaculty] = useState<undefined | { id: number, name: string }>(undefined)
  const {
    state: searchQuery,
    bindings
  } = useInput('')

  const paginationNum = Math.ceil(counts / 10)

  const formattedSubjects = subjects.map((i: any) => {
    return {
      id: i.id,
      name: i.name,
      facultyName: i.faculty.name,
      percentage: Math.floor(1000 * i.earnSum / i.registerSum) / 10
    }
  })

  const pushRoute = async ({
      newFaculty,
      newSearchQuery,
      newSkipNum
  }: {
    newFaculty?: { id: number, name: string } | undefined,
    newSearchQuery?: string,
    newSkipNum?: number
  }) => {
    await router.push({
      pathname: "/",
      query: {
        skip: newSkipNum !== undefined ? newSkipNum : skipNum,
        searchQuery: newSearchQuery ? newSearchQuery : searchQuery,
        faculty: newFaculty ? newFaculty.id
                            : faculty ? faculty.id : undefined
      }
    })
  }

  const search = async () => {
    const newSkipNum = 0
    setSkipNum(newSkipNum)
    await pushRoute({ newSkipNum })
  }

  const onChangePage = async (val: number) => {
    const newSkipNum = 10 * (val - 1)
    setSkipNum(newSkipNum)
    await pushRoute({ newSkipNum })
  }

  // val: 'all' | '0' | '1' | ...
  const handleSelect = (val: string | string[]) => {
    const faculty: { id: number, name: string } | undefined = val === 'all' ? undefined
                      : faculties.find((f: any) => f.id.toString() === val)
    setFaculty(faculty)
    setSkipNum(0)
    pushRoute({ newSkipNum: 0, newFaculty: faculty ? faculty : undefined })
  }

  return (
    <Page
        width="100%"
        dotBackdrop={true}
        dotSize="2px"
        dotSpace={.5}
    >
      <Page.Header>
        <Text h2>
          <span style={{display: "inline-block"}}>KUTAN</span>
          <span style={{display: "inline-block"}}>- 京大単位取得率</span>
        </Text>
      </Page.Header>
      <Divider />
      <Page.Content
          pt={.5}
      >
        <Input
            placeholder={'科目名を検索...'}
            scale={1.5}
            {...bindings}
            iconRight={<Search />}
            iconClickable={true}
            onIconClick={search}
        />
        <Spacer h={1} />
        <Select
            scale={1.5}
            placeholder={'開講部局'}
            onChange={handleSelect}
        >
          <Select.Option value={'all'}>全て</Select.Option>
          {
            faculties.map((faculty: any) => {
              return (
                  <Select.Option
                      value={faculty.id.toString()}
                      key={faculty.id}
                  >
                    {faculty.name}
                  </Select.Option>
              )
            })
          }
        </Select>
        <Text p>
          {counts} 件中{formattedSubjects.length}件を表示
        </Text>
        <Card>
          <Table data={formattedSubjects}>
            <Table.Column prop="name" label="講義名" />
            <Table.Column prop="facultyName" label="開講部局" />
            <Table.Column prop="percentage" label="単位取得率"
                          render={(value: any) => {
                            return (<>{value.toString()}%</>)
                          }}
            />
          </Table>
        </Card>
        <Spacer h={1}/>
        <Grid.Container justify="center">
          <Grid>
            <Pagination
                count={paginationNum}
                onChange={onChangePage}
            >
              <Pagination.Next>
                <ChevronRight />
              </Pagination.Next>
              <Pagination.Previous>
                <ChevronLeft />
              </Pagination.Previous>
            </Pagination>
          </Grid>
        </Grid.Container>
      </Page.Content>
      <Page.Footer>
        <Text p>2022</Text>
      </Page.Footer>
    </Page>
  )
}

export default Home
