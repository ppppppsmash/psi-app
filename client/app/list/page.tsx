'use client'
import { NextPage } from 'next'
import Link from 'next/link'

import { useEffect, useState } from 'react'
import { PSIDataType } from '@/type'
import Loading from '@/components/Loading'
import AnalysisTableAll from '@/components/Table/AnalysisTableAll'

import { SlScreenSmartphone } from 'react-icons/sl'
import { RiComputerLine } from 'react-icons/ri'
import { urlValidate } from '@/lib/urlValidate'
import { postData, patchData, deleteData, getDataAll, getData } from '@/lib/fetchData'

interface Props extends PSIDataType {}

const page: NextPage<Props> = (): JSX.Element => {
  const [id, setId] = useState<number>(0)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  const [results, setResults] = useState<Props>()
  const [mobileResults, setMobileResults] = useState<Props>()
  const [pageList, setPageList] = useState<Props[]>([])
  const [mobilePageList, setMobilePageList] = useState<Props[]>([])
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'desktop'>('mobile')

  const [visible, setVisible] = useState(false)

  const [loading, setLoading] = useState(false)

  const getChangeUrlName = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    setName(target.value)
  }

  const getChangeUrl = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(target.value)
  }

  const handleDeviceSelection = (device: 'mobile' | 'desktop') => {
    setSelectedDevice(device);
  };

  const date = new Date().toLocaleString()

  const fetchPsiData = async (url: string, device: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}pageSpeedInsights?url=${urlValidate(url)}&strategy=${device}`, {
      cache: 'no-store'
    })
    return res
  }

  const getScoreAgain = async (url: string, index: number, id: number) => {
    setLoading(true)

    const res = await fetchPsiData(url, selectedDevice)

    if (res.ok) {
      const data = await res.json()
      const { result } = data
      const { lighthouseResult } = result
      const { categories } = lighthouseResult
      const { performance } = categories
      const score = performance.score * 100

      const { audits } = lighthouseResult
      const metrics = {
        lcp: audits['largest-contentful-paint'],
        fid: audits['first-input-delay'],
        cls: audits['cumulative-layout-shift'],
        fcp: audits['first-contentful-paint'],
        tbt: audits['total-blocking-time'],
        si: audits['speed-index'],
        fci: audits['first-cpu-idle'],
        eil: audits['estimated-input-latency'],
        fmp: audits['first-meaningful-paint'],
        tti: audits['interactive']
      }

      const psiData = {
        name,
        url,
        date,
        score,
        fcp: metrics.fcp.displayValue,
        lcp: metrics.lcp.numericValue
      }

      selectedDevice === 'desktop'
        ? setResults(prevState => ({ ...prevState, id, url, date, score }))
        : setMobileResults(prevState => ({ ...prevState, id, url, date, score }))

      selectedDevice === 'desktop'
        ? setPageList(prevState =>
          prevState.map((item, idx) => {
            if (index === idx) {
              return { ...item, score: psiData.score, date }
            }
            return item
          })
        )
        : setMobilePageList(prevState =>
          prevState.map((item, idx) => {
            if (index === idx) {
              return { ...item, score: psiData.score, date }
            }
            return item
          })
        )

      await patchData('pageList', id, { score })

      setVisible(true)
      setLoading(false)
    }
  }

  const deleteItem = async (index: number, id: number) => {
    await deleteData('pageList', id)

    setPageList((prevState) => {
      const updatedList = [...prevState];
      updatedList.splice(index, 1);
      return updatedList;
    });
  }

  useEffect(() => {
    const getDataByAll = async () => {
        const data = await getDataAll('pageList')

        setPageList(prevState => {
          const updatedList = data[0].map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.url,
            score: item.score,
            date: item.date
          }))
          return [...prevState, ...updatedList]
        })

    }

    getDataByAll()
  }, [])

  return (
    <div className='w-full mx-auto'>
      <div className='my-6 flex justify-start'>
        <button
          className='w-2/12 bg-gray-900 hover:bg-gray-700 text-white text-sm
          font-bold py-2 px-4 rounded active:bg-gray-500 active:scale-[1]
          duration-150 focus:shadow-outline ease-in-out hover:scale-[0.95]'>
            <Link href='/list/add'>
              ページ登録
            </Link>
        </button>
      </div>
      <div className='mb-5'>
        <h2 className='text-xl text-center font-semibold'>ページ一覧</h2>
      </div>
      <div>
        <section>
          <div>

            <AnalysisTableAll
              pageList={pageList}
              getScoreAgain={getScoreAgain}
              deleteItem={deleteItem}
            />

          </div>
        </section>
      </div>
    </div>
  )
}

export default page