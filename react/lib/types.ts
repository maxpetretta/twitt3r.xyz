import { BigNumber } from "ethers"

export type Tweet = {
  id: number
  from: string
  timestamp: Date
  message: string
  deleted: boolean
  replyID: BigNumber
  retweetID: BigNumber
}
