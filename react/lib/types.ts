import { BigNumber } from "ethers"
import { Dispatch, ReactNode, SetStateAction } from "react"

export type Tweet = {
  id: number
  from: string
  timestamp: Date
  message: string
  deleted: boolean
  replyID: BigNumber
  retweetID: BigNumber
}

export type AddressProps = {
  address: string
  styles?: string
  suffix?: string
}

export type AvatarProps = {
  address?: string
  styles?: string
}

export type EditProps = {
  id: number
  address: string
  modal: boolean
  setModal: Dispatch<SetStateAction<boolean>>
  message: string
  setMessage: Dispatch<SetStateAction<string>>
}

export type ReplyProps = {
  id: number
  address: string
  tweet: Tweet
  modal: boolean
  setModal: Dispatch<SetStateAction<boolean>>
}

export type LayoutProps = {
  title?: string
  description?: string
  image?: string
  date?: string
  type?: string
  children?: ReactNode
}

export type TweetProps = {
  id: number
  key: number
  replies: [number, Tweet][]
}

export type ModalProps = {
  address: string
  modal: boolean
  setModal: Dispatch<SetStateAction<boolean>>
}
