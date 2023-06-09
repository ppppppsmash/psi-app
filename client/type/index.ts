export interface PSIDataType {
  id: number
  name?: string
  url: string
  date?: string
  score: number
  label?: string
  lcp?: string
  fid?: string
  cls?: string
  fcp?: string
  tbt?: string
  si?: string
}

export interface pageList {
  name: string
  url: string
  label: string
  score: string
  date: string
}

export interface Month {
  label: string
  days: number
}